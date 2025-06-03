import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import './Header.css';

export function Header({ userName, userId, role }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      // Redirect to login page or home after logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const getProfileLink = () => {
    if (role === 'client') {
      return userId ? `/client/${userId}` : '/client';
    } else if (role === 'candidate') {
      return userId ? `/candidate/${userId}` : '/candidate';
    } else {
      return '/profile';
    }
  };

  return (
    <header>
      <div>
        {userName ? `Welcome, ${userName}` : 'Welcome'}
      </div>
      <nav>
        <Link to="/chat">
          Chatroom
        </Link>
        <Link to={getProfileLink()}>
          Profile
        </Link>
        <Link to="/marketplace">
          Marketplace
        </Link>
        <button onClick={handleLogout}>
          Log Out
        </button>
      </nav>
    </header>
  );
}
