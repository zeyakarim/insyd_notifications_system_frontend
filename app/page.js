'use client';
import { useState, useEffect, useCallback } from 'react';
import useNotifications from './hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    notifications,
    fetchNotifications,
    createNotification,
    isConnected,
    markAsRead,
    deleteNotification,
  } = useNotifications(sessionId, setSessionId);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredNotifications = activeFilter === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === activeFilter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const init = useCallback(async () => {
    const storedId = sessionStorage.getItem('sessionId') || '';
    setSessionId(storedId);
    await fetchNotifications();
    setLoading(false);
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const handleInteraction = async (type) => {
    if (!sessionId) {
      console.warn('No session ID yet.');
      return;
    }

    const textMap = {
      like: 'Someone liked your post!',
      comment: 'New comment on your design',
      follow: 'New follower',
      job: 'Job opportunity available',
    };

    try {
      setCreating(true);
      await createNotification(type, textMap[type]);
      await fetchNotifications();
    } catch (error) {
      console.error('Interaction failed:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleNotificationClick = async (id) => {
    if (expandedNotification === id) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(id);
      await markAsRead(id);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotification(id);
    await fetchNotifications();
  };

  const getTypeIcon = (type) => {
    const icons = {
      like: '👍',
      comment: '💬',
      follow: '👤',
      job: '💼',
    };
    return icons[type] || '🔔';
  };

  const getTypeColor = (type) => {
    const colors = {
      like: 'from-pink-100 to-pink-50',
      comment: 'from-blue-100 to-blue-50',
      follow: 'from-purple-100 to-purple-50',
      job: 'from-green-100 to-green-50',
    };
    return colors[type] || 'from-gray-100 to-gray-50';
  };

  const getTypeButtonColor = (type) => {
    const colors = {
      like: 'bg-pink-500 hover:bg-pink-600',
      comment: 'bg-blue-500 hover:bg-blue-600',
      follow: 'bg-purple-500 hover:bg-purple-600',
      job: 'bg-green-500 hover:bg-green-600',
    };
    return colors[type] || 'bg-gray-500 hover:bg-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Floating Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 shadow-lg ${
          isScrolled ? 'bg-white/90 py-2' : 'bg-white/80 py-4'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="text-2xl p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 ml-7 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              Notification Center
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {sessionId && (
              <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-gray-500">Session:</span>
                <code className="text-xs font-mono text-gray-700">
                  {sessionId.substring(0, 6)}...{sessionId.slice(-4)}
                </code>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
          >
            Stay Updated in Real-Time
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Manage all your notifications in one place with our beautiful and intuitive interface.
          </motion.p>
        </section>

        {/* Interaction Panel */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 mb-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Notifications</h3>
              <p className="text-sm text-gray-500">Simulate different notification types</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full md:w-auto">
              {['like', 'comment', 'follow', 'job'].map((type) => (
                <motion.button
                  key={type}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleInteraction(type)}
                  disabled={creating || !isConnected}
                  className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
                    creating || !isConnected
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : `${getTypeButtonColor(type)} text-white shadow-md`
                  }`}
                >
                  <span className="text-2xl mb-1">{getTypeIcon(type)}</span>
                  <span className="text-sm font-medium">
                    {creating ? 'Sending...' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Notifications Panel */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-8 shadow-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
                Your Notifications
                {unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-1">
                    {unreadCount} unread
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {filteredNotifications.length} {filteredNotifications.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <div className="flex space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
              {['all', 'like', 'comment', 'follow', 'job'].map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : `${filter.charAt(0).toUpperCase() + filter.slice(1)}s`}
                </motion.button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"
              ></motion.div>
              <p className="text-gray-500">Loading your notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-400 mb-2 font-medium">No notifications found</p>
              <p className="text-sm text-gray-500">
                {activeFilter === 'all' 
                  ? 'Your notification list is empty'
                  : `No ${activeFilter} notifications to display`}
              </p>
            </motion.div>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence>
                {filteredNotifications.map((notif) => (
                  <motion.li
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={`p-5 rounded-xl cursor-pointer transition-all duration-200 ${
                      notif.read 
                        ? 'bg-gray-50 hover:bg-gray-100' 
                        : `bg-gradient-to-r ${getTypeColor(notif.type)} hover:shadow-md`
                    } ${
                      expandedNotification === notif.id ? 'ring-2 ring-blue-400' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-2xl p-3 rounded-full ${
                        notif.read ? 'bg-white' : 'bg-white/80'
                      } shadow-sm`}>
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`font-medium ${
                            notif.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notif.text}
                          </p>
                          <motion.button 
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="text-gray-400 hover:text-red-500 p-1"
                            aria-label="Delete notification"
                          >
                            ✕
                          </motion.button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                        
                        {expandedNotification === notif.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                          >
                            <p className="text-gray-700 mb-4">
                              Here you can see more details about this notification. 
                              The content would be dynamically loaded based on the notification type.
                            </p>
                            <div className="flex gap-3">
                              <motion.button 
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow-md"
                              >
                                View Details
                              </motion.button>
                              <motion.button 
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                className="text-sm bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-200"
                              >
                                Dismiss
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl p-2 bg-blue-500 text-white rounded-lg">
                🔔
              </div>
              <h2 className="text-xl font-bold">Notification Center</h2>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-gray-300">Stay connected with your updates</p>
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Notification Center. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-white transition">Privacy</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white transition">Contact</a>
            </div>
            
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-white transition text-2xl">📱</a>
              <a href="#" className="text-gray-300 hover:text-white transition text-2xl">💻</a>
              <a href="#" className="text-gray-300 hover:text-white transition text-2xl">📧</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;