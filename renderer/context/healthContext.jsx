import { createContext, useContext, useState } from "react";

const HealthContext = createContext({});

export const useHealthContext = () => useContext(HealthContext);

export const HealthContextProvider = ({ children }) => {
  const [brokersHealth, setBrokersHealth] = useState({});
  const name = "ayush"; // Adjust the initial value of name as needed

  // 

  return (
    <HealthContext.Provider
      value={{
        name,
        brokersHealth,
        setBrokersHealth,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealthData = () => {
  return useContext(HealthContext);
};
