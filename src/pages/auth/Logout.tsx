import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../hooks/useAuth.tsx";


const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear user session/token
        await logout();

        // Remove auth token from localStorage
        localStorage.removeItem('authToken');

        // Redirect to login page
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        // Optionally handle error case
        navigate('/login');
      }
    };

    handleLogout();
  }, [logout, navigate]);

  // Optional loading state while logout is processing
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Logging out...</p>
    </div>
  );
};

export default Logout;