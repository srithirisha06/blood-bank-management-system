import React from 'react';

const About = () => {
  return (
    <div className="container py-5">
      <div className="card card-healthcare p-5 max-w-3xl mx-auto shadow-sm">
        <h2 className="fw-bold brand-font text-danger mb-3">About LifeFlow Blood Bank</h2>
        <p className="lead text-dark">
          LifeFlow is a state-of-the-art enterprise blood bank software solution built using the MERN stack.
        </p>
        <p className="text-muted">
          Our system addresses critical delays in blood request fulfillment by connecting certified donors, healthcare workers, laboratory staff, and hospital emergency wards onto a single synchronized digital platform.
        </p>
        <div className="row g-3 mt-4">
          <div className="col-md-6">
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-danger">Mission</h6>
              <p className="small text-muted mb-0">Zero delays in emergency blood access across all healthcare facilities.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 bg-light rounded border">
              <h6 className="fw-bold text-danger">Security & Safety</h6>
              <p className="small text-muted mb-0">Multi-point infectious disease laboratory testing and full RBAC controls.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
