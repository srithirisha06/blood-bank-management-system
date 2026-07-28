import { body } from 'express-validator';

export const requestValidator = [
  body('patientName').notEmpty().withMessage('Patient name is required'),
  body('bloodGroup')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Valid blood group is required'),
  body('units').isInt({ min: 1 }).withMessage('Units must be at least 1'),
  body('priority').isIn(['Normal', 'Urgent', 'Emergency']).withMessage('Valid priority level is required'),
  body('requiredDate').isISO8601().withMessage('Valid required date is required')
];
