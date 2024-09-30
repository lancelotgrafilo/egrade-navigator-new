import React from 'react';
import { useActivityLogs } from '../../utils/hooks/activityLogHooks/useActivityLogs';
import styleHistory from './activityLogHistory.module.css';
import slider from '../../assets/icons/slider.png';

export function ActivityLogHistory() {
  const { logs, loading, error } = useActivityLogs();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching logs</p>;

  return (
    <div className={styleHistory.mainContainer}>
      <div className={styleHistory.dashboardContent}>
        <div className={styleHistory.tableContainer}>
          <table className={styleHistory.classInfoTable}>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <img src={slider} className={styleHistory.slider} />
                    {log.userId} - {log.activity}
                  </td>
                  <td>
                    <span className={styleHistory.timestamp}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
