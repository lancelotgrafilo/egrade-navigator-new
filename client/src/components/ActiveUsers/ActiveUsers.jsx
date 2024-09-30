import React from 'react';
import styleActiveUsers from './activeUsers.module.css';
import userActive from '../../assets/icons/userActive.png';
import { useActiveUsers } from '../../utils/hooks/activeUsersHooks/useActiveUsers';

export function ActiveUsers() {
  const { activeUsers, loading, error } = useActiveUsers();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading users: {error.message}</p>;

  return (
    <div className={styleActiveUsers.mainContainer}>
      <div className={styleActiveUsers.dashboardContent}>
        <div className={styleActiveUsers.tableContainer}>
          <table className={styleActiveUsers.classInfoTable}>
            <tbody>
              {activeUsers.students.filter(student => student.isActive).map((student) => (
                <tr key={student._id}>
                  <td>
                    <img
                      src={userActive}
                      className={styleActiveUsers.slider}
                      alt="Active"
                    />
                    {student.schoolID}
                  </td>
                  <td className={styleActiveUsers.onlineText}>
                    Online
                  </td>
                </tr>
              ))}
              {activeUsers.facultyStaff.filter(staff => staff.isActive).map((staff) => (
                <tr key={staff._id}>
                  <td>
                    <img
                      src={userActive}
                      className={styleActiveUsers.slider}
                      alt="Active"
                    />
                    {staff.facultyID}
                  </td>
                  <td className={styleActiveUsers.onlineText}>
                    Online
                  </td>
                </tr>
              ))}
              {activeUsers.collegeStaff.filter(staff => staff.isActive).map((staff) => (
                <tr key={staff._id}>
                  <td>
                    <img
                      src={userActive}
                      className={styleActiveUsers.slider}
                      alt="Active"
                    />
                    {staff.ID}
                  </td>
                  <td className={styleActiveUsers.onlineText}>
                    Online
                  </td>
                </tr>
              ))}
              {activeUsers.admins.filter(admin => admin.isActive).map((admin) => (
                <tr key={admin._id}>
                  <td>
                    <img
                      src={userActive}
                      className={styleActiveUsers.slider}
                      alt="Active"
                    />
                    {admin.ID}
                  </td>
                  <td className={styleActiveUsers.onlineText}>
                    Online
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
