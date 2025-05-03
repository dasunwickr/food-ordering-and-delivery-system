import { io, Socket } from 'socket.io-client';

// Use environment variable for the socket URL or default to localhost
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5003';

let socket: Socket | null = null;

// Function to initialize and get the socket connection
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true // Enable CORS credentials
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

// Register as a driver
export const registerAsDriver = (driverId: string): void => {
  const socket = getSocket();
  
  // Register with the socket server
  socket.emit('driver:register', { driverId });
  console.log(`Registered driver ID ${driverId} with socket server`);
};

// Update driver availability status
export const updateDriverAvailability = (driverId: string, isAvailable: boolean): void => {
  const socket = getSocket();
  
  socket.emit('driver:availability', { 
    driverId, 
    available: isAvailable 
  });
  console.log(`Updated driver ${driverId} availability to ${isAvailable}`);
};

// Subscribe to new order requests
export const subscribeToOrderRequests = (
  callback: (orderRequest: any) => void
): () => void => {
  const socket = getSocket();
  
  // Listen for new order requests
  socket.on('order:request', callback);
  
  // Return a cleanup function
  return () => socket.off('order:request', callback);
};

// Subscribe to order taken notifications
export const subscribeToOrderTaken = (
  callback: (data: { orderId: string }) => void
): () => void => {
  const socket = getSocket();
  
  socket.on('order:taken', callback);
  
  return () => socket.off('order:taken', callback);
};

// Accept an order
export const acceptOrder = (driverId: string, orderId: string): void => {
  const socket = getSocket();
  
  socket.emit('order:accept', { driverId, orderId });
};

// Reject an order
export const rejectOrder = (driverId: string, orderId: string): void => {
  const socket = getSocket();
  
  socket.emit('order:reject', { driverId, orderId });
};

// Subscribe to driver location updates
export const subscribeToDriverLocation = (driverId: string, callback: (location: { lat: number, lng: number }) => void): void => {
  const socket = getSocket();
  
  // Subscribe to driver location updates
  socket.emit('subscribe:driverLocation', { driverId });
  
  // Set up the event listener
  socket.on(`driver:${driverId}:location`, callback);
};

// Unsubscribe from driver location updates
export const unsubscribeFromDriverLocation = (driverId: string): void => {
  const socket = getSocket();
  
  // Unsubscribe from driver location updates
  socket.emit('unsubscribe:driverLocation', { driverId });
  
  // Remove all listeners for this driver - fix event name to match the one we're subscribing to
  socket.off(`driver:${driverId}:location`);
};

// Send driver location update
export const sendDriverLocationUpdate = (driverId: string, location: { lat: number, lng: number }): void => {
  const socket = getSocket();
  socket.emit('driver:location', { driverId, ...location });
};

// Clean up socket connection
export const cleanupSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};