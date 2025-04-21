import { Link } from 'react-router-dom';

export default function AuthEntry() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
      <h1 className="text-3xl font-bold">Welcome to MyApp</h1>
      <div className="flex space-x-4">
        <Link to="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Log In
          </button>
        </Link>
        <Link to="/signup">
          <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}
