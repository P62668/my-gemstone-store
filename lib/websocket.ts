import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { prisma } from './prisma';
import { logger } from '../utils/logger';

// Store active connections
const userSockets = new Map<number, string[]>();

// Initialize WebSocket server
let io: Server | null = null;

export function initializeWebSocket(server: HttpServer) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`[WebSocket] User connected: ${socket.id}`);
    
    // Handle user authentication
    socket.on('authenticate', async (userId: number) => {
      try {
        // Validate user exists
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        
        if (!user) {
          socket.emit('error', { message: 'Invalid user' });
          return;
        }
        
        // Store socket connection
        if (!userSockets.has(userId)) {
          userSockets.set(userId, []);
        }
        
        const sockets = userSockets.get(userId)!;
        sockets.push(socket.id);
        userSockets.set(userId, sockets);
        
        socket.data.userId = userId;
        socket.emit('authenticated', { success: true });
        
        logger.info(`[WebSocket] User authenticated: ${userId}`);
      } catch (error) {
        logger.error('[WebSocket] Authentication error', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`[WebSocket] User disconnected: ${socket.id}`);
      
      // Remove socket from user connections
      if (socket.data.userId) {
        const userId = socket.data.userId;
        const sockets = userSockets.get(userId);
        if (sockets) {
          const updatedSockets = sockets.filter(id => id !== socket.id);
          if (updatedSockets.length > 0) {
            userSockets.set(userId, updatedSockets);
          } else {
            userSockets.delete(userId);
          }
        }
      }
    });
    
    // Handle errors
    socket.on('error', (error) => {
      logger.error('[WebSocket] Socket error', error);
    });
  });
  
  logger.info('[WebSocket] Server initialized');
  return io;
}

// Send notification to specific user
export function sendNotificationToUser(userId: number, notification: any) {
  if (!io) {
    logger.warn('[WebSocket] Server not initialized');
    return;
  }
  
  const sockets = userSockets.get(userId);
  if (sockets && sockets.length > 0) {
    sockets.forEach(socketId => {
      const socket = io?.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('notification', notification);
      }
    });
  }
}

// Send notification to all admins
export async function sendNotificationToAdmins(notification: any) {
  if (!io) {
    logger.warn('[WebSocket] Server not initialized');
    return;
  }
  
  try {
    // Get all admin users
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true }
    });
    
    // Send to each admin
    admins.forEach(admin => {
      const sockets = userSockets.get(admin.id);
      if (sockets && sockets.length > 0) {
        sockets.forEach(socketId => {
          const socket = io?.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit('notification', notification);
          }
        });
      }
    });
  } catch (error) {
    logger.error('[WebSocket] Error sending notification to admins', error);
  }
}

// Broadcast notification to all connected users
export function broadcastNotification(notification: any) {
  if (!io) {
    logger.warn('[WebSocket] Server not initialized');
    return;
  }
  
  io.emit('notification', notification);
}