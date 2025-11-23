import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
function App() {  
  // later dit uit database halen
  return(
    <div>
      <main className="pt-20 container mx-auto px-4">
        <Outlet />
      </main>
      <Footer/>
    </div>
  )
}
export default App;
