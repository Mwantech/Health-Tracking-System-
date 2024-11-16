import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SchedulingInterface = ({ doctorId }) => {
  const [schedulingStatus, setSchedulingStatus] = useState('idle');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [changes, setChanges] = useState([]);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/api/doctor/${doctorId}/appointments`
      );
      setAppointments(response.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  const optimizeSchedule = async () => {
    setSchedulingStatus('optimizing');
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:3001/api/scheduling/optimize/${doctorId}`,
        {
          date: selectedDate.toISOString().split('T')[0]
        }
      );

      setChanges(response.data.changes);
      setSchedulingStatus('completed');
      fetchAppointments(); // Refresh appointments after optimization
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to optimize schedule');
      setSchedulingStatus('error');
    }
  };

  // Helper function to generate calendar days
  const generateCalendarDays = () => {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const days = [];
    const firstDay = date.getDay();
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`empty-${i}`} className="calendar-cell empty"></td>);
    }
    
    // Add cells for each day of the month
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i);
      const dateString = currentDate.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(app => app.date === dateString);
      
      days.push(
        <td 
          key={i} 
          className={`calendar-cell ${currentDate.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
          onClick={() => setSelectedDate(currentDate)}
        >
          <div className="date-number">{i}</div>
          {dayAppointments.length > 0 && (
            <div className="appointment-indicator">
              {dayAppointments.length} appt{dayAppointments.length !== 1 ? 's' : ''}
            </div>
          )}
        </td>
      );
    }
    
    return days;
  };

  return (
    <div className="scheduling-interface">
      <style>
        {`
          .scheduling-interface {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }

          .view-toggle {
            display: flex;
            gap: 10px;
          }

          .toggle-button {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: #fff;
            cursor: pointer;
            border-radius: 4px;
          }

          .toggle-button.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
          }

          .calendar {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
          }

          .calendar-header {
            background: #f8f9fa;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .month-nav {
            display: flex;
            gap: 10px;
            align-items: center;
          }

          .nav-button {
            padding: 5px 10px;
            border: 1px solid #ddd;
            background: #fff;
            cursor: pointer;
            border-radius: 4px;
          }

          .calendar-table {
            width: 100%;
            border-collapse: collapse;
          }

          .calendar-table th {
            padding: 10px;
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
          }

          .calendar-cell {
            height: 100px;
            border: 1px solid #ddd;
            vertical-align: top;
            padding: 5px;
            cursor: pointer;
          }

          .calendar-cell:hover {
            background: #f8f9fa;
          }

          .calendar-cell.selected {
            background: #e3f2fd;
          }

          .calendar-cell.empty {
            background: #f8f9fa;
          }

          .date-number {
            font-weight: bold;
            margin-bottom: 5px;
          }

          .appointment-indicator {
            font-size: 12px;
            color: #666;
            background: #e3f2fd;
            padding: 2px 4px;
            border-radius: 3px;
            display: inline-block;
          }

          .actions {
            margin-top: 20px;
            display: flex;
            gap: 10px;
          }

          .action-button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
          }

          .optimize-button {
            background: #28a745;
            color: white;
          }

          .optimize-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
          }

          .refresh-button {
            background: #6c757d;
            color: white;
          }

          .error-message {
            margin-top: 20px;
            padding: 15px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
          }

          .changes-section {
            margin-top: 20px;
          }

          .changes-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          .changes-table th,
          .changes-table td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
          }

          .changes-table th {
            background: #f8f9fa;
          }

          .changes-table tr:hover {
            background: #f8f9fa;
          }

          .reason-tag {
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
          }

          .reason-conflict {
            background: #f8d7da;
            color: #721c24;
          }

          .reason-break {
            background: #d4edda;
            color: #155724;
          }

          .reason-redistribution {
            background: #cce5ff;
            color: #004085;
          }
        `}
      </style>

      <div className="header">
        <h2 className="title">Schedule Optimization</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-button ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
          <button 
            className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {viewMode === 'calendar' && (
        <div className="calendar">
          <div className="calendar-header">
            <div className="month-nav">
              <button 
                className="nav-button"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
              >
                ←
              </button>
              <span>
                {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                className="nav-button"
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
              >
                →
              </button>
            </div>
          </div>
          <table className="calendar-table">
            <thead>
              <tr>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil((generateCalendarDays().length) / 7) }, (_, i) => (
                <tr key={i}>
                  {generateCalendarDays().slice(i * 7, (i + 1) * 7)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="actions">
        <button 
          className="action-button optimize-button"
          onClick={optimizeSchedule}
          disabled={schedulingStatus === 'optimizing'}
        >
          {schedulingStatus === 'optimizing' ? 'Optimizing...' : 'Optimize Schedule'}
        </button>
        <button 
          className="action-button refresh-button"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {changes.length > 0 && (
        <div className="changes-section">
          <h3>Schedule Changes</h3>
          <table className="changes-table">
            <thead>
              <tr>
                <th>Appointment</th>
                <th>Original Time</th>
                <th>New Time</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, index) => (
                <tr key={index}>
                  <td>#{change.appointmentId}</td>
                  <td>{`${change.oldDate} ${change.oldTime}`}</td>
                  <td>{`${change.newDate} ${change.newTime}`}</td>
                  <td>
                    <span className={`reason-tag reason-${change.reason}`}>
                      {change.reason.charAt(0).toUpperCase() + change.reason.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SchedulingInterface;





import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorsPanelPage = ({ doctorId: propDoctorId, isAdmin = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedulingStatus, setSchedulingStatus] = useState('idle');
  const [changes, setChanges] = useState([]);
  const [viewMode, setViewMode] = useState('appointments'); // 'appointments' or 'scheduler'
  const { id: urlDoctorId } = useParams();
  const navigate = useNavigate();

  const effectiveDoctorId = propDoctorId || urlDoctorId || localStorage.getItem('doctorId');

  useEffect(() => {
    fetchAppointments();
  }, [effectiveDoctorId, selectedDate]);

  const fetchAppointments = async () => {
    if (!effectiveDoctorId) {
      setError('No doctor ID available. Please log in again.');
      setLoading(false);
      navigate(isAdmin ? '/admin-login' : '/doctor-login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `http://localhost:3001/api/doctor/${effectiveDoctorId}/appointments`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const optimizeSchedule = async () => {
    setSchedulingStatus('optimizing');
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:3001/api/scheduling/optimize/${effectiveDoctorId}`,
        {
          date: selectedDate.toISOString().split('T')[0]
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setChanges(response.data.changes);
      setSchedulingStatus('completed');
      fetchAppointments(); // Refresh appointments after optimization
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to optimize schedule');
      setSchedulingStatus('error');
    }
  };

  if (loading) return <div className="doctors-panel">Loading...</div>;
  if (error) return <div className="doctors-panel error-message">{error}</div>;

  return (
    <div className="doctors-panel">
      <style>
        {`
          .doctors-panel {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }

          .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
          }

          .view-controls {
            display: flex;
            gap: 10px;
          }

          .view-button {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 4px;
            font-weight: bold;
          }

          .view-button.active {
            background: #007bff;
            color: white;
            border-color: #007bff;
          }

          .appointments-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          .appointments-table th,
          .appointments-table td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
          }

          .appointments-table th {
            background: #f8f9fa;
            font-weight: bold;
          }

          .appointments-table tr:hover {
            background: #f8f9fa;
          }

          .optimization-controls {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }

          .action-button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin-right: 10px;
          }

          .optimize-button {
            background: #28a745;
            color: white;
          }

          .optimize-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
          }

          .changes-section {
            margin-top: 20px;
            padding: 20px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
          }

          .error-message {
            padding: 15px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            margin-bottom: 20px;
          }

          .success-message {
            padding: 15px;
            background: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 4px;
            color: #155724;
            margin-bottom: 20px;
          }
        `}
      </style>

      <div className="panel-header">
        <h1>{isAdmin ? 'Admin Panel' : "Doctor's Panel"}</h1>
        <div className="view-controls">
          <button 
            className={`view-button ${viewMode === 'appointments' ? 'active' : ''}`}
            onClick={() => setViewMode('appointments')}
          >
            Appointments
          </button>
          <button 
            className={`view-button ${viewMode === 'scheduler' ? 'active' : ''}`}
            onClick={() => setViewMode('scheduler')}
          >
            Schedule Optimization
          </button>
        </div>
      </div>

      {viewMode === 'appointments' ? (
        <div className="appointments-view">
          <h2>Your Appointments</h2>
          {appointments.length === 0 ? (
            <p>No appointments scheduled.</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Room Code</th>
                  <th>Issues</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr key={index}>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.userEmail}</td>
                    <td>{appointment.roomCode}</td>
                    <td>{appointment.issues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="scheduler-view">
          <h2>Schedule Optimization</h2>
          
          <div className="optimization-controls">
            <button 
              className="action-button optimize-button"
              onClick={optimizeSchedule}
              disabled={schedulingStatus === 'optimizing'}
            >
              {schedulingStatus === 'optimizing' ? 'Optimizing...' : 'Optimize Schedule'}
            </button>
            <p>
              This will automatically adjust appointments to:
              <ul>
                <li>Add breaks between consecutive appointments</li>
                <li>Resolve scheduling conflicts</li>
                <li>Redistribute workload if needed</li>
              </ul>
            </p>
          </div>

          {schedulingStatus === 'completed' && changes.length > 0 && (
            <div className="changes-section">
              <h3>Schedule Changes</h3>
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Appointment</th>
                    <th>Original Time</th>
                    <th>New Time</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change, index) => (
                    <tr key={index}>
                      <td>#{change.appointmentId}</td>
                      <td>{`${change.oldDate} ${change.oldTime}`}</td>
                      <td>{`${change.newDate} ${change.newTime}`}</td>
                      <td>{change.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DoctorsPanelPage;