import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
function App() {  
  const username="Aykon" 
  // later dit uit database halen
  return(
    <div>
      <Navbar username={username}/>
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer/>
    </div>
  )
}
export default App;
