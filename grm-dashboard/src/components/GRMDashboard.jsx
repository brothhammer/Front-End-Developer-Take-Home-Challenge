import React, { useState, useEffect, useCallback } from 'react';
import { RuxButton, RuxDialog, RuxCard, RuxStatus, RuxIcon, RuxSelect, RuxOption, RuxMonitoringProgressIcon } from '@astrouxds/react'

const GRMDashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get all alerts from contacts with contact info attached
  const getAllAlerts = useCallback(() => {
    return contacts.reduce((allAlerts, contact) => {
      const contactAlerts = contact.alerts?.map(alert => ({
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
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error('Error loading data:', error);
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
      allAlerts.reduce((map, alert) => {
        if (!map.has(alert.errorId)) {
          map.set(alert.errorId, alert);
        }
        return map;
      }, new Map()).values()
    );

    // Sort and filter
    const filtered = uniqueAlerts
      .sort((a, b) => b.errorTime - a.errorTime)
      .filter(alert => 
        selectedSeverityFilter === 'all' || 
        alert.errorSeverity.toLowerCase() === selectedSeverityFilter.toLowerCase()
      );

    setFilteredAlerts(filtered);
  }, [contacts, selectedSeverityFilter, getAllAlerts]);

  const handleAcknowledge = (alertId) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      alerts: contact.alerts?.map(alert => 
        alert.errorId === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      ) || []
    })));
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeRange = (begin, end) => {
    return `${formatDate(begin)} - ${formatDate(end)}`;
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>GRM Alert Dashboard</h1>
      
      {/* Severity Filter */}
      <div 
        style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '20px'
        }}
      >
      <RuxSelect
        label="Filter by Severity"
        value={selectedSeverityFilter}
        onRuxchange={(e) => setSelectedSeverityFilter(e.target.value)}
        style={{ 
            paddingLeft: '10px',
            width: '200px'
        }}
      >
            <RuxOption value="all" label="All"></RuxOption>
            <RuxOption value="critical" label="Critical"></RuxOption>
            <RuxOption value="serious" label="serious"></RuxOption>
            <RuxOption value="caution" label="Caution"></RuxOption>
            <RuxOption value="warning" label="Warning"></RuxOption>
        </RuxSelect>

        <RuxMonitoringProgressIcon
            label="Acknowledged"
            progress={Math.round((filteredAlerts.filter(alert => alert.acknowledged).length / filteredAlerts.length) * 100) || 0}
            min={0}
            max={100}
            range={[
            {
                threshold: 33,
                status: 'critical'
            },
            {
                threshold: 66,
                status: 'caution'
            },
            {
                threshold: 100,
                status: 'normal'
            }
            ]}
            notifications={filteredAlerts.filter(alert => alert.acknowledged).length}
            sublabel={`${filteredAlerts.filter(alert => alert.acknowledged).length} of ${filteredAlerts.length}`}
        />
      </div>

      {/* Alerts List */}
      <div>
        {filteredAlerts.map(alert => (
          <RuxCard
            key={alert.errorId}
            className="alert-card"
            style={{
              margin: '10px',
              opacity: alert.acknowledged ? 0.6 : 1
            }}
          >
             <div slot="header">
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                }}>
                    <span style={{ fontWeight: 'bold' }}>
                    Contact Name: {alert.contactName}
                    </span>
                    <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                    }}>
                    <span style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        gap: '5px'
                    }}>
                        {/* There is no warning status available in RuxStatus, we can add one, use this workaround, 
                        or have not icon or status symbol for warning errors and rely on the text 
                        TODO: remove/modify comment after decision*/}
                       {
                        alert.errorSeverity !== "warning" 
                        ? (<RuxStatus status={alert.errorSeverity} className="status-icon" />) 
                        :(<RuxIcon icon="warning" size="1rem"></RuxIcon>)
                       }
                        <div className="label" style={{ textAlign: 'center' }}>{alert.errorSeverity}</div>
                    </span>
                    </div>
                </div>
            </div>

            <div>
              <div style={{ margin: '10px 0' }}>
                <strong>Alert Message: </strong>{alert.errorMessage}
              </div>
              
              <div style={{ margin: '10px 0' }}>
                <strong>Contact Time: </strong>
                {getTimeRange(alert.contactBeginTimestamp, alert.contactEndTimestamp)}
              </div>
              
              {alert.longMessage && (
                <div style={{ margin: '10px 0', color: '#666' }}>
                  <strong>Long Message: </strong>{alert.longMessage}
                </div>
              )}
            </div>

            <div slot="footer">
                <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between' 
                    }}>
                    <RuxButton
                        onClick={() => {
                            setSelectedAlert(alert);
                            setIsModalOpen(true);
                        }}
                    >
                        Show Details
                    </RuxButton>
                    {alert.acknowledged && (
                            <span>✓ Acknowledged</span>
                        )}
                </div>
            </div>
          </RuxCard>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && selectedAlert && (

    <RuxDialog
    open={isModalOpen}
    onRuxdialogclosed={(e) => {
        if (e.detail === true) {  // Confirm was clicked
        handleAcknowledge(selectedAlert.errorId);
        }
        // Close the modal in either case
        setIsModalOpen(false);
    }}
        confirmText='Acknowledge'
        denyText='Close'
        title='Alert Details'
        style={{ width: '500px' }}
    >
                <div style={{ marginBottom: '10px' }}>
                    <strong>Satellite: </strong>{selectedAlert.contactSatellite}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Contact Details: </strong>{selectedAlert.contactDetail}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Category: </strong>{selectedAlert.errorCategory}
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <strong>Time: </strong>{formatDate(selectedAlert.errorTime/1000)}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <strong>Full Message: </strong>{selectedAlert.longMessage}
                </div>
    </RuxDialog>
      )}
    </div>
  );
};

export default GRMDashboard;
