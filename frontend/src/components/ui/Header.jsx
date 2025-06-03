
import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import './Header.css';

export function Header() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const getProfileLink = () => {
    if (user?.role === 'client') {
      return user?.userId ? `/client/${user.userId}` : '/client';
    } else if (user?.role === 'candidate') {
      return user?.userId ? `/candidate/${user.userId}` : '/candidate';
    } else {
      return '/profile';
    }
  };

  return (
    <header>
      <div>
        {user?.username ? `Welcome, ${user.username}` : 'Welcome'}
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
