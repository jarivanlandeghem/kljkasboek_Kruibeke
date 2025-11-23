import Navbar from "./Navbar";
import { ScrollRestoration } from "react-router";

export default function AlgemeneLayout({ image, children }) {
  return (
    <>
      <Navbar />

      <div className="flex flex-col md:flex-row min-h-screen pt-20">
        <div className="md:w-1/2 w-full">
          <img
            src={image}
            alt="Kinderen die spelen"
            className="object-cover w-full h-56 md:h-auto"
          />
        </div>

        <div className="md:w-1/2 w-full flex items-center justify-center bg-white p-4">
          {children}
        </div>

        <ScrollRestoration />
      </div>
    </>
  );
}
