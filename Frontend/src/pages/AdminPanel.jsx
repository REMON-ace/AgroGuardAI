import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate, Link, useParams } from 'react-router-dom';
import { 
  getDashboardStats, 
  getAdminUsers, deleteAdminUser, 
  getAdminDetections, deleteAdminDetection,
  getDetectionDetails, getAnalytics, exportLogs,
  updateProfile, changePassword
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const SidebarLink = ({ to, label, currentPath }) => {
  const isActive = currentPath.includes(to);
  return (
    <Link 
      to={`/admin/${to}`} 
      style={{
        display: 'block', padding: '12px 20px', color: isActive ? '#fff' : '#c8e6c9',
        backgroundColor: isActive ? '#2e7d32' : 'transparent', textDecoration: 'none',
        borderRadius: '8px', marginBottom: '8px', fontWeight: isActive ? 'bold' : 'normal'
      }}
    >
      {label}
    </Link>
  );
};

// ── 1. DASHBOARD VIEW ──────────────────────────────────────────
const DashboardView = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalDetections: 0, frequentDisease: 'N/A', todayDetections: 0 });
  
  useEffect(() => {
    getDashboardStats().then(res => setStats(res.data.stats)).catch(console.error);
  }, []);

  const Card = ({ title, value }) => (
    <div style={{ flex: '1 1 200px', padding: '24px', background: '#e8f5e9', borderRadius: '12px', border: '1px solid #c8e6c9' }}>
      <h3 style={{ color: '#2e7d32', margin: 0, fontSize: '16px' }}>{title}</h3>
      <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0 0', color: '#1b5e20' }}>{value}</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ color: '#1b5e20', marginBottom: '20px' }}>Dashboard Overview</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <Card title="Total Users" value={stats.totalUsers} />
        <Card title="Total Detections Logged" value={stats.totalDetections} />
        <Card title="Detected Today" value={stats.todayDetections} />
        <Card title="Most Frequent Disease" value={stats.frequentDisease} />
      </div>
    </div>
  );
};

