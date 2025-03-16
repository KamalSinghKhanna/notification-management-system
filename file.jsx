import React from 'react';
import './Notification.css'; // Assuming you have a CSS file for styles

const Notification = ({ type, message }) => {
  // Define a mapping of type to class names
  const typeClassMap = {
    success: 'toast-success',
    danger: 'toast-danger',
    warning: 'toast-warning',
  };

  // Get the class name based on the type prop
  const className = typeClassMap[type] || '';

  return (
    <div className={`toast ${className}`}>
      {message}
    </div>
  );
};

export default Notification;
