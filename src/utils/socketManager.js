import { io } from 'socket.io-client';

let socket;
let notificationCallback = null;

export const initializeSocket = (studentId) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  // console.log('Initializing socket with API URL:', apiUrl);
  
  if (!socket) {
    socket = io(apiUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      // console.log('Connected to socket server');
      if (studentId) {
        socket.emit('authenticate', studentId);
        // console.log('Sent authentication for student:', studentId);
      }
    });

    socket.on('course_assigned', (data) => {
      // console.log('Received course assignment:', data);
      if (notificationCallback) {
        notificationCallback(data);
      }
    });

    socket.on('course_unassigned', (data) => {
      // console.log('Received course unassignment:', data);
      if (notificationCallback) {
        notificationCallback(data);
      }
    });

    socket.on('disconnect', () => {
      // console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setTimeout(() => {
        // console.log('Attempting to reconnect...');
        socket.connect();
      }, 2000);
    });
  } else if (studentId) {
    socket.emit('authenticate', studentId);
    // console.log('Re-authenticated for student:', studentId);
  }

  return socket;
};

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
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
    notificationCallback = null;
  }
};
