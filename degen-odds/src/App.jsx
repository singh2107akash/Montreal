import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './GameContext';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import BettingPage from './pages/BettingPage';
import MarketPage from './pages/MarketPage';
import ResolutionPage from './pages/ResolutionPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/betting" element={<BettingPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/resolve" element={<ResolutionPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </GameProvider>
  );
}
