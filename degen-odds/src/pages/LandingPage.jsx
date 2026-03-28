import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Trophy, Target, Users, Zap, LogOut, Shield, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { players, lockedPlayers, questions, resolutions, saving, error } = useGame();

  const isAdmin = user?.isAdmin;
  const isLocked = lockedPlayers.includes(user?.name);
  const allLocked = players.every((p) => lockedPlayers.includes(p));
  const resolvedCount = Object.values(resolutions).filter((r) => r?.resolved).length;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Header bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isAdmin && <Shield className="w-4 h-4 text-gold-400" />}
          <span className="text-gray-400">
            {user?.name}
            {isAdmin && <span className="text-gold-400 ml-1">(Admin)</span>}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {saving && <Loader2 className="w-3.5 h-3.5 text-gold-400 animate-spin" />}
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-400 transition-colors cursor-pointer flex items-center gap-1 text-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl w-full text-center">
        <div className="mb-2 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
          Montreal Edition
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
          SACRÉ BETS
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          Place your bets before the trip starts.
          When the trip begins, the chaos decides who wins.
        </p>

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-10 max-w-md mx-auto text-left">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Users className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">{players.length} Players</div>
            <div className="text-xs text-gray-500">{lockedPlayers.length} locked in</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Target className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">
              {isLocked ? 'Bets Locked' : 'Place Bets'}
            </div>
            <div className="text-xs text-gray-500">150 pts, 20 questions</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Zap className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">{resolvedCount} Resolved</div>
            <div className="text-xs text-gray-500">of {questions.length} questions</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Trophy className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">Leaderboard</div>
            <div className="text-xs text-gray-500">{allLocked ? 'Live' : 'After betting'}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 items-center">
          {/* Primary action based on role */}
          {!isLocked && !isAdmin ? (
            <button
              onClick={() => navigate('/betting')}
              className="w-full max-w-xs bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 pulse-gold cursor-pointer"
            >
              Place Your Bets
            </button>
          ) : isAdmin ? (
            <button
              onClick={() => navigate('/setup')}
              className="w-full max-w-xs bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 pulse-gold cursor-pointer"
            >
              Admin Dashboard
            </button>
          ) : (
            <div className="bg-dark-800 border border-accent-green/30 rounded-xl px-6 py-4 text-accent-green text-sm font-medium">
              Your bets are locked in! Waiting for the trip to begin.
            </div>
          )}

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/betting')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Betting
              </button>
            )}
            <button
              onClick={() => navigate('/market')}
              className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
            >
              View Market
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/resolve')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Resolution
              </button>
            )}
            <button
              onClick={() => navigate('/results')}
              className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-center text-xs text-dark-500">
        No live betting. All bets placed before the trip.
      </div>
    </div>
  );
}
