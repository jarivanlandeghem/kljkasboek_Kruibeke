import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
function App() {  
  // later dit uit database halen
  return(
    <div>
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer/>
    </div>
  )
}
export default App;
