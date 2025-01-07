import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (studentId) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('Initializing socket with API URL:', apiUrl);
  
  if (!socket) {
    socket = io(apiUrl, {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Authenticate with studentId
      socket.emit('authenticate', studentId);
      console.log('Sent authentication for student:', studentId);
    });

    socket.on('courseAssigned', (data) => {
      console.log('Received course assignment:', data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
