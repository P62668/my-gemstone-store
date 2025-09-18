import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';
import { Socket } from 'net';
import { initializeWebSocket } from '../../lib/websocket';

// Extend NextApiResponse to include socket
interface NextApiRequestWithSocket extends NextApiRequest {
  socket: Socket & {
    server?: any;
  };
}

export default function handler(req: NextApiRequestWithSocket, res: NextApiResponse) {
  if (res.socket && (res.socket as any).server && !(res.socket as any).server.io) {
    console.log('[WebSocket] Initializing WebSocket server');
    const io = initializeWebSocket((res.socket as any).server);
    (res.socket as any).server.io = io;
  }
  
  res.end();
}

// Enable streaming response
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
};