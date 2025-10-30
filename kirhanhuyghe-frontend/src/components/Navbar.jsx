import { useState, useEffect } from "react";
import { Link } from 'react-router';
import KLJIcon from "../assets/KLJIcon.png";
import logout from "../assets/logout.png";
import user from "../assets/user.png";
import { ThemeContext } from '../contexts';
import { useTheme } from '../contexts';

export default function Navbar({ username = "Aykon" }) {
  const { darkmode, toggleDarkmode } = useTheme();
  const [isChecked, setIsChecked] = useState(darkmode);

  

  const handleToggle = () => {
    setIsChecked(!isChecked);
    console.log(" light/dark Switch toggled:", !isChecked);
    // TODO - DARK MODE TOGGLEN
    toggleDarkmode();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-blue-950 shadow z-50 flex items-center px-6">
      {/* Links uitgelijnd */}
      <div className="flex items-center gap-6">
        <Link to='/'>
          <img src={KLJIcon} alt="KLJIcon" className="h-18 w-auto" />
        </Link>
      </div>

      {/* Rechts uitgelijnd */}
      <div className="ml-auto flex items-center gap-4">
        <div>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkmode}
              onChange={handleToggle}
            />
            <span className="slider">
              <div className="star star_1"></div>
              <div className="star star_2"></div>
              <div className="star star_3"></div>
              <svg viewBox="0 0 16 16" className="cloud_1 cloud">
                <path
                  transform="matrix(.77976 0 0 .78395-299.99-418.63)"
                  fill="#fff"
                  d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
                ></path>
              </svg>
            </span>
          </label>
          {/* in les: className= hidden:lg:flex ofzoiets*/}
        </div>

        <span className="text-sm font-medium hidden sm:inline leading-none">
          <Link to='/'>Home</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none">
          <Link to='/transactions'>Transacties</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none">
          <Link to='/categories'>Categorieen</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none">
          <Link to='/profile'>
            {username}
          </Link>
        </span>
        <Link to='/profile'>
          <img
            className="h-10 w-10 rounded-full flex-shrink-0"
            src={user}
            alt="user"
          />
        </Link>
        <Link to='/login'>
          <img
            className="h-8 w-auto flex-shrink-0 cursor-pointer"
            src={logout}
            alt="logout"
            onClick={() => console.log("Logout clicked")}
          />
        </Link>
      </div>
    </nav>
  );
}