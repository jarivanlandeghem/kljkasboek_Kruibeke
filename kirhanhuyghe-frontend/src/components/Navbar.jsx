import { Link } from 'react-router';
import KLJIcon from "../assets/KLJIcon.png";
import logout from "../assets/logout.png";
import user from "../assets/user.png";

export default function Navbar({ username = "Aykon" }) {
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
