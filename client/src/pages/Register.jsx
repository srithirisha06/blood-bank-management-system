import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaTint, FaUser, FaEnvelope, FaLock, FaHospital, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
  const { registerUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Donor fields
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('1998-05-15');
  const [weight, setWeight] = useState(65);
  const [phone, setPhone] = useState('+1 555-0123');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        name: role === 'hospital' ? hospitalName : name,
        email,
        password,
        role,
        donorDetails: role === 'donor' ? {
          bloodGroup,
          gender,
          dob,
          weight: Number(weight),
          phone,
          address: { city: 'Default City' }
        } : null,
        hospitalDetails: role === 'hospital' ? {
          hospitalName,
          registrationNumber,
          contactPerson: contactPerson || name,
          phone,
          address: { city: 'Default City' }
        } : null
      };

      const data = await registerUser(payload);
      addToast('Registration successful! Welcome.', 'success');

      if (data.user.role === 'donor') navigate('/donor/dashboard');
      else if (data.user.role === 'hospital') navigate('/hospital/dashboard');
      else navigate('/admin/dashboard');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Check details.';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card card-healthcare p-4 p-md-5 shadow-lg border-0">
              <div className="text-center mb-4">
                <span className="fs-1 text-danger"><FaTint /></span>
                <h3 className="fw-bold brand-font text-dark mt-2">Create Your LifeFlow Account</h3>
                <p className="text-muted small">Register as a Blood Donor or Hospital Entity</p>
              </div>

              {/* Role Selection Tabs */}
              <div className="nav nav-pills nav-justified mb-4 p-1 bg-light rounded border">
                <button
                  type="button"
                  className={`nav-link fw-semibold ${role === 'donor' ? 'active bg-danger text-white' : 'text-dark'}`}
                  onClick={() => setRole('donor')}
                >
                  <FaUser className="me-2" /> Blood Donor
                </button>
                <button
                  type="button"
                  className={`nav-link fw-semibold ${role === 'hospital' ? 'active bg-danger text-white' : 'text-dark'}`}
                  onClick={() => setRole('hospital')}
                >
                  <FaHospital className="me-2" /> Hospital / Clinic
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {role === 'donor' ? (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Hospital Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="City General Hospital"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+1 555-0123"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  {role === 'donor' && (
                    <>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold small">Blood Group</label>
                        <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold small">Gender</label>
                        <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold small">Weight (kg)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          min="40"
                          max="200"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  {role === 'hospital' && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Registration Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="REG-2026-99"
                          value={registrationNumber}
                          onChange={(e) => setRegistrationNumber(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold small">Contact Person Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Dr. Smith"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-blood-danger w-100 py-2 mt-4 shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Registering Account...' : 'Complete Registration'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">
                  Already registered? <Link to="/login" className="text-danger fw-semibold">Sign In Here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
