import {
  RuxCard,
  RuxStatus,
  RuxIcon,
  RuxButton,
} from "@astrouxds/react";
import PropTypes from 'prop-types';

const AlertCard = ({ 
  alert, 
  getTimeRange, 
  onShowDetails 
}) => {
  return (
    <RuxCard
      key={alert.errorId}
      className="alert-card"
      style={{
        margin: "10px",
        opacity: alert.acknowledged ? 0.6 : 1,
      }}
    >
      <div slot="header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: "bold" }}>
            Contact Name: {alert.contactName}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {alert.errorSeverity !== "warning" ? (
                <RuxStatus
                  status={alert.errorSeverity}
                  className="status-icon"
                />
              ) : (
                <RuxIcon icon="warning" size="1rem"></RuxIcon>
              )}
              <div className="label" style={{ textAlign: "center" }}>
                {alert.errorSeverity}
              </div>
            </span>
          </div>
        </div>
      </div>

      <div>
        <div style={{ margin: "10px 0" }}>
          <strong>Alert Message: </strong>
          {alert.errorMessage}
        </div>

        <div style={{ margin: "10px 0" }}>
          <strong>Contact Time: </strong>
          {getTimeRange(
            alert.contactBeginTimestamp,
            alert.contactEndTimestamp,
          )}
        </div>

        {alert.longMessage && (
          <div style={{ margin: "10px 0", color: "#666" }}>
            <strong>Long Message: </strong>
            {alert.longMessage}
          </div>
        )}
      </div>

      <div slot="footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <RuxButton
            onClick={() => onShowDetails(alert)}
          >
            Show Details
          </RuxButton>
          {alert.acknowledged && <span>✓ Acknowledged</span>}
        </div>
      </div>
    </RuxCard>
  );
};

AlertCard.propTypes = {
    alert: PropTypes.shape({
      errorId: PropTypes.string.isRequired,
      contactName: PropTypes.string.isRequired,
      errorSeverity: PropTypes.string.isRequired,
      errorMessage: PropTypes.string.isRequired,
      contactBeginTimestamp: PropTypes.number.isRequired,
      contactEndTimestamp: PropTypes.number.isRequired,
      acknowledged: PropTypes.bool,
      longMessage: PropTypes.string,
    }).isRequired,
    formatDate: PropTypes.func.isRequired,
    getTimeRange: PropTypes.func.isRequired,
    onShowDetails: PropTypes.func.isRequired,
  };  

export default AlertCard;
