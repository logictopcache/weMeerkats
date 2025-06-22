import { useState } from "react";
import Homeheader from "../../components/create/Homeheader";

const Home = () => {
  const [activeItem, setActiveItem] = useState("home");
  const handleItemClick = (item) => {
    setActiveItem(item);
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1200px] mx-auto p-5 transition-all duration-300 ease-in-out">
        <Homeheader />
      </div>
      <div className="mt-5">
        <nav className="bg-white shadow-sm py-4">
          <ul className="flex justify-center items-center gap-8 max-w-2xl mx-auto">
            <li
              className={`cursor-pointer transition-all duration-300 hover:text-primary relative group ${
                activeItem === "home"
                  ? "text-primary font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => handleItemClick("home")}
            >
              <span className="relative px-2 py-1">
                Home
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                  activeItem === "home" ? "scale-x-100" : "scale-x-0"
                } group-hover:scale-x-100`}></span>
              </span>
            </li>
            <li
              className={`cursor-pointer transition-all duration-300 hover:text-primary relative group flex items-center ${
                activeItem === "meeting"
                  ? "text-primary font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => handleItemClick("meeting")}
            >
              <span className="relative px-2 py-1">
                Meeting Requests
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                  activeItem === "meeting" ? "scale-x-100" : "scale-x-0"
                } group-hover:scale-x-100`}></span>
              </span>
              <span className="ml-2 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-sm font-medium">
                2
              </span>
            </li>
            <li
              className={`cursor-pointer transition-all duration-300 hover:text-primary relative group ${
                activeItem === "calendar"
                  ? "text-primary font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => handleItemClick("calendar")}
            >
              <span className="relative px-2 py-1">
                Appointment Calendar
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                  activeItem === "calendar" ? "scale-x-100" : "scale-x-0"
                } group-hover:scale-x-100`}></span>
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Home;
