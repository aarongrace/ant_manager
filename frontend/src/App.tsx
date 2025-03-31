import React, { createContext, useContext, useState } from 'react';
import UnitPanel from './unitPanel/unitPanel';
import CommandPanel from './commandPanel/CommandPanel';
import Dashboard from './dash/Dashboard';
import Profile from './profile/Profile';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { fetchUnits, Unit } from './unitPanel/units.service';

interface MessageContextProps {
  message: string;
  setMessage: (message: string) => void;
}

const MessageContext = createContext<MessageContextProps>({
  message: "",
  setMessage: () => {},
});

export const useMessageContext = () => useContext(MessageContext);

const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState("");

  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

interface UnitsContextProps {
  units: Unit[];
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  refetchUnits: () => void;
}

const UnitsContext = createContext<UnitsContextProps | undefined>(undefined);


const UnitsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [units, setUnits] = useState<Unit[]>([]);

  const refetchUnits = () => {
    fetchUnits(setUnits);
  };

  return (
    <UnitsContext.Provider value={{ units, setUnits, refetchUnits }}>
      {children}
    </UnitsContext.Provider>
  );
}

export const useUnitsContext = (): UnitsContextProps => {
  const context = useContext(UnitsContext);
  if (!context) {
    throw new Error("useUnitsContext must be used within a UnitsProvider");
  }
  return context;
}


function App() {
  return (
    <UnitsProvider>
      <MessageProvider>
        <div className="App">
          <header className="App-header">
            <div className="game-title">Ant Manager</div>
            <nav className="nav-links">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <Link to="/units" className="nav-link">Units</Link>
            </nav>
          </header>
          <main className="App-main">
            <CommandPanel />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/units" element={<UnitPanel />} />
            </Routes>
          </main>
        </div>
      </MessageProvider>
    </UnitsProvider>
  );
}

export default App;
