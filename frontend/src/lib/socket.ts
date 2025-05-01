import { io, Socket } from 'socket.io-client';

// Use environment variable for the socket URL or default to delivery-service
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://delivery-service:5003';

let socket: Socket | null = null;

// Function to initialize and get the socket connection
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Log connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  }

  return socket;
};

// Subscribe to driver location updates
export const subscribeToDriverLocation = (driverId: string, callback: (location: { lat: number, lng: number }) => void): void => {
  const socket = getSocket();
  
  // Subscribe to driver location updates
  socket.emit('subscribe:driverLocation', { driverId });
  
  // Set up the event listener
  socket.on(`driver:${driverId}:locationUpdate`, callback);
};

// Unsubscribe from driver location updates
export const unsubscribeFromDriverLocation = (driverId: string): void => {
  const socket = getSocket();
  
  // Unsubscribe from driver location updates
  socket.emit('unsubscribe:driverLocation', { driverId });
  
  // Remove all listeners for this driver
  socket.off(`driver:${driverId}:locationUpdate`);
};

// Send driver location update
export const sendDriverLocationUpdate = (driverId: string, location: { lat: number, lng: number }): void => {
  const socket = getSocket();
  socket.emit('driver:locationUpdate', { driverId, location });
};

// Clean up socket connection
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};