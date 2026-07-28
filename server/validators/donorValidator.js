import { body } from 'express-validator';

export const donorValidator = [
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
  body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('phone').notEmpty().withMessage('Phone number is required')
];
