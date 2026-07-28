import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';

// @desc    Get all donors (with search, filter, pagination, sorting)
// @route   GET /api/donors
// @access  Private (Super Admin, Admin, Staff)
export const getDonors = async (req, res, next) => {
  try {
    const { bloodGroup, eligibility, search, page = 1, limit = 10, sortBy = 'created_at', order = 'desc' } = req.query;
    
    let query = supabase.from('donors').select('*, users!inner(name, email, active)', { count: 'exact' });

    if (bloodGroup) query = query.eq('blood_group', bloodGroup);
    if (eligibility !== undefined) query = query.eq('eligibility', eligibility === 'true');

    if (search) {
      query = query.or(`users.name.ilike.%${search}%,users.email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Map frontend camelCase to snake_case for Supabase
    let dbSortBy = 'created_at';
    if (sortBy === 'createdAt') dbSortBy = 'created_at';

    const { data: donors, count, error } = await query
      .order(dbSortBy, { ascending: order === 'asc' })
      .range(startIndex, endIndex);

    if (error) throw error;

    const mappedDonors = donors.map(d => ({
      ...d,
      _id: d.id,
      bloodGroup: d.blood_group,
      userId: {
        _id: d.user_id,
        name: d.users.name,
        email: d.users.email,
        active: d.users.active
      },
      users: undefined
    }));

    res.json({
      success: true,
      donors: mappedDonors,
      totalDonors: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor profile by ID or user ID
// @route   GET /api/donors/:id
// @access  Private
export const getDonorById = async (req, res, next) => {
  try {
    let { data: donor, error } = await supabase
      .from('donors')
      .select('*, users!inner(name, email, avatar, active)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!donor) {
      const { data: byUserId } = await supabase
        .from('donors')
        .select('*, users!inner(name, email, avatar, active)')
        .eq('user_id', req.params.id)
        .maybeSingle();
      donor = byUserId;
    }

    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    donor._id = donor.id;
    donor.bloodGroup = donor.blood_group;
    donor.medicalHistory = donor.medical_history;
    donor.userId = {
      _id: donor.user_id,
      name: donor.users.name,
      email: donor.users.email,
      avatar: donor.users.avatar,
      active: donor.users.active
    };
    delete donor.users;

    const { data: history } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', donor.id)
      .order('donation_date', { ascending: false });

    const mappedHistory = (history || []).map(h => ({
      ...h,
      _id: h.id,
      bloodGroup: h.blood_group,
      donationDate: h.donation_date
    }));

    res.json({ success: true, donor, history: mappedHistory });
  } catch (error) {
    next(error);
  }
};

// @desc    Create donor profile
// @route   POST /api/donors
// @access  Private (Admin, Staff)
export const createDonor = async (req, res, next) => {
  try {
    const { name, email, password, bloodGroup, gender, dob, weight, phone, address, medicalHistory } = req.body;

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).maybeSingle();
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Donor@123', salt);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'donor'
      })
      .select()
      .single();

    if (userError) throw userError;

    const birthDate = new Date(dob);
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    const isEligible = Number(weight) >= 45;

    const medHistoryArray = medicalHistory ? (Array.isArray(medicalHistory) ? medicalHistory : [medicalHistory]) : [];

    const { data: donor, error: donorError } = await supabase
      .from('donors')
      .insert({
        user_id: user.id,
        blood_group: bloodGroup,
        gender,
        dob: birthDate.toISOString(),
        age: age || 25,
        weight: Number(weight),
        phone,
        address: address || {},
        medical_history: medHistoryArray,
        eligibility: isEligible
      })
      .select()
      .single();

    if (donorError) throw donorError;

    donor._id = donor.id;
    donor.bloodGroup = donor.blood_group;

    res.status(201).json({ success: true, donor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor details
// @route   PUT /api/donors/:id
// @access  Private (Admin, Staff, Self Donor)
export const updateDonor = async (req, res, next) => {
  try {
    let { data: donor } = await supabase.from('donors').select('*').eq('id', req.params.id).maybeSingle();
    
    if (!donor) {
      const { data: byUserId } = await supabase.from('donors').select('*').eq('user_id', req.params.id).maybeSingle();
      donor = byUserId;
    }

    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });

    const { bloodGroup, gender, weight, phone, address, medicalHistory, eligibility } = req.body;
    const updates = {};

    if (bloodGroup) updates.blood_group = bloodGroup;
    if (gender) updates.gender = gender;
    if (weight) {
      updates.weight = Number(weight);
      updates.eligibility = Number(weight) >= 45;
    }
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (medicalHistory) updates.medical_history = medicalHistory;
    if (eligibility !== undefined) updates.eligibility = eligibility;

    if (req.file) {
      updates.profile_image = `/uploads/${req.file.filename}`;
    }

    const { data: updatedDonor, error } = await supabase
      .from('donors')
      .update(updates)
      .eq('id', donor.id)
      .select()
      .single();

    if (error) throw error;
    
    updatedDonor._id = updatedDonor.id;
    updatedDonor.bloodGroup = updatedDonor.blood_group;
    updatedDonor.medicalHistory = updatedDonor.medical_history;

    res.json({ success: true, donor: updatedDonor });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Super Admin, Admin)
export const deleteDonor = async (req, res, next) => {
  try {
    const { data: donor } = await supabase.from('donors').select('*').eq('id', req.params.id).maybeSingle();
    if (!donor) return res.status(404).json({ success: false, message: 'Donor not found' });

    // Cascades
    const { error } = await supabase.from('users').delete().eq('id', donor.user_id);
    if (error) throw error;

    res.json({ success: true, message: 'Donor deleted successfully' });
  } catch (error) {
    next(error);
  }
};
