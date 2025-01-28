import React from 'react';
import logo from '../assets/logo.webp'
const Navbar = ({ isCollapsed }) => {
  return (
    <div className={`w-1/4 fixed transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'} right-6 top-4 z-50`}>
      <div className="bg-[#2A5298] rounded-r-full py-1 px-6">
        <div className="flex items-center">
          <img 
            src={logo} 
            alt="AI" 
            className="h-8 w-8 rounded-full mr-3"
          />
          <span className="text-xl font-medium text-white">
            AI Code Academy
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;