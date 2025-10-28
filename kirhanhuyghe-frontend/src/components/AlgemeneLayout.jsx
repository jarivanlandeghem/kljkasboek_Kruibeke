import Navbar from "./Navbar";
import { ScrollRestoration } from "react-router";
export default function AlgemeneLayout({ image, children }) {
  return (
    <div className="flex min-h-screen">
      <div className="w-1/2">
        <img 
          src={image} 
          alt="Kinderen die spelen" 
          className="object-cover w-fit h-fit" 
        />
      </div>
      <Navbar/>
      <div className="w-1/2 flex items-center justify-center bg-white">
        {children}
      </div>
      <ScrollRestoration/>
    </div>
  );
}
