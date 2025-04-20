import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useNotifications = (sessionId) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:3002');
        setSocket(newSocket);

        if (sessionId) {
            newSocket.emit('register-session', sessionId);
        }

        // Cleanup on unmount
        return () => newSocket.disconnect();
    }, [sessionId]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on('new-notification', handleNotification);
        return () => socket.off('new-notification', handleNotification);
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:3002/api/notifications', {
                headers: { 'X-Session-ID': sessionId }
            });
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const createNotification = async (type, text) => {
        try {
            await fetch('http://localhost:3002/api/notifications', {
                method: 'POST',
                headers: { 
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId 
                },
                body: JSON.stringify({ type, text })
            });
        } catch (err) {
            console.error('Failed to create notification:', err);
        }
    };

    return {
        notifications,
        fetchNotifications,
        createNotification
    };
}

export default useNotifications;