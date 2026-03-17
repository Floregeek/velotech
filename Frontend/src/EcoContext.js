import React, { createContext, useContext, useState } from 'react';

const EcoContext = createContext();

export const EcoProvider = ({ children }) => {
  const [ecoMode, setEcoMode] = useState(
    localStorage.getItem('ecoMode') === 'true'
  );

  const toggleEco = () => {
    const newValue = !ecoMode;
    setEcoMode(newValue);
    localStorage.setItem('ecoMode', newValue);
  };

  return (
    <EcoContext.Provider value={{ ecoMode, toggleEco }}>
      {children}
    </EcoContext.Provider>
  );
};

export const useEco = () => useContext(EcoContext);