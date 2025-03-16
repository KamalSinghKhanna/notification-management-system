import { useEffect, useState } from "react";
import Notification from "./Notification";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const eventSource = new EventSource("http://localhost:5000/api/v1/notifications/stream");

  //   eventSource.onmessage = (event) => {
  //     try {
  //       const newNotification = JSON.parse(event.data);
  //       console.log('Received notification:', newNotification); // Debug log
  //       setNotifications((prev) => [newNotification, ...prev]);
  //     } catch (error) {
  //       console.error('Error parsing notification:', error);
  //     }
  //   };

  //   eventSource.onerror = (error) => {
  //     console.error('EventSource failed:', error);
  //     setError('Failed to connect to notification stream');
  //     eventSource.close();
  //   };

  //   // Fetch existing notifications on component mount
  //   const fetchExistingNotifications = async () => {
  //     try {
  //       const response = await fetch('http://localhost:5000/api/v1/notifications');
  //       const data = await response.json();
  //       setNotifications(data);
  //     } catch (error) {
  //       console.error('Error fetching notifications:', error);
  //     }
  //   };

  //   fetchExistingNotifications();

  //   return () => {
  //     console.log('Closing EventSource connection'); // Debug log
  //     eventSource.close();
  //   };
  // }, []);
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/api/v1/notifications/stream");
  
    eventSource.onmessage = (event) => {
      try {
        console.log('Received SSE Event:', event.data); // Debug log
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
      } catch (error) {
        console.error('Error parsing SSE notification:', error);
        setError(error || 'error')
      }
    };
  
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };
  
    return () => {
      eventSource.close();
    };
  }, []);
  
  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((notification) => (
            // <div 
            //   key={notification._id || Math.random()} 
            //   className="p-3 bg-gray-100 rounded-lg shadow"
            // >
            //   <p className="text-sm font-semibold">{notification.type?.toUpperCase()}</p>
            //   <p className="text-gray-700">{notification.message}</p>
            //   <p className="text-xs text-gray-500">Status: {notification.status}</p>
            // </div>
            <Notification key={notification._id} {...notification} />
          ))
        )}
      </div>
    </div>
  );
}