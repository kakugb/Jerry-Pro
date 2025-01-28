import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Chatlogs from "./pages/Chatlogs/Chatlogs";
import Chatbot from "./pages/Chatbot/Chatbot";
import Knowledgebases from "./pages/KnowledgeBases/Knowledgebases";
import TrainingData from "./pages/TrainingData/TrainingData";
import Account from "./pages/Accounts/Account";
import ChatbotDetail from "./pages/Chatbot/ChatbotDetail";
import AddDataSource from "./pages/TrainingData/AddDataSource";
import AddKnowledgeBases from "./pages/KnowledgeBases/AddKnowledgeBases";
import TrainingsData from "./pages/KnowledgeBases/TrainingsData";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

const UserProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/chatbot" replace />;
  }

  return children;
};

const AppLayout = ({ children, isSidebarCollapsed, onToggle }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const location = useLocation();

  if (!isAuthenticated) {
    return children;
  }

  const isAdminRoute = location.pathname === "/adminDashboard";

  if (isAdminRoute && user?.role === "admin") {
    return <div className="min-h-screen bg-[#FFFFFF]">{children}</div>;
  }

  return (
    <>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={onToggle}
        userRole={user?.role}
      />
      <Navbar isCollapsed={isSidebarCollapsed} />
      <main
        className={`transition-all duration-300 
        ${isSidebarCollapsed ? "ml-20" : "ml-64"} pt-20 p-6 bg-[#FFFFFF]`}
      >
        {children}
      </main>
    </>
  );
};

const LayoutWrapper = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isAdminDashboard =
    location.pathname === "/adminDashboard" && user?.role === "admin";

  if (isAuthPage || isAdminDashboard) {
    return children;
  }

  return (
    <AppLayout isSidebarCollapsed={isSidebarCollapsed} onToggle={handleToggle}>
      {children}
    </AppLayout>
  );
};
const AuthenticationWrapper = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const user = JSON.parse(localStorage.getItem("user"));
  const publicPaths = ["/login", "/register"];

  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, location.pathname]);

  return children;
};

function App() {
  return (
    <Router>
      <AuthenticationWrapper>
        <div className="min-h-screen">
          <LayoutWrapper>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin routes */}
              <Route
                path="/adminDashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* User routes */}
              <Route
                path="/"
                element={
                  <UserProtectedRoute>
                    <Navigate to="/chatbot" replace />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <UserProtectedRoute>
                    <Chatbot />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/chatbot/:id"
                element={
                  <UserProtectedRoute>
                    <ChatbotDetail />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/knowledge-bases"
                element={
                  <UserProtectedRoute>
                    <Knowledgebases />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/knowledge-trainingdata"
                element={
                  <UserProtectedRoute>
                    <TrainingsData />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/add-newknowledge"
                element={
                  <UserProtectedRoute>
                    <AddKnowledgeBases />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/training-data"
                element={
                  <UserProtectedRoute>
                    <TrainingData />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/add-datasource"
                element={
                  <UserProtectedRoute>
                    <AddDataSource />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/chat-logs"
                element={
                  <UserProtectedRoute>
                    <Chatlogs />
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <UserProtectedRoute>
                    <Account />
                  </UserProtectedRoute>
                }
              />

              <Route
                path="*"
                element={
                  <UserProtectedRoute>
                    <Navigate to="/chatbot" replace />
                  </UserProtectedRoute>
                }
              />
            </Routes>
          </LayoutWrapper>
        </div>
      </AuthenticationWrapper>
    </Router>
  );
}

export default App;
