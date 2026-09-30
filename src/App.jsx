import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminLoginModal from './components/AdminLoginModal';
import DashboardOverview from './components/DashboardOverview';
import TicketSubmission from './components/TicketSubmission';
import TicketQueue from './components/TicketQueue';
import ManagementReports from './components/ManagementReports';
import ActivityLog from './components/ActivityLog';
import UserTicketHistory from './components/UserTicketHistory';
import WorkTracker from './components/WorkTracker';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('it_helpdesk_admin') || localStorage.getItem('it_helpdesk_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role === 'admin') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load saved admin user:', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('it_helpdesk_admin') || localStorage.getItem('it_helpdesk_user');
    try {
      if (saved && JSON.parse(saved)?.role === 'admin') return 'dashboard';
    } catch (e) {}
    return 'submit';
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('it_helpdesk_admin', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('it_helpdesk_admin');
    localStorage.removeItem('it_helpdesk_user');
    setActiveTab('submit');
  };

  const fetchData = async () => {
    try {
      const [ticketsRes, statsRes, activityRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/stats'),
        fetch('/api/activity')
      ]);

      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      if (ticketsData.success) setTickets(ticketsData.data);
      if (statsData.success) setStats(statsData.data);
      if (activityData.success) setActivities(activityData.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and Real-Time Live Auto-Polling every 4 seconds
  useEffect(() => {
    fetchData();
    const timer = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Sync tab when admin state changes
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'my-tickets') {
        setActiveTab('dashboard');
      }
    } else {
      if (['dashboard', 'reports', 'activity', 'tickets'].includes(activeTab)) {
        setActiveTab('submit');
      }
    }
  }, [isAdmin]);

  return (
    <div className="app-container">
      
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onLogout={handleLogout}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Main Workspace */}
      <main style={{ flex: 1 }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            fontSize: '1.1rem',
            color: 'var(--text-muted)'
          }}>
            Connecting to SIHPL Helpdesk server...
          </div>
        ) : (
          <>
            {/* Common Raise IT Ticket Tab for all users */}
            {activeTab === 'submit' && (
              <TicketSubmission
                currentUser={currentUser}
                onTicketSubmitted={fetchData}
                setActiveTab={setActiveTab}
              />
            )}

            {/* Common Work Tracker Tab for all users */}
            {activeTab === 'work-tracker' && (
              <WorkTracker
                currentUser={currentUser}
                onWorkItemChanged={fetchData}
              />
            )}

            {/* User View Tabs */}
            {!isAdmin && (
              <>
                {activeTab === 'my-tickets' && (
                  <UserTicketHistory
                    user={currentUser}
                    onRaiseTicketClick={() => setActiveTab('submit')}
                  />
                )}
              </>
            )}

            {/* Admin View Tabs */}
            {isAdmin && (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardOverview
                    stats={stats}
                    tickets={tickets}
                    activities={activities}
                    setActiveTab={setActiveTab}
                  />
                )}

                {activeTab === 'tickets' && (
                  <TicketQueue
                    tickets={tickets}
                    onRefreshTickets={fetchData}
                  />
                )}

                {activeTab === 'reports' && (
                  <ManagementReports
                    stats={stats}
                    tickets={tickets}
                    activities={activities}
                  />
                )}

                {activeTab === 'activity' && (
                  <ActivityLog
                    activities={activities}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Footer */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.825rem'
      }}>
        {isAdmin ? (
          <>SIHPL Helpdesk System • Logged in as <strong>{currentUser.name}</strong> (ADMIN) • LAN Access Live</>
        ) : (
          <>SIHPL Helpdesk System • Operations & User Support Portal • LAN Access Live</>
        )}
      </footer>

    </div>
  );
}
