import React from 'react';

const Contact = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card card-healthcare p-4 shadow-sm">
            <h3 className="fw-bold brand-font text-danger mb-3">Contact Support & Emergency Helpline</h3>
            <p className="text-muted">Reach out for system integration, blood drive arrangements, or urgent assistance.</p>
            <div className="mb-3">
              <label className="form-label fw-semibold">Your Name</label>
              <input type="text" className="form-control" placeholder="Enter your full name" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input type="email" className="form-control" placeholder="name@example.com" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Message</label>
              <textarea className="form-control" rows="4" placeholder="Describe your inquiry..."></textarea>
            </div>
            <button className="btn btn-blood-danger">Send Inquiry</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
