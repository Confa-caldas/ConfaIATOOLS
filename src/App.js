import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./styles.css";
import Navbar from "./compenents/Navbar";
import Login from "./pages/Login";
import AsistenteIAConftalk from "./pages/AsistenteIAConftalk";


export default function App() {
  //const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("logueado") === "true"
  );
  
  

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("logueado") === "true";
      console.log("loggedIn+loggedIn>>>"+loggedIn)
      setIsAuthenticated(loggedIn);
    
    };
    
    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <div className="App">
      {isAuthenticated ? (
      <Navbar>
        <Routes>
          <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/AsistenteIAConftalk" element={<ProtectedRoute><AsistenteIAConftalk /></ProtectedRoute>} />  
          
        </Routes>
        </Navbar>
        ) : (
          <Routes>
            <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          </Routes>
        )}
      </div>
    
    </Router>
  );
}
