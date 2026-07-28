import supabase from '../config/supabaseClient.js';

// @desc    Get all blood requests
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res, next) => {
  try {
    const { status, bloodGroup, priority, page = 1, limit = 10 } = req.query;
    
    let query = supabase.from('requests').select(`
      *,
      hospitals!inner(
        id,
        users!inner(name, email)
      )
    `, { count: 'exact' });

    if (req.user.role === 'hospital') {
      const { data: hospital } = await supabase.from('hospitals').select('id').eq('user_id', req.user._id).maybeSingle();
      if (hospital) {
        query = query.eq('hospital_id', hospital.id);
      } else {
        return res.json({ success: true, requests: [], totalRequests: 0, totalPages: 0, currentPage: Number(page) });
      }
    }

    if (status) query = query.eq('status', status);
    if (bloodGroup) query = query.eq('blood_group', bloodGroup);
    if (priority) query = query.eq('priority', priority);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    const { data: requests, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) throw error;

    const mappedRequests = requests.map(r => ({
      ...r,
      _id: r.id,
      patientName: r.patient_name,
      bloodGroup: r.blood_group,
      requiredDate: r.required_date,
      rejectionReason: r.rejection_reason,
      hospitalId: {
        _id: r.hospitals.id,
        userId: {
          _id: r.hospitals.users?.id,
          name: r.hospitals.users?.name,
          email: r.hospitals.users?.email
        }
      }
    }));

    res.json({
      success: true,
      requests: mappedRequests,
      totalRequests: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blood request from hospital
// @route   POST /api/requests
// @access  Private (Hospital, Admin)
export const createRequest = async (req, res, next) => {
  try {
    const { patientName, bloodGroup, units, priority, requiredDate, reason } = req.body;
    let hospitalId = req.body.hospitalId;

    if (req.user.role === 'hospital') {
      const { data: hospital } = await supabase.from('hospitals').select('id').eq('user_id', req.user._id).maybeSingle();
      if (!hospital) return res.status(400).json({ success: false, message: 'Hospital profile not found' });
      hospitalId = hospital.id;
    }

    const { data: bloodRequest, error } = await supabase
      .from('requests')
      .insert({
        hospital_id: hospitalId,
        patient_name: patientName,
        blood_group: bloodGroup,
        units: Number(units),
        priority: priority || 'Normal',
        required_date: new Date(requiredDate).toISOString(),
        reason: reason || '',
        status: 'Pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Notify admins
    await supabase.from('notifications').insert({
      title: 'New Blood Request',
      message: `Hospital requested ${units} units of ${bloodGroup} for patient ${patientName} (Priority: ${priority || 'Normal'}).`,
      receiver_role: 'admin',
      type: 'RequestStatus'
    });

    bloodRequest._id = bloodRequest.id;
    res.status(201).json({ success: true, request: bloodRequest });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blood request status (Pending -> Approved -> Allocated -> Completed / Rejected)
// @route   PUT /api/requests/:id/status
// @access  Private (Admin, Super Admin)
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const { data: requestDoc, error: reqErr } = await supabase
      .from('requests')
      .select('*, hospitals!inner(user_id)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!requestDoc || reqErr) return res.status(404).json({ success: false, message: 'Request not found' });

    if (status === 'Allocated' || status === 'Approved') {
      const { data: availableBatches } = await supabase
        .from('inventories')
        .select('*')
        .eq('blood_group', requestDoc.blood_group)
        .eq('status', 'Available')
        .order('expiry_date', { ascending: true });

      const totalAvailable = (availableBatches || []).reduce((acc, item) => acc + Number(item.units), 0);

      if (totalAvailable < requestDoc.units) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Required: ${requestDoc.units} units of ${requestDoc.blood_group}, Available: ${totalAvailable} units`
        });
      }

      if (status === 'Allocated') {
        let remainingNeeded = Number(requestDoc.units);
        for (const batch of (availableBatches || [])) {
          if (remainingNeeded <= 0) break;

          const batchUnits = Number(batch.units);
          if (batchUnits <= remainingNeeded) {
            remainingNeeded -= batchUnits;
            await supabase.from('inventories').update({ status: 'Reserved' }).eq('id', batch.id);
          } else {
            const remainingInBatch = batchUnits - remainingNeeded;
            await supabase.from('inventories').update({ units: remainingInBatch }).eq('id', batch.id);

            await supabase.from('inventories').insert({
              blood_group: batch.blood_group,
              units: remainingNeeded,
              collection_date: batch.collection_date,
              expiry_date: batch.expiry_date,
              batch_number: `${batch.batch_number}-RES`,
              status: 'Reserved'
            });

            remainingNeeded = 0;
          }
        }
      }
    }

    const updates = { status };
    if (rejectionReason) updates.rejection_reason = rejectionReason;

    const { data: updatedRequest, error: updateErr } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', requestDoc.id)
      .select()
      .single();
      
    if (updateErr) throw updateErr;

    if (requestDoc.hospitals && requestDoc.hospitals.user_id) {
      await supabase.from('notifications').insert({
        title: `Blood Request ${status}`,
        message: `Your request for ${requestDoc.units} units of ${requestDoc.blood_group} has been updated to ${status}.`,
        receiver: requestDoc.hospitals.user_id,
        type: 'RequestStatus'
      });
    }

    updatedRequest._id = updatedRequest.id;
    res.json({ success: true, request: updatedRequest });
  } catch (error) {
    next(error);
  }
};
