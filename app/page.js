'use client'
import { useState, useEffect } from 'react';
import useNotifications from './hooks/useNotifications';
import styles from './Home.module.css';

export default function Home() {
  const [sessionId, setSessionId] = useState('');
  const { notifications, fetchNotifications, createNotification } = useNotifications(sessionId);

  useEffect(() => {
    // Get or create session ID
    const storedId = sessionStorage.getItem('sessionId') || '';
    setSessionId(storedId);
    if (storedId) fetchNotifications();
  }, []);

  const handleInteraction = async (type) => {
    const textMap = {
      like: 'Someone liked your post!',
      comment: 'New comment on your design',
      follow: 'New follower',
      job: 'Job opportunity available'
    };

    if (!sessionId) {
      const newId = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      sessionStorage.setItem('sessionId', newId);
      setSessionId(newId);
    }

    await createNotification(type, textMap[type]);
  };

  return (
    <div className={styles.container}>
      <h1>Notification System</h1>
      <p>Session: {sessionId || 'Not established'}</p>

      <div className='flex flex-col gap-4'>
        {['like', 'comment', 'follow', 'job'].map((type) => (
          <button key={type} onClick={() => handleInteraction(type)}>
            Simulate {type}
          </button>
        ))}
      </div>

      <div className={styles.notifications}>
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          <ul>
            {notifications.map((notif) => (
              <li key={notif.id} className={styles.notification}>
                <strong>{notif.type}</strong>: {notif.text}
                <small>{new Date(notif.created_at).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}