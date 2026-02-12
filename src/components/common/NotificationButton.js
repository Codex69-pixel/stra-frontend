import React from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationButton.css';

const NotificationButton = ({ onClick }) => (
  <button className="notification-btn" onClick={onClick} aria-label="Notifications">
    <FaBell size={20} />
  </button>
);

export default NotificationButton;
