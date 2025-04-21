'use client';
import { useState, useEffect } from 'react';
import useNotifications from './hooks/useNotifications';

const Home = () => {
  const [sessionId, setSessionId] = useState('');
  const {
    notifications,
    fetchNotifications,
    createNotification,
    isConnected
  } = useNotifications(sessionId, setSessionId);

  useEffect(() => {
    const storedId = sessionStorage.getItem('sessionId') || '';
    setSessionId(storedId);
    fetchNotifications();
  }, []);

  const handleInteraction = async (type) => {
      const textMap = {
        like: 'Someone liked your post!',
        comment: 'New comment on your design',
        follow: 'New follower',
        job: 'Job opportunity available'
      };

      if (!sessionId) {
        console.warn("Session ID not set yet.");
        return;
      }

      try {
        await createNotification(type, textMap[type]);
        setTimeout(fetchNotifications, 500);
      } catch (error) {
        console.error('Interaction failed:', error);
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notification System</h1>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">
          Connection Status:
          <span className={`ml-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          Session: <code className="bg-gray-100 p-1 rounded">{sessionId || 'Not established'}</code>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {['like', 'comment', 'follow', 'job'].map((type) => (
          <button
            key={type}
            onClick={() => handleInteraction(type)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          >
            Simulate {type}
          </button>
        ))}
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet</p>
        ) : (
          <ul className="space-y-3">
            {notifications.map((notif) => (
              <li key={notif.id} className="bg-white p-4 rounded shadow">
                <div className="flex flex-col items-start">
                  <p className="font-medium">{notif.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;