import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function AdminRoute() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const decodeToken = jwtDecode(token);
    if (decodeToken.role != 'admin') {
      return <Navigate to="files" replace></Navigate>;
    }
    return <Outlet />;
  } catch (error) {
    localStorage.removeItem('access_token');
    return <Navigate to="/" replace />;
  }
}

export default AdminRoute;
