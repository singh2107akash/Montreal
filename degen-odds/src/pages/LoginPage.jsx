import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Shield, User, Eye, EyeOff, AlertCircle, Loader2, Key } from 'lucide-react';

export default function LoginPage() {
  const {
    gameCodeReady, tokenError, validating,
    submitGameCode, loginAsAdmin, loginAsPlayer,
  } = useAuth();
  const { players, loading } = useGame();
  const [mode, setMode] = useState(null); // null | 'admin' | 'player'
  const [password, setPassword] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGameCode = async (e) => {
    e.preventDefault();
    if (!gameCode.trim()) return;
    await submitGameCode(gameCode);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginAsAdmin(password)) {
      setError('');
    } else {
      setError('Wrong password');
      setPassword('');
    }
  };

  const handlePlayerLogin = (name) => {
    loginAsPlayer(name);
  };

  // Game code entry screen
  if (!gameCodeReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-1 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
            Montreal Bachelor Edition
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
            DEGEN ODDS
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Enter the game code to join.
          </p>

          <form onSubmit={handleGameCode} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Paste game code here..."
                autoFocus
                className="w-full bg-dark-800 border border-dark-600 focus:border-gold-500 rounded-xl pl-11 pr-4 py-4 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors font-mono text-sm"
              />
            </div>

            {tokenError && (
              <div className="flex items-center gap-2 text-accent-red text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {tokenError}
              </div>
            )}

            <button
              type="submit"
              disabled={!gameCode.trim() || validating}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {validating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                </>
              ) : (
                'Join Game'
              )}
            </button>
          </form>

          <div className="mt-8 bg-dark-800 border border-dark-600 rounded-xl p-4 text-left text-xs text-gray-500">
            <p className="text-gray-400 font-semibold mb-2">Don't have a game code?</p>
            <p>Ask the admin (Akash) for it. The game code is a GitHub token that connects everyone to the same game.</p>
          </div>
        </div>

        <div className="absolute bottom-6 text-center text-xs text-dark-500">
          All bets placed before the trip. The trip decides everything.
        </div>
      </div>
    );
  }

  // Loading game data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading game...</p>
        </div>
      </div>
    );
  }

  // Login selection screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-1 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
          Montreal Bachelor Edition
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
          DEGEN ODDS
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          Place bets before the trip. The chaos decides who wins.
        </p>

        {!mode && (
          <div className="space-y-3 animate-fade-in-up">
            <button
              onClick={() => setMode('admin')}
              className="w-full bg-dark-800 border border-dark-600 hover:border-gold-500 rounded-xl px-6 py-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-dark-900" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-200 group-hover:text-gold-400 transition-colors">
                  Admin Login
                </div>
                <div className="text-xs text-gray-500">Manage game, resolve bets</div>
              </div>
            </button>

            <button
              onClick={() => setMode('player')}
              className="w-full bg-dark-800 border border-dark-600 hover:border-gold-500 rounded-xl px-6 py-4 flex items-center gap-4 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-gray-200 group-hover:text-gold-400 transition-colors">
                  Player Login
                </div>
                <div className="text-xs text-gray-500">Place your bets, view results</div>
              </div>
            </button>
          </div>
        )}

        {mode === 'admin' && (
          <div className="animate-fade-in-up">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full bg-dark-800 border border-dark-600 focus:border-gold-500 rounded-xl px-4 py-4 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-accent-red text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!password}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 cursor-pointer"
              >
                Enter as Admin
              </button>
            </form>

            <button
              onClick={() => { setMode(null); setError(''); setPassword(''); }}
              className="mt-4 text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
            >
              &larr; Back
            </button>
          </div>
        )}

        {mode === 'player' && (
          <div className="animate-fade-in-up">
            <p className="text-gray-400 text-sm mb-4">Select your name</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {players.map((name) => (
                <button
                  key={name}
                  onClick={() => handlePlayerLogin(name)}
                  className="bg-dark-800 border border-dark-600 hover:border-gold-500 rounded-xl px-4 py-3 text-gray-200 hover:text-gold-400 font-medium transition-all cursor-pointer text-sm"
                >
                  {name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMode(null)}
              className="mt-2 text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
            >
              &larr; Back
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-center text-xs text-dark-500">
        All bets placed before the trip. The trip decides everything.
      </div>
    </div>
  );
}
