import supabase from '../config/supabaseClient.js';

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private
export const getDonations = async (req, res, next) => {
  try {
    const { status, bloodGroup, page = 1, limit = 10 } = req.query;
    
    let query = supabase.from('donations').select(`
      *,
      donors!inner(
        id,
        users!inner(name, email)
      ),
      staff_id (id, name, email),
      camps (id, camp_name, venue)
    `, { count: 'exact' });

    if (req.user.role === 'donor') {
      const { data: donor } = await supabase.from('donors').select('id').eq('user_id', req.user._id).maybeSingle();
      if (donor) {
        query = query.eq('donor_id', donor.id);
      } else {
        // If they are a donor but have no donor profile, return empty
        return res.json({ success: true, donations: [], totalDonations: 0, totalPages: 0, currentPage: Number(page) });
      }
    }

    if (status) query = query.eq('status', status);
    if (bloodGroup) query = query.eq('blood_group', bloodGroup);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    const { data: donations, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) throw error;

    const mappedDonations = donations.map(d => ({
      ...d,
      _id: d.id,
      donorId: {
        _id: d.donors.id,
        userId: {
          _id: d.donors.users?.id,
          name: d.donors.users?.name,
          email: d.donors.users?.email
        }
      },
      staffId: d.staff_id ? { _id: d.staff_id.id, name: d.staff_id.name, email: d.staff_id.email } : null,
      campId: d.camps ? { _id: d.camps.id, campName: d.camps.camp_name, venue: d.camps.venue } : null,
      bloodGroup: d.blood_group,
      donationDate: d.donation_date,
      rejectionReason: d.rejection_reason
    }));

    res.json({
      success: true,
      donations: mappedDonations,
      totalDonations: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new blood donation schedule
// @route   POST /api/donations
// @access  Private (Donor, Staff, Admin)
export const createDonation = async (req, res, next) => {
  try {
    let { donorId, bloodGroup, units = 1, donationDate, campId } = req.body;

    if (req.user.role === 'donor') {
      const { data: donor } = await supabase.from('donors').select('*').eq('user_id', req.user._id).maybeSingle();
      if (!donor) return res.status(400).json({ success: false, message: 'Donor profile incomplete' });
      
      if (!donor.eligibility) {
        return res.status(400).json({ success: false, message: 'You are currently not eligible to donate. Weight must be at least 45kg.' });
      }

      donorId = donor.id;
      bloodGroup = donor.blood_group;
    }

    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        donor_id: donorId,
        blood_group: bloodGroup,
        units: Number(units),
        donation_date: donationDate ? new Date(donationDate).toISOString() : new Date().toISOString(),
        camp_id: campId || null,
        staff_id: req.user.role === 'staff' ? req.user._id : null,
        status: 'Registered'
      })
      .select()
      .single();

    if (error) throw error;

    donation._id = donation.id;
    res.status(201).json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donation status (Workflow: Registered -> Screening -> Collected -> Testing -> Stored / Rejected)
// @route   PUT /api/donations/:id/status
// @access  Private (Staff, Admin)
export const updateDonationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    
    const { data: existingDonation } = await supabase.from('donations').select('*').eq('id', req.params.id).maybeSingle();
    if (!existingDonation) return res.status(404).json({ success: false, message: 'Donation record not found' });

    const updates = { status, staff_id: req.user._id };
    if (rejectionReason) updates.rejection_reason = rejectionReason;

    const { data: donation, error } = await supabase
      .from('donations')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    if (status === 'Stored') {
      await supabase
        .from('donors')
        .update({ last_donation_date: new Date().toISOString() })
        .eq('id', donation.donor_id);
    }

    donation._id = donation.id;
    res.json({ success: true, donation });
  } catch (error) {
    next(error);
  }
};
