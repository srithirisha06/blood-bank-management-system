import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';

// @desc    Get all users (with search & filtering)
// @route   GET /api/users
// @access  Private (Super Admin, Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    let query = supabase.from('users').select('*', { count: 'exact' });

    if (role) {
      query = query.eq('role', role);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) throw error;

    // Remove password and map id to _id
    const safeUsers = users.map(u => {
      const { password, ...rest } = u;
      return { ...rest, _id: u.id };
    });

    res.json({
      success: true,
      users: safeUsers,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalUsers: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user manually (Super Admin)
// @route   POST /api/users
// @access  Private (Super Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email: email.toLowerCase(), password: hashedPassword, role })
      .select()
      .single();

    if (error) throw error;

    const { password: _, ...safeUser } = user;
    safeUser._id = user.id;

    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details / role / active status
// @route   PUT /api/users/:id
// @access  Private (Super Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!existingUser) return res.status(404).json({ success: false, message: 'User not found' });

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email.toLowerCase();
    if (req.body.role) updates.role = req.body.role;
    if (req.body.active !== undefined) updates.active = req.body.active;

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    
    const { password: _, ...safeUser } = user;
    safeUser._id = user.id;

    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Super Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Supabase foreign keys with ON DELETE CASCADE will handle donor/hospital deletion automatically
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
