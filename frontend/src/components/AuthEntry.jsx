import { Link } from 'react-router-dom';
import './AuthEntry.css';

export default function AuthEntry() {
  return (
    <div className="auth-entry-container">
      <h1>JungleJobs</h1>
      <div className="auth-entry-buttons">
        <Link to="/login" className="auth-entry-button">
          Log In
        </Link>
        <Link to="/signup" className="auth-entry-button">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
