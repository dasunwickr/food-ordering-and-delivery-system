import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5003';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;


export const getSocket = (): Socket => {
  if (!socket) {
    console.log(`Initializing socket connection to ${SOCKET_URL}`);
    
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], 
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: true 
    });

    // Log connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully:', socket?.id);
      reconnectAttempts = 0; 
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason);
      
     
      if (reason === 'io server disconnect') {
        console.log('Server disconnected the socket. Attempting to reconnect...');
        socket?.connect();
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      reconnectAttempts++;
      
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error(`Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts. Will retry manually.`);
        
        // Try a manual reconnection after a delay
        setTimeout(() => {
          console.log('Attempting manual reconnection...');
          socket?.connect();
          reconnectAttempts = 0;
        }, 5000);
      }
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });
    
    socket.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err.message);
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
  
  // Remove any existing listeners to prevent duplicates
  socket.off('order:request');
  
  // Listen for new order requests
  socket.on('order:request', (orderData) => {
    console.log('Received order request:', orderData);
    callback(orderData);
  });
  
  // Return a cleanup function
  return () => socket.off('order:request', callback);
};

// Subscribe to order taken notifications
export const subscribeToOrderTaken = (
  callback: (data: { orderId: string }) => void
): () => void => {
  const socket = getSocket();
  
  // Remove any existing listeners to prevent duplicates
  socket.off('order:taken');
  
  socket.on('order:taken', (data) => {
    console.log('Received order taken notification:', data);
    callback(data);
  });
  
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