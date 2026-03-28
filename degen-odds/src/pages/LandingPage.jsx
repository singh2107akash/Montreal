import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import { Trophy, Target, Users, Zap } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { players, lockedPlayers } = useGame();
  const hasExistingGame = players.length > 0 && lockedPlayers.length > 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-2 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
          Montreal Bachelor Edition
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
          DEGEN ODDS
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          A pre-trip betting game. Place your bets before the trip starts.
          When the trip begins, the chaos decides who wins.
        </p>

        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-10 max-w-md mx-auto text-left">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Users className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">Add Players</div>
            <div className="text-xs text-gray-500">Set up the squad</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Target className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">Place Bets</div>
            <div className="text-xs text-gray-500">150 pts, 20 questions</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Zap className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">Live Results</div>
            <div className="text-xs text-gray-500">Resolve during the trip</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Trophy className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">Leaderboard</div>
            <div className="text-xs text-gray-500">Crown the winner</div>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={() => navigate('/setup')}
            className="w-full max-w-xs bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 pulse-gold cursor-pointer"
          >
            {hasExistingGame ? 'Continue Game' : 'Start Setup'}
          </button>

          {hasExistingGame && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => navigate('/betting')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Go to Betting
              </button>
              <span className="text-dark-600">|</span>
              <button
                onClick={() => navigate('/market')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                View Market
              </button>
              <span className="text-dark-600">|</span>
              <button
                onClick={() => navigate('/results')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Leaderboard
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 text-center text-xs text-dark-500">
        No live betting. All bets placed before the trip. The trip decides everything.
      </div>
    </div>
  );
}