// ── 2. USERS VIEW ──────────────────────────────────────────────
const UsersView = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = () => getAdminUsers().then(res => setUsers(res.data.users)).catch(console.error);
  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try { await deleteAdminUser(id); fetchUsers(); } 
      catch (err) { alert(err.response?.data?.message || 'Error deleting user'); }
    }
  };

  return (
    <div>
      <h2 style={{ color: '#1b5e20', marginBottom: '20px' }}>Manage Users</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <thead style={{ background: '#2e7d32', color: 'white', textAlign: 'left' }}>
          <tr>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{u.id}</td>
              <td style={{ padding: '12px' }}>{u.name} {u.role === 'admin' ? ' (Admin)' : ''}</td>
              <td style={{ padding: '12px' }}>{u.email}</td>
              <td style={{ padding: '12px' }}>
                {u.role !== 'admin' && (
                  <button onClick={() => handleDelete(u.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── 3. LOGS FILTER VIEW ────────────────────────────────────────
const LogsView = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filterDisease, setFilterDisease] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const fetchLogs = () => {
    const params = {};
    if (filterDisease) params.disease = filterDisease;
    if (filterDate) params.date = filterDate;
    getAdminDetections(params).then(res => setLogs(res.data.detections)).catch(console.error);
  };
  useEffect(() => { fetchLogs(); }, [filterDisease, filterDate]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this log?")) {
      try { await deleteAdminDetection(id); fetchLogs(); } 
      catch (err) { alert('Error deleting log'); }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1b5e20', margin: 0 }}>Detection Logs</h2>
        <button onClick={exportLogs} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Export CSV</button>
      </div>

      {/* Constraints Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <input 
          placeholder="Filter by Disease Name" value={filterDisease} onChange={(e) => setFilterDisease(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: 1 }}
        />
        <input 
          type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <thead style={{ background: '#2e7d32', color: 'white', textAlign: 'left' }}>
          <tr>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>User ID</th>
            <th style={{ padding: '12px' }}>Disease Name</th>
            <th style={{ padding: '12px' }}>Confidence</th>
            <th style={{ padding: '12px' }}>Date</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{log.id}</td>
              <td style={{ padding: '12px' }}>{log.user_id}</td>
              <td style={{ padding: '12px' }}>{log.disease_name}</td>
              <td style={{ padding: '12px' }}>{parseFloat(log.confidence).toFixed(2)}%</td>
              <td style={{ padding: '12px' }}>{new Date(log.created_at).toLocaleDateString()}</td>
              <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                <button onClick={() => navigate(`/admin/log/${log.id}`)} style={{ background: '#1976d2', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>View</button>
                <button onClick={() => handleDelete(log.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan="6" style={{ padding: '12px', textAlign: 'center' }}>No logs matched filters.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

// ── 4. LOG DETAILS VIEW ──────────────────────────────────────────
const LogDetailsView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  
  useEffect(() => {
    getDetectionDetails(id).then(res => setLog(res.data.detection)).catch(console.error);
  }, [id]);

  if (!log) return <div>Loading details...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: '#eee', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>&larr; Back to Logs</button>
        <h2 style={{ color: '#1b5e20', margin: 0 }}>Log Details #{log.id}</h2>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {log.image_path && (
           <img src={`http://localhost:5000${log.image_path}`} alt="Detected Plant" style={{ width: 'min(100%, 400px)', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        )}
        <div style={{ flex: '1 1 300px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Diagnostic Record</h3>
          <p><strong>Owner:</strong> {log.user_name} ({log.user_email})</p>
          <p><strong>Timestamp:</strong> {new Date(log.created_at).toLocaleString()}</p>
          <p><strong>Disease Identification:</strong> {log.disease_name}</p>
          <p><strong>AI Confidence Score:</strong> {parseFloat(log.confidence).toFixed(2)}%</p>
          
          <h4 style={{ marginTop: '25px', color: '#2e7d32' }}>System Recommendation (Remedy)</h4>
          <p style={{ lineHeight: '1.6', color: '#444' }}>{log.remedy || 'Please consult the plant care catalog for specific remediation steps tailored to this disease.'}</p>
        </div>
      </div>
    </div>
  );
};

// ── 5. ANALYTICS VIEW ────────────────────────────────────────────
const AnalyticsView = () => {
  const [data, setData] = useState({ topDiseases: [], dailyCounts: [] });
  useEffect(() => { getAnalytics().then(res => setData(res.data)).catch(console.error); }, []);
  
  const barData = {
    labels: data.topDiseases.map(d => d.disease_name),
    datasets: [{ label: 'Occurrences', data: data.topDiseases.map(d => d.count), backgroundColor: '#4caf50' }]
  };
  const lineData = {
    labels: data.dailyCounts.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{ label: 'Detections / Day', data: data.dailyCounts.map(d => d.count), borderColor: '#2e7d32', backgroundColor: '#e8f5e9', fill: true, tension: 0.3 }]
  };

  return (
    <div>
      <h2 style={{ color: '#1b5e20', marginBottom: '20px' }}>System Analytics</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        <div style={{ flex: '1 1 400px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 15px', color: '#444' }}>Top 5 Most Common Diseases</h4>
          <Bar data={barData} />
        </div>
        <div style={{ flex: '1 1 400px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h4 style={{ margin: '0 0 15px', color: '#444' }}>Detection Volume Timeline</h4>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

// ── 6. SETTINGS VIEW ───────────────────────────────────────────────
const SettingsView = () => {
  const { user, loginSave, token } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, email });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      loginSave(token, { ...user, name, email });
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword({ currentPassword, newPassword });
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error changing password', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ color: '#1b5e20', marginBottom: '20px' }}>Admin Settings</h2>
      {message.text && (
        <div style={{ padding: '15px', background: message.type === 'error' ? '#ffebee' : '#e8f5e9', color: message.type === 'error' ? '#c62828' : '#2e7d32', marginBottom: '20px', borderRadius: '8px', borderLeft: `4px solid ${message.type === 'error' ? '#c62828' : '#2e7d32'}` }}>
          <strong>{message.type === 'error' ? 'Error: ' : 'Success: '}</strong>{message.text}
        </div>
      )}
      
      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: 0, color: '#444' }}>Edit Profile Setup</h3>
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontWeight: 'bold' }}>Admin Name</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setMessage({text:'', type:''}); }} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontWeight: 'bold' }}>Email Address</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setMessage({text:'', type:''}); }} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }} required />
          </div>
          <button type="submit" style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: 'bold' }}>Save Profile Details</button>
        </form>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginTop: 0, color: '#444' }}>Change Local Password</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontWeight: 'bold' }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setMessage({text:'', type:''}); }} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#555', fontWeight: 'bold' }}>New Password (min 6 characters)</label>
            <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setMessage({text:'', type:''}); }} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', background: '#fafafa' }} minLength="6" required />
          </div>
          <button type="submit" style={{ background: '#1976d2', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: 'bold' }}>Update Password Checksum</button>
        </form>
      </div>
    </div>
  );
};

// ── MASTER LAYOUT ────────────────────────────────────────────────
export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', maxWidth: '1300px', margin: '40px auto', padding: '0 20px', gap: '30px' }}>
      
      {/* Sidebar */}
      <div style={{ width: '250px', background: '#1b5e20', borderRadius: '16px', padding: '24px', color: 'white', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ margin: '0 0 30px', fontSize: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '15px' }}>Admin Panel</h2>
        <nav style={{ flex: 1 }}>
          <SidebarLink to="dashboard" label="Dashboard" currentPath={location.pathname} />
          <SidebarLink to="users" label="Users" currentPath={location.pathname} />
          <SidebarLink to="logs" label="Detection Logs" currentPath={location.pathname} />
          <SidebarLink to="analytics" label="Analytics" currentPath={location.pathname} />
          <SidebarLink to="settings" label="Settings" currentPath={location.pathname} />
        </nav>
        
        <button 
          onClick={handleLogout} 
          style={{ marginTop: '30px', background: '#d32f2f', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' }}
        >
          Logout Admin
        </button>
      </div>

      {/* Main Content Pane */}
      <div style={{ flex: 1, background: '#fafafa', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardView />} />
          <Route path="users" element={<UsersView />} />
          <Route path="logs" element={<LogsView />} />
          <Route path="log/:id" element={<LogDetailsView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="settings" element={<SettingsView />} />
        </Routes>
      </div>

    </div>
  );
}
