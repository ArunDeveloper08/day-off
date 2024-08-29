import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const authValue = getCookie("Authenticate");
    
    const isAuthenticated = authValue === "aAg@16&5jNs$%d0*";
      
    if (!isAuthenticated) {
    ;
      // window.location.href="http://192.168.1.221:5173/livetrading"
      window.location.href="https://www.pesonline12.in/livetrading"
      
    }
  }, [navigate]);
};

export default useAuth;
