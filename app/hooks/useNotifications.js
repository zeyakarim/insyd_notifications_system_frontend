import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useNotifications = (sessionId, setSessionId) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002', {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onConnect = () => {
            setIsConnected(true);
            if (sessionId) {
                socket.emit('register-session', sessionId);
            }
        };

        const onDisconnect = () => setIsConnected(false);
        const onNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('new-notification', onNotification);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('new-notification', onNotification);
        };
    }, [socket, sessionId]);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/notifications`, {
                headers: sessionId ? { 'X-Session-ID': sessionId } : {}
            });

            const resSessionId = response.headers.get('X-Session-ID');
            if (resSessionId && !sessionId) {
                sessionStorage.setItem('sessionId', resSessionId);
                setSessionId(resSessionId);
            }

            const { data } = await response.json();
            setNotifications(data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const createNotification = async (type, text) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/api/notifications/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({ type, text })
            });
        } catch (err) {
            console.error('Failed to create notification:', err);
            throw err;
        }
    };

    return {
        notifications,
        fetchNotifications,
        createNotification,
        isConnected
    };
};

export default useNotifications;