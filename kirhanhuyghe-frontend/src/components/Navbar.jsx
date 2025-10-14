import KLJIcon from "../assets/KLJIcon.jpeg"
import logout from "../assets/logout.png"
import user from "../assets/user.png"

export default function Navbar({username="Aykon"}){
  return(
    <nav className="fixed top-0 left-0 right-0 h-20 bg-transparent shadow z-50 flex items-center px-6">
      {/* Items die links zijn utigelijnd */}
      <div className="flex items-center gap-6">
        <img src={KLJIcon} alt="KLJIcon" className="h-12 w-auto"/>

        {/* links die links uitgelijnd blijven */}
        {/* a href ... */}
      </div>

      {/* items die rechts zijn uitgelijnd */}
      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm font-medium hidden sm:inline leading-none">Home</span>
        <span className="text-sm font-medium hidden sm:inline leading-none">Lijst</span>
        <span className="text-sm font-medium hidden sm:inline leading-none">Categorieen</span>
        <span className="text-sm font-medium hidden sm:inline leading-none">{username}</span>
        <img className="h-10 w-10 rounded-full flex-shrink-0" src={user} alt='user'/>
        <img className="h-8 w-auto flex-shrink-0" src={logout} alt="logout"/> {/*ref={terug naar inlogpagina}*/}
      </div>
    </nav>
  )
}