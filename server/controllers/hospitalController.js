import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Private (Super Admin, Admin, Staff)
export const getHospitals = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = supabase.from('hospitals').select('*, users!inner(name, email, active)', { count: 'exact' });

    if (search) {
      query = query.or(`hospital_name.ilike.%${search}%,registration_number.ilike.%${search}%,contact_person.ilike.%${search}%`);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    const { data: hospitals, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) throw error;

    const mappedHospitals = hospitals.map(h => ({
      ...h,
      _id: h.id,
      userId: {
        _id: h.user_id,
        name: h.users.name,
        email: h.users.email,
        active: h.users.active
      },
      users: undefined
    }));

    res.json({
      success: true,
      hospitals: mappedHospitals,
      totalHospitals: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital by ID
// @route   GET /api/hospitals/:id
// @access  Private
export const getHospitalById = async (req, res, next) => {
  try {
    let { data: hospital, error } = await supabase
      .from('hospitals')
      .select('*, users!inner(name, email, active)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!hospital) {
      const { data: byUserId } = await supabase
        .from('hospitals')
        .select('*, users!inner(name, email, active)')
        .eq('user_id', req.params.id)
        .maybeSingle();
      hospital = byUserId;
    }

    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    hospital._id = hospital.id;
    hospital.userId = {
      _id: hospital.user_id,
      name: hospital.users.name,
      email: hospital.users.email,
      active: hospital.users.active
    };
    delete hospital.users;

    const { data: requests } = await supabase
      .from('requests')
      .select('*')
      .eq('hospital_id', hospital.id)
      .order('created_at', { ascending: false });

    const mappedRequests = (requests || []).map(r => ({ ...r, _id: r.id }));

    res.json({ success: true, hospital, requests: mappedRequests });
  } catch (error) {
    next(error);
  }
};

// @desc    Create hospital profile
// @route   POST /api/hospitals
// @access  Private (Super Admin, Admin)
export const createHospital = async (req, res, next) => {
  try {
    const { hospitalName, registrationNumber, contactPerson, phone, email, password, address } = req.body;

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).maybeSingle();
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Hospital@123', salt);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name: hospitalName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'hospital'
      })
      .select()
      .single();

    if (userError) throw userError;

    const { data: hospital, error: hospError } = await supabase
      .from('hospitals')
      .insert({
        user_id: user.id,
        hospital_name: hospitalName,
        registration_number: registrationNumber || `REG-${Date.now()}`,
        contact_person: contactPerson,
        phone,
        email: email.toLowerCase(),
        address: address || {}
      })
      .select()
      .single();

    if (hospError) throw hospError;

    hospital._id = hospital.id;
    res.status(201).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital details
// @route   PUT /api/hospitals/:id
// @access  Private (Admin, Self Hospital)
export const updateHospital = async (req, res, next) => {
  try {
    let { data: hospital } = await supabase.from('hospitals').select('*').eq('id', req.params.id).maybeSingle();
    
    if (!hospital) {
      const { data: byUserId } = await supabase.from('hospitals').select('*').eq('user_id', req.params.id).maybeSingle();
      hospital = byUserId;
    }

    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    const { hospitalName, contactPerson, phone, address } = req.body;
    const updates = {};

    if (hospitalName) updates.hospital_name = hospitalName;
    if (contactPerson) updates.contact_person = contactPerson;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;

    const { data: updatedHospital, error } = await supabase
      .from('hospitals')
      .update(updates)
      .eq('id', hospital.id)
      .select()
      .single();

    if (error) throw error;
    updatedHospital._id = updatedHospital.id;

    res.json({ success: true, hospital: updatedHospital });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (Super Admin)
export const deleteHospital = async (req, res, next) => {
  try {
    const { data: hospital } = await supabase.from('hospitals').select('*').eq('id', req.params.id).maybeSingle();
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

    // Users deletion cascades to hospitals table
    const { error } = await supabase.from('users').delete().eq('id', hospital.user_id);
    if (error) throw error;

    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    next(error);
  }
};
