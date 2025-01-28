import React from "react";
import { NavLink, useNavigate} from "react-router-dom";

import {
  MessageCircle,
  Database,
  FileText,
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  UserCircle ,
} from "lucide-react";

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", false);
    navigate('/login'); 
  };
  const SidebarLink = ({ to, icon: Icon, children }) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) => `
          flex items-center px-4 py-3 rounded-lg transition-all duration-200
          ${isCollapsed ? "justify-center" : ""}
          ${isActive ? "bg-[#61CBC8] text-white" : "hover:bg-white/10"}
        `}
      >
        <Icon className="h-6 w-6 min-w-[24px]" />
        {!isCollapsed && <span className="ml-3 text-[15px]">{children}</span>}
      </NavLink>
    );
  };

  return (
    <div className="w-full bg-[#2A5298] relative">
    
      <div className="w-full  bg-white"></div>

      <div
        className={`fixed left-0 top-0 h-screen bg-[#2A5298] text-white 
        transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"} z-40`}
      >
        <button
          onClick={onToggle}
          className="absolute -right-3 top-22 bg-[#61CBC8] rounded-full p-1.5 
             transition-colors duration-200 z-50"
        >
          <ChevronLeft
            className={`h-4 w-4 text-[#2A5298] transition-transform duration-300
            ${isCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        <div className="px-3 py-6 mt-16">
          <div
            className={`text-xs font-medium text-gray-300 px-4 mb-6
            ${isCollapsed ? "text-center" : ""}`}
          >
            {!isCollapsed && "MAIN"}
          </div>

          <nav className="space-y-4">
            <SidebarLink to="/chatbot" icon={MessageCircle}>
              Chatbot
            </SidebarLink>

            <SidebarLink to="/knowledge-bases" icon={Database}>
              Knowledge Bases
            </SidebarLink>

            <SidebarLink to="/training-data" icon={FileText}>
              Training Data
            </SidebarLink>

            <SidebarLink to="/chat-logs" icon={MessageSquare}>
              Chat Logs
            </SidebarLink>
            <SidebarLink to="/account" icon={UserCircle }>
              Account
            </SidebarLink>

            
          </nav>
        </div>

       
        <div className="absolute bottom-0 left-0 right-0 px-3 py-6">
          <nav className="space-y-4">
            <SidebarLink to="/help" icon={HelpCircle}>
              Help
            </SidebarLink>

            <button
           onClick={handleLogout}
              className={`flex items-center px-4 py-3 hover:bg-white/10 rounded-lg text-red-400
                ${isCollapsed ? "justify-center" : ""}`}
            >
              <LogOut className="h-6 w-6 min-w-[24px]" />
              {!isCollapsed && (
                <span className="ml-3 text-[15px]">Logout Account</span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
