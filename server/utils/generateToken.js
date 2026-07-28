import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_blood_bank_jwt_key_2026_production_grade', {
    expiresIn: process.env.JWT_EXPIRE || '1d'
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_2026', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};
