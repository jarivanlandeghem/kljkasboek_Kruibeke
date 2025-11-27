import Navbar from "./Navbar";
import { ScrollRestoration } from "react-router";

export default function AlgemeneLayout({ image, children }) {
  return (
      <div className="relative w-full overflow-x-hidden">
      <Navbar />

      <div className="relative w-full">
        <div className="hidden md:block fixed top-20 left-0 w-[600px] h-[calc(100vh-5rem)] z-0">
          <img
            src={image}
            alt="Kinderen die spelen"
            className="object-cover w-full h-full"
          />
        </div>

        <div className="md:hidden w-full">
          <img
            src={image}
            alt="Kinderen die spelen"
            className="object-cover w-full h-56"
          />
        </div>

        <div className="relative z-10 w-full min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 md:pl-[600px]">
          {children}
        </div>

        <ScrollRestoration />
      </div>
    </div>
  );
}
