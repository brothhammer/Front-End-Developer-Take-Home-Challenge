import { RuxDialog } from "@astrouxds/react";

const AlertDetailsModal = ({ 
  isOpen, 
  alert, 
  formatDate, 
  onClose, 
  onAcknowledge 
}) => {
  if (!alert) return null;

  return (
    <RuxDialog
      open={isOpen}
      onRuxdialogclosed={(e) => {
        if (e.detail === true) {
          // Confirm was clicked
          onAcknowledge(alert.errorId);
        }
        // Close the modal in either case
        onClose();
      }}
      confirmText="Acknowledge"
      denyText="Close"
      title="Alert Details"
      style={{ width: "500px" }}
    >
      <div style={{ marginBottom: "10px" }}>
        <strong>Satellite: </strong>
        {alert.contactSatellite}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Contact Details: </strong>
        {alert.contactDetail}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Category: </strong>
        {alert.errorCategory}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Time: </strong>
        {formatDate(alert.errorTime / 1000)}
      </div>
      <div style={{ marginBottom: "20px" }}>
        <strong>Full Message: </strong>
        {alert.longMessage}
      </div>
    </RuxDialog>
  );
};

export default AlertDetailsModal;
