import { Link } from 'react-router';
import { useAuth } from '../contexts/auth';
import KLJIcon from "../assets/KLJIcon.png";
import logout from "../assets/logout.png";
import { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Tooltip
} from '@mui/material';

export default function Navbar() {
  const { user } = useAuth();

  const fullName = user ? `${user.voornaam} ${user.familienaam}` : 'Gebruiker';
  const firstLetter = user?.voornaam ? user.voornaam.charAt(0).toUpperCase() : 'G';

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-blue-950 shadow z-50 flex items-center px-4 sm:px-6">
      {/* Links uitgelijnd */}
      <div className="flex items-center gap-6">
        <Link to='/' className="hover:opacity-90 transition-opacity">
          <img src={KLJIcon} alt="KLJIcon" className="h-12 sm:h-16 w-auto" />
        </Link>
      </div>

      {/* Rechts uitgelijnd */}
      <div className="ml-auto flex items-center gap-4 text-white relative"> 

        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/' className="text-white">Home</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/transactions' className="text-white">Transacties</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/categories' className="text-white">Categorieën</Link>
        </span>
         <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/leiding' className="text-white">Leiding</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/aanwezigheden' className="text-white">Aanwezigheden</Link>
        </span>
         <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/ronde' className="text-white">Ronde planner</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/kasjes' className="text-white">Kasjes</Link>
        </span>
        
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/profile' className="text-white">
            {fullName}
          </Link>
        </span>

        {/* Avatar */}
        <Link to='/profile' className="hidden sm:block">
          <Tooltip title={fullName}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}> 
              {firstLetter}
            </Avatar>
          </Tooltip>
        </Link>

        <div className="hidden sm:block">
          <Link to='/logout'>
            <Tooltip title='Log uit'>
              <img
                className="h-8 w-auto flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                src={logout}
                alt="logout"
                style={{ filter: 'brightness(0) invert(1)' }} 
              />
            </Tooltip>
          </Link>
        </div>

        {/* Hamburger menu */}
        <div className="sm:hidden ml-2" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-expanded={menuOpen}
            aria-label="Open navigatie"
            className="p-2 rounded-md bg-white/10 hover:bg-white/20 focus:outline-none"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                <Link to='/' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Home</Link>
                <Link to='/transactions' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Transacties</Link>
                <Link to='/categories' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Categorieën</Link>
                <Link to='/leiding' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Leiding</Link>
                <Link to='/aanwezigheden' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Aanwezigheden</Link>
                <Link to='/ronde' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Ronde planner</Link>
                <Link to='/kasjes' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Kasjes</Link>
                <Link to='/profile' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Profiel</Link>
                <Link to='/logout' className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Log uit</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}