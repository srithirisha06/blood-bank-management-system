import supabase from '../config/supabaseClient.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { logActivity } from '../utils/activityLogger.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// @desc    Register a new user (Donor, Hospital, Staff, Admin)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, hospitalDetails, donorDetails } = req.body;

    // Check if user exists
    const { data: userExists } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const assignedRole = role || 'donor';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: assignedRole
      })
      .select()
      .single();

    if (userError) throw userError;

    // Create sub-profile depending on role
    if (assignedRole === 'donor' && donorDetails) {
      const dob = donorDetails.dob ? new Date(donorDetails.dob) : new Date(2000, 0, 1);
      const age = donorDetails.age || Math.floor((new Date() - dob) / (365.25 * 24 * 60 * 60 * 1000));
      
      const { error: donorError } = await supabase
        .from('donors')
        .insert({
          user_id: user.id,
          blood_group: donorDetails.bloodGroup || 'O+',
          gender: donorDetails.gender || 'Male',
          dob: dob.toISOString(),
          age: age || 25,
          weight: donorDetails.weight || 60,
          phone: donorDetails.phone || '0000000000',
          address: donorDetails.address || { city: 'Default City' },
          eligibility: (donorDetails.weight || 60) >= 45
        });
      
      if (donorError) throw donorError;
    } else if (assignedRole === 'hospital' && hospitalDetails) {
      const { error: hospitalError } = await supabase
        .from('hospitals')
        .insert({
          user_id: user.id,
          hospital_name: hospitalDetails.hospitalName || name,
          registration_number: hospitalDetails.registrationNumber || `REG-${Date.now()}`,
          contact_person: hospitalDetails.contactPerson || name,
          phone: hospitalDetails.phone || '0000000000',
          email: email.toLowerCase(),
          address: hospitalDetails.address || { city: 'Default City' }
        });

      if (hospitalError) throw hospitalError;
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await supabase.from('users').update({ refresh_token: refreshToken }).eq('id', user.id);

    // Log Activity (mock req for the logger which might expect req.user)
    const mockReq = { ...req, user: { _id: user.id } };
    await logActivity(user.id, 'REGISTER', `User registered with role: ${assignedRole}`, mockReq);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!user || error) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact Admin.' });
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await supabase.from('users').update({ refresh_token: refreshToken }).eq('id', user.id);

    const mockReq = { ...req, user: { _id: user.id } };
    await logActivity(user.id, 'LOGIN', 'User logged in', mockReq);

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await supabase.from('users').update({ refresh_token: null }).eq('id', req.user._id);
      await logActivity(req.user._id, 'LOGOUT', 'User logged out', req);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user._id)
      .single();
      
    if (userError || !user) throw new Error('User not found');

    // Add _id for frontend compatibility
    user._id = user.id;

    let extraProfile = null;

    if (user.role === 'donor') {
      const { data } = await supabase.from('donors').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        data._id = data.id;
        extraProfile = data;
      }
    } else if (user.role === 'hospital') {
      const { data } = await supabase.from('hospitals').select('*').eq('user_id', user.id).maybeSingle();
      if (data) {
        data._id = data.id;
        extraProfile = data;
      }
    }

    res.json({
      success: true,
      user,
      profileDetails: extraProfile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Generate Reset Token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    // Supabase needs ISO string for timestamp
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase
      .from('users')
      .update({
        reset_password_token: resetPasswordToken,
        reset_password_expire: resetPasswordExpire
      })
      .eq('id', user.id);

    res.json({
      success: true,
      message: 'Password reset token generated successfully',
      resetToken // Returned for testing / easy demo usage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('reset_password_token', resetPasswordToken)
      .gt('reset_password_expire', new Date().toISOString())
      .maybeSingle();

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    await supabase
      .from('users')
      .update({
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expire: null
      })
      .eq('id', user.id);

    res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    next(error);
  }
};
