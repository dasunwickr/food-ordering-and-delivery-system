import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

/**
 * Initialize Socket.IO with the HTTP server
 * @param httpServer HTTP server instance
 * @returns The configured Socket.IO server instance
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  if (io) return io;
  
  // Initialize Socket.IO with the HTTP server
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["http://localhost:3000"], // Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    transports: ['websocket', 'polling']
  });

  // Socket.IO event handling
  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    // Driver sends their location update
    socket.on("driver:locationUpdate", ({driverId, location}: {driverId: string, location: {lat: number, lng: number}}) => {
      // Broadcast to clients tracking this driver
      if (io) {
        io.emit(`driver:${driverId}:locationUpdate`, location);
      }
      console.log(`Driver ${driverId} location updated:`, location);
    });

    // Client subscribes to a specific driver's location
    socket.on("subscribe:driverLocation", ({driverId}: {driverId: string}) => {
      socket.join(`driver:${driverId}`);
      console.log(`Client subscribed to driver ${driverId} location updates`);
    });

    // Client unsubscribes from a specific driver's location
    socket.on("unsubscribe:driverLocation", ({driverId}: {driverId: string}) => {
      socket.leave(`driver:${driverId}`);
      console.log(`Client unsubscribed from driver ${driverId} location updates`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get the Socket.IO server instance
 * @returns The Socket.IO server instance if initialized, null otherwise
 */
export const getSocketIO = (): SocketIOServer | null => {
  return io;
};

/**
 * Send a location update for a driver
 * @param driverId The driver ID
 * @param location The location coordinates {lat, lng}
 */
export const sendDriverLocationUpdate = (driverId: string, location: { lat: number, lng: number }): void => {
  if (!io) return;
  io.emit(`driver:${driverId}:locationUpdate`, location);
};