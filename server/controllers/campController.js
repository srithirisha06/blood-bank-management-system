import supabase from '../config/supabaseClient.js';

// @desc    Get all blood donation camps
// @route   GET /api/camps
// @access  Public
export const getCamps = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = supabase.from('camps').select('*');

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`camp_name.ilike.%${search}%,venue.ilike.%${search}%,organizer.ilike.%${search}%`);
    }

    const { data: camps, error } = await query.order('date', { ascending: true });

    if (error) throw error;

    const mappedCamps = camps.map(c => ({
      ...c,
      _id: c.id,
      campName: c.camp_name,
      registeredDonorsCount: c.registered_donors_count
    }));

    res.json({ success: true, camps: mappedCamps });
  } catch (error) {
    next(error);
  }
};

// @desc    Get camp by ID
// @route   GET /api/camps/:id
// @access  Public
export const getCampById = async (req, res, next) => {
  try {
    const { data: camp, error } = await supabase
      .from('camps')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    camp._id = camp.id;
    camp.campName = camp.camp_name;
    camp.registeredDonorsCount = camp.registered_donors_count;

    res.json({ success: true, camp });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new blood camp
// @route   POST /api/camps
// @access  Private (Admin, Super Admin)
export const createCamp = async (req, res, next) => {
  try {
    const { campName, venue, organizer, date, time, capacity, description } = req.body;

    const { data: camp, error } = await supabase
      .from('camps')
      .insert({
        camp_name: campName,
        venue,
        organizer,
        date: new Date(date).toISOString(),
        time,
        capacity: Number(capacity) || 100,
        description: description || '',
        status: 'Upcoming'
      })
      .select()
      .single();

    if (error) throw error;

    camp._id = camp.id;
    camp.campName = camp.camp_name;
    camp.registeredDonorsCount = camp.registered_donors_count;

    res.status(201).json({ success: true, camp });
  } catch (error) {
    next(error);
  }
};

// @desc    Update camp details
// @route   PUT /api/camps/:id
// @access  Private (Admin, Super Admin)
export const updateCamp = async (req, res, next) => {
  try {
    const { data: existingCamp } = await supabase.from('camps').select('id').eq('id', req.params.id).maybeSingle();
    if (!existingCamp) return res.status(404).json({ success: false, message: 'Camp not found' });

    const { campName, venue, organizer, date, time, capacity, description, status } = req.body;
    const updates = {};

    if (campName) updates.camp_name = campName;
    if (venue) updates.venue = venue;
    if (organizer) updates.organizer = organizer;
    if (date) updates.date = new Date(date).toISOString();
    if (time) updates.time = time;
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (description !== undefined) updates.description = description;
    if (status) updates.status = status;

    const { data: camp, error } = await supabase
      .from('camps')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    camp._id = camp.id;
    camp.campName = camp.camp_name;
    camp.registeredDonorsCount = camp.registered_donors_count;

    res.json({ success: true, camp });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete camp
// @route   DELETE /api/camps/:id
// @access  Private (Admin, Super Admin)
export const deleteCamp = async (req, res, next) => {
  try {
    const { data: camp } = await supabase.from('camps').select('id').eq('id', req.params.id).maybeSingle();
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    const { error } = await supabase.from('camps').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ success: true, message: 'Camp deleted successfully' });
  } catch (error) {
    next(error);
  }
};
