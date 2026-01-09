import { createContext, useState, useContext } from "react";

const AuthContext = createContext({
  userInfo: {},
  isLoggedIn: false,
  loggedIn: (userInfo) => { console.warn("auth context not workign") },
  loggedOut: () => { console.warn("auth context not working") }
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});

  const loggedIn = (userInfo) => {
    console.log("auth", userInfo)
    setUserInfo(userInfo);
    setIsLoggedIn(true);
  };

  const loggedOut = () => {
    console.log("auth logout")
    setUserInfo({});
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loggedIn, loggedOut, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
