import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUserData({
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role || "User",
      });
    } else {
      alert("No user data found. Redirecting to login page.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className=" h-[calc(100vh-105px)] relative overflow-hidden p-8">
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-800">
          Account Details 
        </h1>
        <p className="text-sm text-gray-500">{currentDate}</p>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm p-8 mt-6">
        <div className="text-center mb-8">
            Admin
          <h2 className="text-2xl font-semibold text-gray-800">
            {userData.name}
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={userData.username}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600"
                onClick={() => console.log("Edit username")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={userData.email}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              value={userData.role}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>

          <div className="pt-6 space-y-3">
            <button className="w-full bg-[#224289] text-white py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Update
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-[#1a237e] py-2.5 hover:bg-[#224289] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




export default AdminDashboard