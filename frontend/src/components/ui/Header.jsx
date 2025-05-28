import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

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
    <header className="bg-gray-100 p-4 flex justify-between items-center shadow-md">
      <div className="text-lg font-semibold">
        {userName ? `Welcome, ${userName}` : 'Welcome'}
      </div>
      <nav className="space-x-4">
        <Link to="/chat" className="text-blue-600 hover:underline">
          Chatroom
        </Link>
        <Link to={getProfileLink()} className="text-blue-600 hover:underline">
          Profile
        </Link>
        <Link to="/marketplace" className="text-blue-600 hover:underline">
          Marketplace
        </Link>
        <button
          onClick={handleLogout}
          className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Log Out
        </button>
      </nav>
    </header>
  );
}
