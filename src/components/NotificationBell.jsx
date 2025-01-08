import { useState, useEffect, useRef } from 'react';
import { BiBell } from 'react-icons/bi';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const NotificationBell = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;
  const notificationRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // First get the user ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/verify`, {
          withCredentials: true
        });
        
        if (response.data.success && response.data.data) {
          setUserId(response.data.data._id);
        }
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };

    getUserId();
  }, [apiUrl]);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('\n=== FETCHING NOTIFICATIONS ===');
        const response = await axios.get(`${apiUrl}/api/notifications`, {
          withCredentials: true
        });
        
        console.log('Raw notification response:', response.data);
        
        // Process notifications
        const processedNotifications = response.data.data.map(notification => ({
          id: notification._id,
          message: notification.message,
          time: new Date(notification.createdAt).toLocaleTimeString(),
          data: notification.data,
          type: notification.type,
          read: notification.read
        }));

        console.log('Processed notifications:', processedNotifications);
        setNotifications(processedNotifications);
        
        // Only count unread notifications
        const unreadCount = processedNotifications.filter(n => !n.read).length;
        setNotificationCount(unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId, apiUrl]);

  // Then setup socket connection once we have the user ID
  useEffect(() => {
    if (!userId) return;

    console.log('\n=== SETTING UP SOCKET CONNECTION ===');
    const newSocket = io(apiUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected, authenticating user:', userId);
      newSocket.emit('authenticate', userId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Socket notification handler
    const handleNewNotification = (data) => {
      console.log('\n=== COURSE NOTIFICATION RECEIVED ===');
      console.log('Raw notification data:', data);
      
      setNotificationCount(prev => prev + 1);
      setNotifications(prev => {
        const newNotification = {
          id: data.id,
          message: data.message,
          time: new Date(data.timestamp).toLocaleTimeString(),
          data: data.data,
          type: data.type,
          read: false
        };
        
        console.log('Processed new notification:', newNotification);
        // Keep only latest 10 notifications
        return [newNotification, ...prev].slice(0, 10);
      });

      toast.success(data.message, {
        duration: 5000,
        position: 'top-right',
      });
    };

    newSocket.on('courseAssigned', handleNewNotification);
    newSocket.on('courseUnassigned', handleNewNotification);

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [userId, apiUrl]);

  // Handle clicking the bell
  const handleClick = async () => {
    if (!showPanel && notificationCount > 0) {
      try {
        // Mark all as read in the backend
        await axios.put(`${apiUrl}/api/notifications/read`, {}, {
          withCredentials: true
        });
        
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setNotificationCount(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
      }
    }
    setShowPanel(!showPanel);
  };

  const renderCourseList = (notification) => {
    console.log('Rendering notification:', notification);
    
    if (!notification.data?.courses?.length) {
      return (
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-sm text-gray-600">No course details available</div>
        </div>
      );
    }

    return notification.data.courses.map((course) => {
      if (!course || !course._id) {
        return (
          <div key={Math.random()} className="bg-gray-50 p-2 rounded">
            <div className="text-sm text-gray-600">Course information unavailable</div>
          </div>
        );
      }

      const isUnassigned = notification.type === 'COURSE_UNASSIGNED';
      
      return (
        <div 
          key={course._id} 
          className={`bg-gray-50 p-2 rounded ${isUnassigned ? 'border-l-4 border-red-500' : ''}`}
        >
          <div className="font-medium text-gray-800">
            {course.title || 'Untitled Course'}
            {isUnassigned && (
              <span className="ml-2 text-xs text-red-500 font-normal">
                Removed
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">{course.description || 'No description available'}</div>
          <div className="mt-1 text-xs text-gray-500">
            Subject: {course.subject || 'N/A'} • Level: {course.level || 'N/A'}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <BiBell className="text-2xl text-gray-300 hover:text-white" />
        {notificationCount > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] text-[10px] font-bold text-white bg-red-600 rounded-full px-1"
          >
            {notificationCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id || notification._id} 
                  className={`p-4 border-b hover:bg-gray-50 ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-800">
                      {notification.message}
                    </div>
                    <span className="text-xs text-gray-500">
                      {notification.time || new Date(notification.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {renderCourseList(notification)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
