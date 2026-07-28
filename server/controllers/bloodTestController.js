import supabase from '../config/supabaseClient.js';

// @desc    Get all blood test records
// @route   GET /api/blood-tests
// @access  Private (Staff, Admin, Super Admin)
export const getBloodTests = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = supabase.from('blood_tests').select(`
      *,
      donations!inner(
        id,
        donors!inner(
          id,
          users!inner(name, email)
        )
      ),
      tested_by (id, name, email)
    `);

    if (status) query = query.eq('status', status);

    const { data: tests, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const mappedTests = tests.map(t => ({
      ...t,
      _id: t.id,
      bloodPressure: t.blood_pressure,
      hepatitisB: t.hepatitis_b,
      hepatitisC: t.hepatitis_c,
      donationId: {
        _id: t.donations.id,
        donorId: {
          _id: t.donations.donors.id,
          userId: {
            _id: t.donations.donors.users?.id,
            name: t.donations.donors.users?.name,
            email: t.donations.donors.users?.email
          }
        }
      },
      testedBy: t.tested_by ? { _id: t.tested_by.id, name: t.tested_by.name, email: t.tested_by.email } : null
    }));

    res.json({ success: true, bloodTests: mappedTests });
  } catch (error) {
    next(error);
  }
};

// @desc    Record lab test results for a blood donation sample
// @route   POST /api/blood-tests
// @access  Private (Staff, Admin)
export const recordBloodTest = async (req, res, next) => {
  try {
    const { donationId, hiv, hepatitisB, hepatitisC, malaria, syphilis, hemoglobin, bloodPressure, remarks } = req.body;

    const { data: donation } = await supabase.from('donations').select('*').eq('id', donationId).maybeSingle();
    if (!donation) return res.status(404).json({ success: false, message: 'Donation record not found' });

    const isApproved =
      hiv === 'Negative' &&
      hepatitisB === 'Negative' &&
      hepatitisC === 'Negative' &&
      malaria === 'Negative' &&
      syphilis === 'Negative' &&
      Number(hemoglobin) >= 12.5;

    const status = isApproved ? 'Approved' : 'Rejected';

    const { data: existingTest } = await supabase.from('blood_tests').select('id').eq('donation_id', donationId).maybeSingle();
    
    const testPayload = {
      donation_id: donationId,
      hiv,
      hepatitis_b: hepatitisB,
      hepatitis_c: hepatitisC,
      malaria,
      syphilis,
      hemoglobin: Number(hemoglobin),
      blood_pressure: bloodPressure,
      remarks: remarks || '',
      status,
      tested_by: req.user._id
    };

    let testRecord;
    if (existingTest) {
      const { data, error } = await supabase.from('blood_tests').update(testPayload).eq('id', existingTest.id).select().single();
      if (error) throw error;
      testRecord = data;
    } else {
      const { data, error } = await supabase.from('blood_tests').insert(testPayload).select().single();
      if (error) throw error;
      testRecord = data;
    }

    testRecord._id = testRecord.id;

    if (status === 'Approved') {
      await supabase.from('donations').update({ status: 'Stored' }).eq('id', donationId);

      const collectionDate = donation.donation_date || new Date().toISOString();
      const expiryDate = new Date(collectionDate);
      expiryDate.setDate(expiryDate.getDate() + 35);

      const batchNumber = `BATCH-${donation.blood_group.replace('+', 'P').replace('-', 'N')}-${Date.now()}`;

      await supabase.from('inventories').insert({
        blood_group: donation.blood_group,
        units: donation.units,
        collection_date: collectionDate,
        expiry_date: expiryDate.toISOString(),
        batch_number: batchNumber,
        status: 'Available',
        donation_id: donation.id
      });
    } else {
      await supabase.from('donations').update({ 
        status: 'Rejected',
        rejection_reason: remarks || 'Failed infectious disease or hemoglobin screening'
      }).eq('id', donationId);
    }

    res.status(201).json({ success: true, bloodTest: testRecord, donationStatus: status === 'Approved' ? 'Stored' : 'Rejected' });
  } catch (error) {
    next(error);
  }
};
