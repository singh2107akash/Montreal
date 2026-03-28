import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { GameProvider } from './GameContext';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import BettingPage from './pages/BettingPage';
import MarketPage from './pages/MarketPage';
import ResolutionPage from './pages/ResolutionPage';
import ResultsPage from './pages/ResultsPage';

function AuthGate() {
  const { user, gameCodeReady } = useAuth();

  if (!gameCodeReady || !user) {
    return <LoginPage />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/setup" element={user.isAdmin ? <SetupPage /> : <Navigate to="/" replace />} />
        <Route path="/betting" element={<BettingPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/resolve" element={user.isAdmin ? <ResolutionPage /> : <Navigate to="/market" replace />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

function AppContent() {
  const { gameCodeReady } = useAuth();
  return (
    <GameProvider key={gameCodeReady ? 'active' : 'idle'}>
      <AuthGate />
    </GameProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
