import { Link } from 'react-router';
import { useAuth } from '../contexts/auth';
import KLJIcon from "../assets/KLJIcon.png";
import logout from "../assets/logout.png";
import {
  Avatar,
  Tooltip
} from '@mui/material';

export default function Navbar() {
  const { user } = useAuth();

  // Haal de volledige naam en eerste letter op
  const fullName = user ? `${user.voornaam} ${user.familienaam}` : 'Gebruiker';
  const firstLetter = user?.voornaam ? user.voornaam.charAt(0).toUpperCase() : 'G';

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-blue-950 shadow z-50 flex items-center px-6">
      
      {/* Links uitgelijnd */}
      <div className="flex items-center gap-6">
        <Link to='/' className="hover:opacity-90 transition-opacity">
          <img src={KLJIcon} alt="KLJIcon" className="h-16 w-auto" />
        </Link>
      </div>

      {/* Rechts uitgelijnd */}
      <div className="ml-auto flex items-center gap-4 text-white"> 
        
        {/* Navigation Links - NU MET LICHTBLAUWE HOVER */}
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/' className="text-white">Home</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/transactions' className="text-white">Transacties</Link>
        </span>
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/categories' className="text-white">Categorieën</Link>
        </span>
        
        {/* Full Name Link */}
        <span className="text-sm font-medium hidden sm:inline leading-none hover:text-sky-300 transition-colors">
          <Link to='/profile' className="text-white">
            {fullName}
          </Link>
        </span>
        
        {/* Avatar */}
        <Link to='/profile'>
          <Tooltip title={fullName}>
            <Avatar sx={{ bgcolor: '#d32f2f' }}> 
              {firstLetter}
            </Avatar>
          </Tooltip>
        </Link>
        
        {/* Logout Icon */}
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
    </nav>
  );
}