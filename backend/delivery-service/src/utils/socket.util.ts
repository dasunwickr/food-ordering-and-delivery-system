import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

interface DriverSocket {
  socket: Socket;
  driverId: string;
  available: boolean;
}

// Keep track of connected drivers
const connectedDrivers: Map<string, DriverSocket> = new Map();
// Keep track of pending orders that need a driver
const pendingOrders: Map<string, any> = new Map();

/**
 * Initialize Socket.IO for real-time delivery tracking
 */
export const initializeSocket = (server: HTTPServer): void => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Store the io instance for global access
  global.io = io;

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Listen for driver location updates
    socket.on('driver:location', (data: { driverId: string, lat: number, lng: number }) => {
      // Forward the location update to all clients tracking this driver
      io.emit(`driver:${data.driverId}:location`, {
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString()
      });
    });

    // Listen for driver registration
    socket.on('driver:register', (data: { driverId: string }) => {
      const { driverId } = data;
      console.log(`Driver ${driverId} registered with socket ${socket.id}`);
      
      // Store the driver socket connection
      connectedDrivers.set(driverId, {
        socket,
        driverId,
        available: true
      });
      
      // Send any pending orders to the newly connected driver
      if (pendingOrders.size > 0) {
        for (const [orderId, orderData] of pendingOrders.entries()) {
          socket.emit('order:request', orderData);
        }
      }
    });
    
    // Listen for driver availability updates
    socket.on('driver:availability', (data: { driverId: string, available: boolean }) => {
      const { driverId, available } = data;
      const driverSocket = connectedDrivers.get(driverId);
      if (driverSocket) {
        driverSocket.available = available;
        console.log(`Driver ${driverId} availability updated to ${available}`);
      }
    });
    
    // Listen for order acceptance
    socket.on('order:accept', (data: { driverId: string, orderId: string }) => {
      const { driverId, orderId } = data;
      
      // Remove the order from pending orders
      if (pendingOrders.has(orderId)) {
        pendingOrders.delete(orderId);
        
        // Notify all other drivers that the order has been taken
        connectedDrivers.forEach((driver) => {
          if (driver.driverId !== driverId) {
            driver.socket.emit('order:taken', { orderId });
          }
        });
        
        // Emit an event to notify the system that the order has been accepted
        io.emit('order:assigned', { 
          orderId, 
          driverId,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Listen for order rejection by a driver
    socket.on('order:reject', (data: { driverId: string, orderId: string }) => {
      const { driverId, orderId } = data;
      console.log(`Driver ${driverId} rejected order ${orderId}`);
      
      // Track which drivers have rejected this order to avoid sending to them again
      const order = pendingOrders.get(orderId);
      if (order) {
        if (!order.rejectedBy) {
          order.rejectedBy = [];
        }
        order.rejectedBy.push(driverId);
        pendingOrders.set(orderId, order);
      }
    });

    // Join a room for tracking specific deliveries
    socket.on('join:delivery', (deliveryId: string) => {
      socket.join(`delivery:${deliveryId}`);
      console.log(`Client ${socket.id} joined delivery room: ${deliveryId}`);
    });

    // Leave a delivery tracking room
    socket.on('leave:delivery', (deliveryId: string) => {
      socket.leave(`delivery:${deliveryId}`);
      console.log(`Client ${socket.id} left delivery room: ${deliveryId}`);
    });

    socket.on('disconnect', () => {
      // Remove driver from connected drivers
      for (const [driverId, driverData] of connectedDrivers.entries()) {
        if (driverData.socket.id === socket.id) {
          console.log(`Driver ${driverId} disconnected`);
          connectedDrivers.delete(driverId);
          break;
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.IO initialized');
};

/**
 * Broadcast a new order to all available drivers
 */
export const broadcastNewOrder = (orderId: string, orderData: any): void => {
  console.log(`Broadcasting new order ${orderId} to ${connectedDrivers.size} drivers`);
  
  // Store the order in pending orders
  pendingOrders.set(orderId, {
    ...orderData,
    timestamp: new Date().toISOString(),
    rejectedBy: []
  });
  
  // Broadcast to all available drivers
  connectedDrivers.forEach((driver) => {
    if (driver.available && (!orderData.rejectedBy || !orderData.rejectedBy.includes(driver.driverId))) {
      driver.socket.emit('order:request', {
        ...orderData,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Schedule periodic rebroadcasts of unassigned orders
  scheduleOrderRebroadcast(orderId, orderData);
};

/**
 * Schedule periodic rebroadcasts of an order until it's accepted
 */
const scheduleOrderRebroadcast = (orderId: string, orderData: any): void => {
  const interval = setInterval(() => {
    // Check if order is still pending
    if (pendingOrders.has(orderId)) {
      const order = pendingOrders.get(orderId);
      console.log(`Rebroadcasting order ${orderId} to available drivers`);
      
      // Only broadcast to drivers who haven't rejected it
      connectedDrivers.forEach((driver) => {
        if (driver.available && (!order.rejectedBy || !order.rejectedBy.includes(driver.driverId))) {
          driver.socket.emit('order:request', {
            ...order,
            timestamp: new Date().toISOString()
          });
        }
      });
    } else {
      // Order has been assigned, cancel the interval
      clearInterval(interval);
    }
  }, 30000); // Rebroadcast every 30 seconds
  
  // Automatically clear the interval after 30 minutes (prevent memory leaks)
  setTimeout(() => {
    clearInterval(interval);
    // Remove from pending orders if still there after 30 minutes
    if (pendingOrders.has(orderId)) {
      pendingOrders.delete(orderId);
      global.io?.emit('order:expired', { orderId });
    }
  }, 30 * 60 * 1000);
};