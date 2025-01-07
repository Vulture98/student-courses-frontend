import { useState, useEffect } from 'react';
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

  // First get the user ID and fetch notifications
  useEffect(() => {
    const getUserIdAndNotifications = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/auth/verify`, {
          withCredentials: true
        });
        
        if (response.data.success && response.data.data) {
          setUserId(response.data.data._id);
          
          // Fetch unread notifications
          const notifResponse = await axios.get(`${apiUrl}/api/notifications`, {
            withCredentials: true
          });
          
          if (notifResponse.data.success) {
            setNotifications(notifResponse.data.data);
            setNotificationCount(notifResponse.data.data.length);
          }
        }
      } catch (error) {
        console.error('Failed to get user ID or notifications:', error);
      }
    };

    getUserIdAndNotifications();
  }, [apiUrl]);

  // Then setup socket connection once we have the user ID
  useEffect(() => {
    if (!userId) return;

    console.log('\n=== NOTIFICATION BELL MOUNTED ===');
    console.log('Connecting to socket at:', apiUrl);
    console.log('User ID:', userId);

    const newSocket = io(apiUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('\n=== SOCKET CONNECTED ===');
      console.log('Socket ID:', newSocket.id);
      
      console.log('Authenticating socket with user ID:', userId);
      newSocket.emit('authenticate', userId);
    });

    newSocket.on('connect_error', (error) => {
      console.error('\n=== SOCKET CONNECTION ERROR ===');
      console.error('Error:', error.message);
    });

    const handleNewNotification = (data) => {
      console.log('\n=== COURSE NOTIFICATION RECEIVED ===');
      console.log('Notification data:', data);
      
      setNotificationCount(prev => prev + 1);
      
      const time = new Date(data.timestamp || Date.now()).toLocaleTimeString();
      setNotifications(prev => [{
        id: Date.now(),
        message: data.message,
        time: time,
        data: {
          courses: data.data?.courses || data.courses
        },
        read: false
      }, ...prev]);

      toast.success(data.message, {
        duration: 5000,
        position: 'top-right',
      });
    };

    newSocket.on('courseAssigned', handleNewNotification);

    setSocket(newSocket);

    return () => {
      console.log('\n=== CLEANING UP SOCKET ===');
      newSocket.disconnect();
    };
  }, [userId, apiUrl]);

  const handleClick = () => {
    setShowPanel(!showPanel);
  };

  const clearNotifications = async () => {
    try {
      await axios.put(`${apiUrl}/api/notifications/read`, {}, {
        withCredentials: true
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setNotificationCount(0);
      setShowPanel(false);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const renderCourseList = (notification) => {
    // Try to get courses from either format
    const courses = notification.data?.courses || notification.courses;
    
    if (!courses || !Array.isArray(courses)) {
      return (
        <div className="bg-gray-50 p-2 rounded">
          <div className="text-sm text-gray-600">Course details not available</div>
        </div>
      );
    }

    return courses.map((course) => (
      <div key={course._id} className="bg-gray-50 p-2 rounded">
        <div className="font-medium text-gray-800">{course.title}</div>
        <div className="text-sm text-gray-600">{course.description}</div>
        <div className="mt-1 text-xs text-gray-500">
          Subject: {course.subject || 'N/A'} • Level: {course.level || 'N/A'}
        </div>
      </div>
    ));
  };

  return (
    <div className="relative">
      <div className="cursor-pointer p-2 hover:bg-gray-700 rounded-full" onClick={handleClick}>
        <BiBell className="text-2xl text-gray-300 hover:text-white" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {notificationCount}
          </span>
        )}
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            )}
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
