import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">Pesira Inventory</div>
      <div className="navbar-links">
        <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Products
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Users
          </NavLink>
        )}
      </div>
      <div className="navbar-user">
        <span className="user-info">
          {user?.fullName} <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-user'}`}>{user?.role}</span>
        </span>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
