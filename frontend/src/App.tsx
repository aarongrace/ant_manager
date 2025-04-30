import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import ant_welcome from './assets/imgs/ant_welcome.png';
import ant_welcome1 from './assets/imgs/ant_welcome1.png';
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
import Shop from './pages/store/Shop';
import Welcome from './pages/welcome/Welcome';

function App() {
  const { preloadImages } = usePreloadedImagesStore.getState();

  const [currentBg, setCurrentBg] = useState(ant_welcome);


  useEffect(() => {
    preloadImages();
    resizeCanvas();

    // flip the background every 5 seconds
    const interval = setInterval(() => {
      setCurrentBg((prevBg) => {
        if (prevBg === ant_welcome) {
          return ant_welcome1;
        } else {
          return ant_welcome;
        }
      });
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  } , []);

  useEffect(() =>{
    document.body.style.backgroundImage = `url(${currentBg})`
  }, [currentBg]);

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
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminCheck><Admin/></AdminCheck>}/>
        </Routes>
      </main>
    </div>
  );
}

export default App;
