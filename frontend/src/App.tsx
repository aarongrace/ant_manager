import React, { createContext, useContext, useState } from 'react';
import UnitPanel from './unitPanel/unitPanel';
import CommandPanel from './commandPanel/CommandPanel';
import './App.css';

interface AppContextProps {
  message: string;
  setMessage: (message: string) => void;
}

const AppContext = createContext<AppContextProps>({
  message: "",
  setMessage: () => {},
});

export const useAppContext = () => useContext(AppContext);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState("");

  return (
    <AppContext.Provider value={{ message, setMessage }}>
      {children}
    </AppContext.Provider>
  );
};

function App() {
  return (
    <AppProvider>
      <div className="App">
        <header className="App-header">
          <div className="game-title">Ant Manager</div>
          <CommandPanel />
          <UnitPanel />
        </header>
      </div>
    </AppProvider>
  );
}

export default App;
