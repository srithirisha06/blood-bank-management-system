import React from 'react';
import { Link } from 'react-router-dom';
import { FaTint, FaHeartbeat, FaHospital, FaUserCheck, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const CompatibilityChecker = React.lazy(() => import('../components/CompatibilityChecker'));

const Home = () => {
  return (
    <div className="bg-light min-vh-100">
      {/* Hero Section */}
      <section className="py-5 text-white" style={{ background: 'linear-gradient(135deg, #B71C1C 0%, #D32F2F 50%, #880E4F 100%)' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <span className="badge bg-white text-danger px-3 py-2 rounded-pill fw-bold text-uppercase mb-3 shadow-sm">
                🩸 Enterprise Blood Bank System
              </span>
              <h1 className="display-4 fw-extrabold brand-font mb-3">
                Connecting Life-Saving Donors with Emergency Care
              </h1>
              <p className="lead opacity-90 mb-4">
                LifeFlow is an enterprise-grade digital blood management system providing real-time blood stock tracking, automated screening workflows, and instant emergency requests for hospitals.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-light btn-lg fw-bold text-danger px-4 rounded-pill shadow">
                  Become a Donor <FaArrowRight className="ms-2" />
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg fw-semibold px-4 rounded-pill">
                  Hospital Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold brand-font text-dark">Why Choose LifeFlow Platform?</h2>
            <p className="text-muted">Designed for maximum security, speed, and reliability in critical situations.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card card-healthcare p-4 text-center h-100">
                <div className="fs-1 text-danger mb-3"><FaTint /></div>
                <h5 className="fw-bold">Real-time Stock Tracking</h5>
                <p className="text-muted small">Monitor available blood units across A+, B+, AB+, O+ and negative groups with expiry tracking.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-healthcare p-4 text-center h-100">
                <div className="fs-1 text-danger mb-3"><FaHospital /></div>
                <h5 className="fw-bold">Rapid Hospital Dispatch</h5>
                <p className="text-muted small">Urgent and emergency blood requests with instant admin review and automated stock reserve.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card card-healthcare p-4 text-center h-100">
                <div className="fs-1 text-danger mb-3"><FaShieldAlt /></div>
                <h5 className="fw-bold">Strict Lab Testing</h5>
                <p className="text-muted small">Comprehensive screening for HIV, Hepatitis B/C, Malaria, and Syphilis before stocking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility Matrix Section */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <React.Suspense fallback={<div className="text-center text-muted py-3">Loading compatibility checker...</div>}>
                <CompatibilityChecker />
              </React.Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-dark text-white text-center">
        <div className="container">
          <p className="mb-0 text-secondary small">
            © 2026 LifeFlow Enterprise Blood Bank Management System. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
