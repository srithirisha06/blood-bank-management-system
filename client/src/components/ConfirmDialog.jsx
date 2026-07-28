import React from 'react';

/**
 * Reusable confirmation dialog modal
 * Usage:
 * <ConfirmDialog
 *   show={showDialog}
 *   title="Delete Donor?"
 *   message="This action cannot be undone."
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowDialog(false)}
 *   confirmLabel="Delete"
 *   confirmVariant="danger"
 * />
 */
const ConfirmDialog = ({
  show,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
}) => {
  if (!show) return null;

  return (
    <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 9999 }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
        <div className="modal-content card-healthcare">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">{title}</h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          <div className="modal-body">
            <p className="text-muted mb-0">{message}</p>
          </div>
          <div className="modal-footer border-top">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-${confirmVariant} btn-sm`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
