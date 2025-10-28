import { useNavigate, useLocation } from 'react-router-dom';
import AI from '../assets/icons/aiIcon.svg';
import Course from '../assets/icons/courseIcon.svg';
import Leaderboard from '../assets/icons/leaderBoardIcon.svg';
import Profile from '../assets/icons/profileIcon.svg';
import Home from '../assets/icons/homeIcon.svg';


export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <img src={Home} alt="Home" /> },
    { path: '/learning', icon: <img src={Course} alt="Course" /> },
    { className: 'nav-item-ai', path: '/documents', icon: <img src={AI} alt="AI" /> },
    { path: '/leaderboard', icon: <img src={Leaderboard} alt="Leaderboard" /> },
    { path: '/profile', icon: <img src={Profile} alt="Profile" /> },
    // { path: '/chat', label: 'Chat', icon: '💬' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${item.className || ''} ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {/* <span className="nav-label">{item.label}</span> */}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
