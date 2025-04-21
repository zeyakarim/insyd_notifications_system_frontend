import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const useNotifications = (sessionId, setSessionId) => {
    const [notifications, setNotifications] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // Initialize socket connection
    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
            transports: ['websocket'], // Force WebSocket transport
            withCredentials: true,
        });

        // Connection events
        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
            setConnectionError(null);
            if (sessionId) {
                socketInstance.emit('register-session', sessionId);
            }
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // The disconnection was initiated by the server, you need to reconnect manually
                socketInstance.connect();
            }
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
            setConnectionError(err.message);
            setIsConnected(false);
        });

        socketInstance.on('reconnect_attempt', (attempt) => {
            console.log(`Reconnection attempt ${attempt}`);
        });

        socketInstance.on('reconnect_error', (err) => {
            console.error('Reconnection error:', err.message);
        });

        socketInstance.on('reconnect_failed', () => {
            console.error('Reconnection failed');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.off('connect');
            socketInstance.off('disconnect');
            socketInstance.off('connect_error');
            socketInstance.off('reconnect_attempt');
            socketInstance.off('reconnect_error');
            socketInstance.off('reconnect_failed');
            socketInstance.disconnect();
        };
    }, [sessionId]);

    // Notification handler
    useEffect(() => {
        if (!socket) return;

        const onNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
        };

        socket.on('new-notification', onNotification);

        return () => {
            socket.off('new-notification', onNotification);
        };
    }, [socket]);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`, {
                headers: sessionId ? { 'X-Session-ID': sessionId } : {},
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const resSessionId = response.headers.get('X-Session-ID');
            if (resSessionId && !sessionId) {
                sessionStorage.setItem('sessionId', resSessionId);
                setSessionId(resSessionId);
            }

            const { data } = await response.json();
            setNotifications(data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            throw err;
        }
    }, [sessionId, setSessionId]);

    const createNotification = useCallback(async (type, text) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                body: JSON.stringify({ type, text }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error('Failed to create notification:', err);
            throw err;
        }
    }, [sessionId]);

    const markAsReadNotification = useCallback(async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error('Failed to create notification:', err);
            throw err;
        }
    }, [sessionId]);

    const deleteNotification = useCallback(async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Session-ID': sessionId
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.error('Failed to create notification:', err);
            throw err;
        }
    }, [sessionId]);

    return {
        notifications,
        fetchNotifications,
        createNotification,
        markAsReadNotification,
        deleteNotification,
        isConnected,
        connectionError,
        socketId: socket?.id
    };
};

export default useNotifications;