import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Plus, X, ChevronRight, Users, HelpCircle, Shield, Pencil, Check, Trash2, RotateCcw, AlertTriangle, Lock, Unlock } from 'lucide-react';

export default function SetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    players, nicknames, questions, config, lockedPlayers,
    setPlayers, setNickname, setQuestions, resetGame, saving,
    bettingClosed, closeBetting, reopenBetting,
  } = useGame();
  const [newPlayer, setNewPlayer] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [editText, setEditText] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [showAddQ, setShowAddQ] = useState(false);

  if (!user?.isAdmin) {
    navigate('/');
    return null;
  }

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (name && !players.includes(name)) {
      setPlayers([...players, name]);
      setNewPlayer('');
    }
  };

  const removePlayer = (name) => {
    if (lockedPlayers.includes(name)) return;
    setPlayers(players.filter((p) => p !== name));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addPlayer();
  };

  const startEditQ = (i) => {
    setEditingQ(i);
    setEditText(questions[i]);
  };

  const saveEditQ = () => {
    if (editingQ === null || !editText.trim()) return;
    const updated = [...questions];
    updated[editingQ] = editText.trim();
    setQuestions(updated);
    setEditingQ(null);
    setEditText('');
  };

  const deleteQ = (i) => {
    const updated = questions.filter((_, idx) => idx !== i);
    setQuestions(updated);
  };

  const addQuestion = () => {
    const text = newQuestion.trim();
    if (!text) return;
    setQuestions([...questions, text]);
    setNewQuestion('');
    setShowAddQ(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-gold-400 text-sm mb-6 inline-block transition-colors cursor-pointer"
      >
        &larr; Home
      </button>

      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5 text-gold-400" />
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
          Command Center
        </h1>
        {saving && (
          <span className="text-xs text-gold-400 animate-pulse ml-2">Saving...</span>
        )}
      </div>
      <p className="text-gray-500 mb-8">Set up the chaos. Add the degens. Write the questions.</p>

      {/* Config summary */}
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
          <span className="text-gold-400 font-bold">{questions.length}</span>
        </div>
        <div>
          <span className="text-gray-500">Locked:</span>{' '}
          <span className="text-gold-400 font-bold">{lockedPlayers.length}/{players.length}</span>
        </div>
      </div>

      {/* Players */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-gold-400" />
          <h2 className="text-xl font-bold text-gray-200">The Degens ({players.length})</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayer}
            onChange={(e) => setNewPlayer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add another degen..."
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
          {players.map((player) => {
            const isPlayerLocked = lockedPlayers.includes(player);
            return (
              <div
                key={player}
                className={`bg-dark-800 border rounded-lg px-4 py-3 flex items-center justify-between group ${
                  isPlayerLocked ? 'border-accent-green/20' : 'border-dark-600'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-200 truncate">{player}</span>
                    {isPlayerLocked && (
                      <span className="text-[10px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded font-medium">
                        LOCKED
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={nicknames[player] || ''}
                    onChange={(e) => setNickname(player, e.target.value)}
                    placeholder="Nickname (optional)"
                    className="text-xs bg-transparent text-gray-500 placeholder-dark-500 focus:outline-none focus:text-gold-400 w-full mt-0.5"
                  />
                </div>
                {!isPlayerLocked && (
                  <button
                    onClick={() => removePlayer(player)}
                    className="text-dark-500 hover:text-accent-red ml-2 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center gap-2 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-medium">
              {showQuestions ? 'Hide' : 'Manage'} Questions ({questions.length})
            </span>
          </button>
        </div>

        {showQuestions && (
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 text-sm group"
              >
                {editingQ === i ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-gold-500 text-sm resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingQ(null)}
                        className="text-gray-500 hover:text-gray-300 text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditQ}
                        disabled={!editText.trim()}
                        className="bg-gold-500 hover:bg-gold-400 disabled:opacity-30 text-dark-900 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-gold-500 font-bold mr-2">Q{i + 1}.</span>
                      <span className="text-gray-300">{q}</span>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditQ(i)}
                        className="text-gray-500 hover:text-gold-400 cursor-pointer p-1"
                        title="Edit question"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteQ(i)}
                        className="text-gray-500 hover:text-accent-red cursor-pointer p-1"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add new question */}
            {showAddQ ? (
              <div className="bg-dark-800 border border-gold-500/30 rounded-lg px-4 py-3">
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={2}
                  placeholder="Type the new question..."
                  className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gold-500 text-sm resize-none mb-2"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowAddQ(false); setNewQuestion(''); }}
                    className="text-gray-500 hover:text-gray-300 text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addQuestion}
                    disabled={!newQuestion.trim()}
                    className="bg-gold-500 hover:bg-gold-400 disabled:opacity-30 text-dark-900 font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Question
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddQ(true)}
                className="w-full bg-dark-800 border border-dashed border-dark-500 hover:border-gold-500 rounded-lg px-4 py-3 text-sm text-gray-500 hover:text-gold-400 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Question
              </button>
            )}
          </div>
        )}
      </div>

      {/* End / Reopen Betting */}
      <div className="mb-6">
        {!bettingClosed ? (
          <button
            onClick={closeBetting}
            className="w-full bg-accent-red/10 border border-accent-red/30 hover:bg-accent-red/20 text-accent-red font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-5 h-5" /> End Betting — Lock Everyone Out
          </button>
        ) : (
          <button
            onClick={reopenBetting}
            className="w-full bg-accent-green/10 border border-accent-green/30 hover:bg-accent-green/20 text-accent-green font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-5 h-5" /> Reopen Betting — Unlock Everyone
          </button>
        )}
        <p className="text-center text-xs text-gray-600 mt-2">
          {bettingClosed
            ? 'Betting is closed. No one can place or change bets.'
            : 'Close betting when everyone is done. This locks all players.'}
        </p>
      </div>

      {/* Admin nav */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/betting')}
          disabled={players.length < 2}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          Let the Betting Begin <ChevronRight className="w-5 h-5" />
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/market')}
            className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
          >
            The Odds Board
          </button>
          <button
            onClick={() => navigate('/resolve')}
            className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Judgment Day
          </button>
          <button
            onClick={() => navigate('/results')}
            className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
        </div>
      </div>

      {/* Reset Game */}
      <div className="mt-12 pt-8 border-t border-dark-700">
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-accent-red text-sm py-3 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset Game
          </button>
        ) : (
          <div className="bg-dark-800 border border-accent-red/30 rounded-xl p-5 text-center">
            <AlertTriangle className="w-8 h-8 text-accent-red mx-auto mb-3" />
            <p className="text-gray-200 font-bold mb-1">Nuke everything?</p>
            <p className="text-gray-500 text-sm mb-4">
              This wipes all bets, passwords, resolutions, and locks. Everything goes back to zero. There's no coming back from this.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2.5 rounded-lg text-sm text-gray-400 hover:text-gray-200 bg-dark-700 hover:bg-dark-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { resetGame(); setShowResetConfirm(false); }}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-accent-red hover:bg-red-500 transition-colors cursor-pointer"
              >
                Burn It All Down
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
