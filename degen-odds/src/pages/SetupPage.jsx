import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import { Plus, X, ChevronRight, Users, HelpCircle } from 'lucide-react';

export default function SetupPage() {
  const navigate = useNavigate();
  const { players, nicknames, questions, config, setPlayers, setNickname } = useGame();
  const [newPlayer, setNewPlayer] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers([...players, name]);
      setNewPlayer('');
    }
  };

  const removePlayer = (name) => {
    setPlayers(players.filter((p) => p !== name));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addPlayer();
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-gold-400 text-sm mb-6 inline-block transition-colors cursor-pointer"
      >
        &larr; Back
      </button>

      <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        Game Setup
      </h1>
      <p className="text-gray-500 mb-8">Add your squad and review the questions.</p>

      {/* Game Config Summary */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mb-8 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-gray-500">Budget:</span>{' '}
          <span className="text-gold-400 font-bold">{config.totalBudget} pts</span>
        </div>
        <div>
          <span className="text-gray-500">Min Bet:</span>{' '}
          <span className="text-gold-400 font-bold">{config.minBetPerQuestion} pts</span>
        </div>
        <div>
          <span className="text-gray-500">Questions:</span>{' '}
          <span className="text-gold-400 font-bold">{config.questionCount}</span>
        </div>
        <div>
          <span className="text-gray-500">Min Spend:</span>{' '}
          <span className="text-gold-400 font-bold">{config.minBetPerQuestion * config.questionCount} pts</span>
        </div>
      </div>

      {/* Players Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gold-400" />
          <h2 className="text-xl font-bold text-gray-200">
            Players ({players.length})
          </h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a player name..."
            className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
          />
          <button
            onClick={addPlayer}
            disabled={!newPlayer.trim()}
            className="bg-gold-500 hover:bg-gold-400 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold px-4 py-3 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {players.map((player) => (
            <div
              key={player}
              className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-200 truncate">{player}</div>
                <input
                  type="text"
                  value={nicknames[player] || ''}
                  onChange={(e) => setNickname(player, e.target.value)}
                  placeholder="Nickname (optional)"
                  className="text-xs bg-transparent text-gray-500 placeholder-dark-500 focus:outline-none focus:text-gold-400 w-full mt-0.5"
                />
              </div>
              <button
                onClick={() => removePlayer(player)}
                className="text-dark-500 hover:text-accent-red ml-2 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Questions Preview */}
      <div className="mb-8">
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer mb-4"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-medium">
            {showQuestions ? 'Hide' : 'Preview'} Questions ({questions.length})
          </span>
        </button>

        {showQuestions && (
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <span className="text-gold-500 font-bold mr-2">Q{i + 1}.</span>
                <span className="text-gray-300">{q}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue */}
      <button
        onClick={() => navigate('/betting')}
        disabled={players.length < 2}
        className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        Continue to Betting
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
