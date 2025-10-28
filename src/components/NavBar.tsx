import { useNavigate, useLocation } from 'react-router-dom';

// Standard icons
import AI from '../assets/icons/navbar/standard/aiIcon.svg';
import Course from '../assets/icons/navbar/standard/courseIcon.svg';
import Leaderboard from '../assets/icons/navbar/standard/leaderBoardIcon.svg';
import Profile from '../assets/icons/navbar/standard/profileIcon.svg';
import Home from '../assets/icons/navbar/standard/homeIcon.svg';

// Bold icons
import AIB from '../assets/icons/navbar/bold/aiIconB.svg';
import CourseB from '../assets/icons/navbar/bold/courseIconB.svg';
import LeaderboardB from '../assets/icons/navbar/bold/leaderBoardIconB.svg';
import ProfileB from '../assets/icons/navbar/bold/profileIconB.svg';
import HomeB from '../assets/icons/navbar/bold/homeIconB.svg';


export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, iconBold: HomeB, alt: 'Home' },
    { path: '/learning', icon: Course, iconBold: CourseB, alt: 'Course' },
    { className: 'nav-item-ai', path: '/documents', icon: AI, iconBold: AIB, alt: 'AI' },
    { path: '/leaderboard', icon: Leaderboard, iconBold: LeaderboardB, alt: 'Leaderboard' },
    { path: '/profile', icon: Profile, iconBold: ProfileB, alt: 'Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="nav-items">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                className={`nav-item ${item.className || ''} ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">
                  <img src={isActive ? item.iconBold : item.icon} alt={item.alt} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}