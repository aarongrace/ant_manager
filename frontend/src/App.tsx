import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { WarningBar } from './components/WarningBar';
import { usePreloadedImagesStore } from './contexts/preloadImages';
import './globals.css';
import Admin from './pages/admin/Admin';
import AdminCheck from './pages/admin/AdminCheck';
import AntsPage from './pages/ants/AntsPage';
import Clan from './pages/clan/Clan';
import Dashboard from './pages/dashboard/Dashboard';
import { resizeCanvas } from './pages/dashboard/dashboard.services';
import Guide from './pages/guide/guide';
import Profile from './pages/profile/Profile';
import Store from './pages/store/Store';
import Welcome from './pages/welcome/Welcome';

function App() {
  const { preloadImages } = usePreloadedImagesStore.getState();
  useEffect(() => {
    preloadImages();
    resizeCanvas();
  } , []);
  return (
    <div className="App">
      <Navbar />
      <WarningBar/>
      <main className="App-main">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/ants" element={<AntsPage />} />
          <Route path="/clan" element={<Clan />} />
          <Route path="/store" element={<Store />} />
          <Route path="/admin" element={<AdminCheck><Admin/></AdminCheck>}/>
        </Routes>
      </main>
    </div>
  );
}

export default App;
