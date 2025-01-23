import {
  RuxSelect,
  RuxOption,
  RuxMonitoringProgressIcon,
} from "@astrouxds/react";

const AlertFilters = ({ 
  selectedSeverityFilter, 
  setSelectedSeverityFilter, 
  filteredAlerts 
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "10px",
      }}
    >
      <RuxSelect
        label="Filter by Severity"
        value={selectedSeverityFilter}
        onRuxchange={(e) => setSelectedSeverityFilter(e.target.value)}
        style={{
          paddingLeft: "10px",
          width: "200px",
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
        progress={
          Math.round(
            (filteredAlerts.filter((alert) => alert.acknowledged).length /
              filteredAlerts.length) *
              100,
          ) || 0
        }
        min={0}
        max={100}
        range={[
          {
            threshold: 33,
            status: "critical",
          },
          {
            threshold: 66,
            status: "caution",
          },
          {
            threshold: 100,
            status: "normal",
          },
        ]}
        style={{ paddingRight: "10px" }}
        notifications={
          filteredAlerts.filter((alert) => alert.acknowledged).length
        }
        sublabel={`${filteredAlerts.filter((alert) => alert.acknowledged).length} of ${filteredAlerts.length}`}
      />
    </div>
  );
};

export default AlertFilters;
