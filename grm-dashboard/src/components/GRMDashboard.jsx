import { useState, useEffect, useCallback } from 'react';
import { RuxNotification } from '@astrouxds/react';

import AlertFilters from './AlertFilters';
import AlertCard from './AlertCard';
import AlertDetailsModal from './AlertDetailsModal';

const GRMDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    status: '',
  });

  // Get all alerts from contacts with contact info attached
  const getAllAlerts = useCallback(() => {
    return contacts.reduce((allAlerts, contact) => {
      const contactAlerts =
        contact.alerts?.map((alert) => ({
          ...alert,
          contactName: contact.contactName,
          contactSatellite: contact.contactSatellite,
          contactDetail: contact.contactDetail,
          contactBeginTimestamp: contact.contactBeginTimestamp,
          contactEndTimestamp: contact.contactEndTimestamp,
        })) || [];
      return [...allAlerts, ...contactAlerts];
    }, []);
  }, [contacts]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update filtered alerts whenever contacts or filter changes
  useEffect(() => {
    // Get all alerts
    const allAlerts = getAllAlerts();

    // Remove duplicates by errorId (keeping the first occurrence)
    const uniqueAlerts = Array.from(
      allAlerts
        .reduce((map, alert) => {
          if (!map.has(alert.errorId)) {
            map.set(alert.errorId, alert);
          }
          return map;
        }, new Map())
        .values()
    );

    // Sort and filter
    const filtered = uniqueAlerts
      .sort((a, b) => b.errorTime - a.errorTime)
      .filter(
        (alert) =>
          selectedSeverityFilter === 'all' ||
          alert.errorSeverity.toLowerCase() ===
            selectedSeverityFilter.toLowerCase()
      );

    setFilteredAlerts(filtered);
  }, [contacts, selectedSeverityFilter, getAllAlerts]);

  const handleAcknowledge = async (alertId) => {
    try {
      const response = await fetch(`/api/acknowledge/${alertId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      // Update state after successful acknowledgment
      setContacts(
        contacts.map((contact) => ({
          ...contact,
          alerts:
            contact.alerts?.map((alert) =>
              alert.errorId === alertId
                ? { ...alert, acknowledged: true }
                : alert
            ) || [],
        }))
      );
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      setNotification({
        show: true,
        message: 'Failed to acknowledge alert',
        status: 'critical',
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRange = (begin, end) => {
    return `${formatDate(begin)} - ${formatDate(end)}`;
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        minWidth: '320px', // Minimum width for mobile,
        minHeight: '600px',
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-background-base-default, #101923)',
          zIndex: 100,
          padding: '10px 0',
          borderBottom: '1px solid #ccc',
        }}
      >
        <RuxNotification
          open={notification.show}
          message={notification.message}
          status={notification.status}
        />

        <h3 style={{paddingLeft: '10px'}}>GRM Alert Dashboard</h3>

        <AlertFilters
          selectedSeverityFilter={selectedSeverityFilter}
          setSelectedSeverityFilter={setSelectedSeverityFilter}
          filteredAlerts={filteredAlerts}
        />
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading alerts...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Error: There was a problem loading the alerts.
        </div>
      ) : (
        <div>
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.errorId}
              alert={alert}
              formatDate={formatDate}
              getTimeRange={getTimeRange}
              onShowDetails={(selectedAlert) => {
                setSelectedAlert(selectedAlert);
                setIsModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AlertDetailsModal
        isOpen={isModalOpen}
        alert={selectedAlert}
        formatDate={formatDate}
        onClose={() => setIsModalOpen(false)}
        onAcknowledge={handleAcknowledge}
      />
    </div>
  );
};

export default GRMDashboard;
