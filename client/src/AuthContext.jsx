import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    //If there's no token, we're not logged in so we can stop loading
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setAuthUser(data.user);
        }
      } catch (err) {
        console.error("Auth restore failed", err);
        setAuthUser(null);
      } finally {
        setLoading(false); //this will run whether the fetch succeeded or failed
      }
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser, loading}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
