import React from 'react';
import UnitPanel from './pages/units/unitPanel';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import './globals.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './pages/welcome/Welcome';
import Guide from './pages/guide/guide';
import Clan from './pages/clan/Clan';
import Store from './pages/store/Store';
import Admin from './pages/admin/Admin';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/units" element={<UnitPanel />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/store" element={<Store />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
