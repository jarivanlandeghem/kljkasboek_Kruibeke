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
        <Link to='/'>
          <img src={KLJIcon} alt="KLJIcon" className="h-18 w-auto" />
        </Link>
      </div>

      {/* Rechts uitgelijnd */}
      <div className="ml-auto flex items-center gap-4">
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
            {fullName}
          </Link>
        </span>
        <Link to='/profile'>
          <Tooltip title={fullName}>
            <Avatar sx={{ bgcolor: '#ff0000' }}>
              {firstLetter}
            </Avatar>
          </Tooltip>
        </Link>
        <Link to='/logout'>
          <img
            className="h-8 w-auto flex-shrink-0 cursor-pointer"
            src={logout}
            alt="logout"
          />
        </Link>
      </div>
    </nav>
  );
}