import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import DashboardOverview from './components/DashboardOverview';
import TicketSubmission from './components/TicketSubmission';
import TicketQueue from './components/TicketQueue';
import ManagementReports from './components/ManagementReports';
import ActivityLog from './components/ActivityLog';
import UserTicketHistory from './components/UserTicketHistory';
import WorkTracker from './components/WorkTracker';
import WhatsAppChatModal from './components/WhatsAppChatModal';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('it_helpdesk_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('it_helpdesk_user', JSON.stringify(user));
    if (user.role === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('submit');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('it_helpdesk_user');
  };

  const fetchData = async () => {
    if (!currentUser) return;
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
    if (currentUser) {
      if (currentUser.role === 'admin' && (activeTab === 'my-tickets')) {
        setActiveTab('dashboard');
      } else if (currentUser.role === 'user' && (activeTab === 'dashboard' || activeTab === 'reports' || activeTab === 'activity' || activeTab === 'tickets')) {
        setActiveTab('submit');
      }
      fetchData();

      const timer = setInterval(() => {
        fetchData();
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="app-container">
      
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onLogout={handleLogout}
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
            Connecting to IT Helpdesk server...
          </div>
        ) : (
          <>
            {/* Common Raise IT Ticket Tab for both roles */}
            {activeTab === 'submit' && (
              <TicketSubmission
                currentUser={currentUser}
                onTicketSubmitted={fetchData}
                setActiveTab={setActiveTab}
              />
            )}

            {/* Common Work Tracker Tab for both roles */}
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

      {/* Footer */}
      <footer style={{
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.825rem'
      }}>
        IT Helpdesk System • Logged in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}) • LAN Access Live
      </footer>

      {/* Floating WhatsApp Ticket Bot Launcher Button */}
      <button
        onClick={() => setIsWhatsAppModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95 group border border-emerald-400/40"
        title="Raise Ticket via WhatsApp Bot"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm pr-1">WhatsApp Ticket Bot</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
      </button>

      {/* WhatsApp Chat Modal */}
      <WhatsAppChatModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />

    </div>
  );
}
