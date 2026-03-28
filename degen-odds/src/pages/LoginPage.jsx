import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Shield, User, Eye, EyeOff, AlertCircle, Loader2, Key, Lock, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const {
    gameCodeReady, tokenError, validating,
    submitGameCode, loginAsAdmin, loginAsPlayer,
  } = useAuth();
  const { players, playerPasswords, loading, setPlayerPassword } = useGame();
  const [mode, setMode] = useState(null);
  const [password, setPassword] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Player password flow
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pwInput, setPwInput] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');

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

  const handlePlayerSelect = (name) => {
    setSelectedPlayer(name);
    setPwInput('');
    setPwConfirm('');
    setPwError('');
  };

  const hasExistingPassword = selectedPlayer && playerPasswords && playerPasswords[selectedPlayer];

  const handlePlayerPasswordSubmit = (e) => {
    e.preventDefault();
    setPwError('');

    if (hasExistingPassword) {
      if (pwInput !== playerPasswords[selectedPlayer]) {
        setPwError('Wrong password');
        setPwInput('');
        return;
      }
      loginAsPlayer(selectedPlayer);
    } else {
      if (pwInput.length < 3) {
        setPwError('Password must be at least 3 characters');
        return;
      }
      if (pwInput !== pwConfirm) {
        setPwError('Passwords don\'t match');
        return;
      }
      setPlayerPassword(selectedPlayer, pwInput);
      loginAsPlayer(selectedPlayer);
    }
  };

  const resetPlayerFlow = () => {
    setSelectedPlayer(null);
    setPwInput('');
    setPwConfirm('');
    setPwError('');
  };

  // Game code entry screen
  if (!gameCodeReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="mb-1 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
            Montreal Edition
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
            SACRÉ BETS
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Got the code? Get in here, degen.
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
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                'Join Game'
              )}
            </button>
          </form>

          <div className="mt-8 bg-dark-800 border border-dark-600 rounded-xl p-4 text-left text-xs text-gray-500">
            <p className="text-gray-400 font-semibold mb-2">No code? No entry.</p>
            <p>Beg Akash for it. He runs this show.</p>
          </div>
        </div>

        <div className="absolute bottom-6 text-center text-xs text-dark-500">
          No backing out. Montreal will expose the truth.
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
          <p className="text-gray-500 text-sm">Warming up the chaos...</p>
        </div>
      </div>
    );
  }

  // Login selection screen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-1 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
          Montreal Edition
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
          SACRÉ BETS
        </h1>
        <p className="text-gray-500 text-sm mb-10">
          Talk is cheap. Put your points where your mouth is.
        </p>

        {/* Mode selection */}
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
                <div className="text-xs text-gray-500">Run the show, settle the scores</div>
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
                <div className="text-xs text-gray-500">Time to back it up or shut up</div>
              </div>
            </button>
          </div>
        )}

        {/* Admin login */}
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
                Enter the War Room
              </button>
            </form>

            <button
              onClick={() => { setMode(null); setError(''); setPassword(''); }}
              className="mt-4 text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
            >
              \u2190 Back
            </button>
          </div>
        )}

        {/* Player login - name selection */}
        {mode === 'player' && !selectedPlayer && (
          <div className="animate-fade-in-up">
            <p className="text-gray-400 text-sm mb-4">Who are you, degen?</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {players.map((name) => (
                <button
                  key={name}
                  onClick={() => handlePlayerSelect(name)}
                  className="bg-dark-800 border border-dark-600 hover:border-gold-500 rounded-xl px-4 py-3 text-gray-200 hover:text-gold-400 font-medium transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                >
                  {name}
                  {playerPasswords && playerPasswords[name] && (
                    <Lock className="w-3 h-3 text-gray-600" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMode(null)}
              className="mt-2 text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
            >
              \u2190 Back
            </button>
          </div>
        )}

        {/* Player login - password screen */}
        {mode === 'player' && selectedPlayer && (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center text-white font-bold">
                {selectedPlayer[0]}
              </div>
              <span className="text-lg font-bold text-gray-200">{selectedPlayer}</span>
            </div>

            <form onSubmit={handlePlayerPasswordSubmit} className="space-y-4">
              {hasExistingPassword ? (
                <>
                  <p className="text-gray-400 text-sm mb-2">Prove it's you, degenerate</p>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="password"
                      value={pwInput}
                      onChange={(e) => { setPwInput(e.target.value); setPwError(''); }}
                      placeholder="Password"
                      autoFocus
                      className="w-full bg-dark-800 border border-dark-600 focus:border-gold-500 rounded-xl pl-11 pr-4 py-4 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-2">Lock it down — create your password</p>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="password"
                      value={pwInput}
                      onChange={(e) => { setPwInput(e.target.value); setPwError(''); }}
                      placeholder="Create password"
                      autoFocus
                      className="w-full bg-dark-800 border border-dark-600 focus:border-gold-500 rounded-xl pl-11 pr-4 py-4 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="password"
                      value={pwConfirm}
                      onChange={(e) => { setPwConfirm(e.target.value); setPwError(''); }}
                      placeholder="Confirm password"
                      className="w-full bg-dark-800 border border-dark-600 focus:border-gold-500 rounded-xl pl-11 pr-4 py-4 text-gray-200 placeholder-gray-600 focus:outline-none transition-colors"
                    />
                  </div>
                </>
              )}

              {pwError && (
                <div className="flex items-center gap-2 text-accent-red text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {pwError}
                </div>
              )}

              <button
                type="submit"
                disabled={!pwInput}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 cursor-pointer"
              >
                {hasExistingPassword ? 'Let Me In' : 'Lock In & Enter'}
              </button>
            </form>

            <button
              onClick={resetPlayerFlow}
              className="mt-4 text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer flex items-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> That ain't me
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-center text-xs text-dark-500">
        No backing out. Montreal will expose the truth.
      </div>
    </div>
  );
}
