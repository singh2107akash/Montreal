import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { GameProvider, useGame } from './GameContext';
import { isFirebaseConfigured } from './firebase';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import BettingPage from './pages/BettingPage';
import MarketPage from './pages/MarketPage';
import ResolutionPage from './pages/ResolutionPage';
import ResultsPage from './pages/ResultsPage';

function FirebaseCheck({ children }) {
  if (!isFirebaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-black mb-4 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
            Setup Required
          </h1>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 text-left text-sm text-gray-400 space-y-3">
            <p className="text-gray-200 font-semibold">Firebase is not configured yet. Follow these steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to <span className="text-gold-400">console.firebase.google.com</span></li>
              <li>Click <span className="text-gold-400">Create a project</span> (any name)</li>
              <li>Skip Google Analytics</li>
              <li>Click <span className="text-gold-400">Realtime Database</span> in the sidebar</li>
              <li>Click <span className="text-gold-400">Create Database</span> &rarr; Start in <span className="text-gold-400">test mode</span></li>
              <li>Go to <span className="text-gold-400">Project Settings</span> (gear icon)</li>
              <li>Scroll to "Your apps" &rarr; click the web icon <span className="text-gold-400">&lt;/&gt;</span></li>
              <li>Register the app, then copy the <span className="text-gold-400">firebaseConfig</span> values</li>
              <li>Paste them in <code className="bg-dark-700 px-1.5 py-0.5 rounded text-gold-400">src/firebase.js</code></li>
              <li>Rebuild &amp; redeploy</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
  return children;
}

function AuthGate() {
  const { user } = useAuth();

  if (!user) {
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

export default function App() {
  return (
    <FirebaseCheck>
      <AuthProvider>
        <GameProvider>
          <AuthGate />
        </GameProvider>
      </AuthProvider>
    </FirebaseCheck>
  );
}
