import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;