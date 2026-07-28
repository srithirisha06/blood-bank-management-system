import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_blood_bank_jwt_key_2026_production_grade');
      
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .maybeSingle();

      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      if (!user.active) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
      }

      req.user = user;
      req.user._id = user.id;

      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
