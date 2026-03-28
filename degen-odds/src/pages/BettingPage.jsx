import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Lock, ChevronRight, ChevronLeft, AlertCircle, Check, ChevronDown, Shield } from 'lucide-react';

export default function BettingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    players, questions, bets, lockedPlayers, config, nicknames, saving,
    placeBet, lockPlayer,
  } = useGame();

  const isAdmin = user?.isAdmin;

  const [activePlayer, setActivePlayer] = useState(() => {
    if (!isAdmin) return user.name;
    return players.find((p) => !lockedPlayers.includes(p)) || players[0];
  });
  const [currentQ, setCurrentQ] = useState(0);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [localPick, setLocalPick] = useState('');
  const [localAmount, setLocalAmount] = useState('');
  const [error, setError] = useState('');

  const playerBets = bets[activePlayer] || {};
  const isLocked = lockedPlayers.includes(activePlayer);
  const allLocked = players.every((p) => lockedPlayers.includes(p));

  const totalSpent = useMemo(() => {
    return Object.values(playerBets).reduce((sum, b) => sum + (b?.amount || 0), 0);
  }, [playerBets]);

  const remaining = config.totalBudget - totalSpent;

  const questionsAnswered = Object.keys(playerBets).filter(
    (k) => playerBets[k]?.pick && playerBets[k]?.amount >= config.minBetPerQuestion
  ).length;

  // Sync local state when switching questions or players
  const currentBet = playerBets[currentQ];
  const syncLocal = (qi) => {
    const bet = playerBets[qi];
    setLocalPick(bet?.pick || '');
    setLocalAmount(bet?.amount ? String(bet.amount) : '');
    setError('');
  };

  // Initialize local state for current question if empty
  useState(() => {
    if (currentBet) {
      setLocalPick(currentBet.pick || '');
      setLocalAmount(currentBet.amount ? String(currentBet.amount) : '');
    }
  });

  const otherPlayers = players.filter((p) => p !== activePlayer);
  const displayName = (p) => nicknames[p] ? `${p} (${nicknames[p]})` : p;

  const spentOnOthers = Object.entries(playerBets)
    .filter(([k]) => Number(k) !== currentQ)
    .reduce((sum, [, b]) => sum + (b?.amount || 0), 0);
  const maxForThis = config.totalBudget - spentOnOthers;

  const validateAndSave = () => {
    const amount = Number(localAmount);
    if (!localPick) {
      setError('Pick a player');
      return false;
    }
    if (!localAmount || amount < config.minBetPerQuestion) {
      setError(`Min bet is ${config.minBetPerQuestion} pts`);
      return false;
    }
    if (amount > maxForThis) {
      setError(`Over budget! Max ${maxForThis} pts for this question`);
      return false;
    }
    setError('');
    placeBet(activePlayer, currentQ, localPick, amount);
    return true;
  };

  const goNext = () => {
    if (localPick || localAmount) {
      if (!validateAndSave()) return;
    }
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      syncLocal(next);
    }
  };

  const goPrev = () => {
    if (localPick || localAmount) {
      validateAndSave(); // save silently when going back
    }
    if (currentQ > 0) {
      const prev = currentQ - 1;
      setCurrentQ(prev);
      syncLocal(prev);
    }
  };

  const goToQuestion = (qi) => {
    if (localPick || localAmount) {
      validateAndSave();
    }
    setCurrentQ(qi);
    syncLocal(qi);
  };

  const handleSubmit = () => {
    // Validate current question first
    if (localPick || localAmount) {
      if (!validateAndSave()) return;
    }
    // Check all questions are answered
    const allAnswered = questions.every((_, qi) => {
      const b = playerBets[qi];
      return b?.pick && b?.amount >= config.minBetPerQuestion;
    });
    if (!allAnswered) {
      setError('Finish all questions before you lock in, coward');
      return;
    }
    const total = Object.values(playerBets).reduce((s, b) => s + (b?.amount || 0), 0);
    if (total > config.totalBudget) {
      setError('You\'re broke! Over budget!');
      return;
    }
    lockPlayer(activePlayer);
    if (isAdmin) {
      const next = players.find((p) => !lockedPlayers.includes(p) && p !== activePlayer);
      if (next) {
        setActivePlayer(next);
        setCurrentQ(0);
        syncLocal(0);
      }
    }
  };

  const switchPlayer = (p) => {
    setActivePlayer(p);
    setShowPlayerSelect(false);
    setCurrentQ(0);
    const bet = (bets[p] || {})[0];
    setLocalPick(bet?.pick || '');
    setLocalAmount(bet?.amount ? String(bet.amount) : '');
    setError('');
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
        >
          &larr; Home
        </button>
        <div className="flex items-center gap-3">
          {saving && (
            <span className="text-xs text-gold-400 animate-pulse">Saving...</span>
          )}
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-gold-400">
              <Shield className="w-3 h-3" /> Admin
            </span>
          )}
          {allLocked && (
            <button
              onClick={() => navigate('/market')}
              className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              The Odds Board <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        {isAdmin ? 'The War Room' : 'Put Up or Shut Up'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {lockedPlayers.length}/{players.length} degens committed
      </p>

      {/* Player selector */}
      {isAdmin ? (
        <div className="relative mb-6">
          <button
            onClick={() => setShowPlayerSelect(!showPlayerSelect)}
            className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-left flex items-center justify-between cursor-pointer hover:border-gold-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center text-dark-900 font-bold text-sm">
                {activePlayer[0]}
              </div>
              <div>
                <div className="font-medium text-gray-200">{displayName(activePlayer)}</div>
                <div className="text-xs text-gray-500">
                  {isLocked ? 'Locked in, no backing out' : `${questionsAnswered}/${questions.length} calls made`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLocked && <Lock className="w-4 h-4 text-gold-400" />}
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </button>

          {showPlayerSelect && (
            <div className="absolute z-20 mt-1 w-full bg-dark-700 border border-dark-600 rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto">
              {players.map((p) => (
                <button
                  key={p}
                  onClick={() => switchPlayer(p)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-dark-600 transition-colors cursor-pointer ${
                    p === activePlayer ? 'bg-dark-600' : ''
                  }`}
                >
                  <span className="text-gray-200">{displayName(p)}</span>
                  {lockedPlayers.includes(p) && <Lock className="w-3 h-3 text-gold-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user.name[0]}
          </div>
          <div>
            <div className="font-medium text-gray-200">{displayName(user.name)}</div>
            <div className="text-xs text-gray-500">
              {isLocked ? 'Locked in, no backing out' : `${questionsAnswered}/${questions.length} calls made`}
            </div>
          </div>
          {isLocked && <Lock className="w-4 h-4 text-gold-400 ml-auto" />}
        </div>
      )}

      {/* Budget bar */}
      {!isLocked && (
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Budget</span>
            <span className={`font-bold ${remaining < 0 ? 'text-accent-red' : remaining < 20 ? 'text-yellow-400' : 'text-gold-400'}`}>
              {remaining} pts remaining
            </span>
          </div>
          <div className="w-full bg-dark-600 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                remaining < 0 ? 'bg-accent-red' : 'bg-gradient-to-r from-gold-500 to-gold-400'
              }`}
              style={{ width: `${Math.min(100, (totalSpent / config.totalBudget) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>0</span>
            <span>{totalSpent} spent</span>
            <span>{config.totalBudget}</span>
          </div>
        </div>
      )}

      {isLocked ? (
        <div className="bg-dark-800 border border-gold-500/30 rounded-xl p-8 text-center">
          <Lock className="w-10 h-10 text-gold-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-200 mb-2">You're Locked In</h2>
          <p className="text-gray-500 text-sm mb-4">
            {isAdmin
              ? `${activePlayer} is locked and loaded. Pick another degen above.`
              : 'No backing out now. Go see who the group thinks is gonna deliver.'}
          </p>
          <button
            onClick={() => navigate('/market')}
            className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors cursor-pointer"
          >
            See the Odds &rarr;
          </button>
        </div>
      ) : (
        <>
          {/* Question progress dots */}
          <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
            {questions.map((_, qi) => {
              const bet = playerBets[qi];
              const done = bet?.pick && bet?.amount >= config.minBetPerQuestion;
              const isCurrent = qi === currentQ;
              return (
                <button
                  key={qi}
                  onClick={() => goToQuestion(qi)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-gold-500 text-dark-900 scale-110'
                      : done
                      ? 'bg-accent-green/20 text-accent-green'
                      : 'bg-dark-700 text-gray-500 hover:bg-dark-600'
                  }`}
                >
                  {done && !isCurrent ? <Check className="w-3.5 h-3.5" /> : qi + 1}
                </button>
              );
            })}
          </div>

          {/* Single question card */}
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gold-500 font-bold text-sm">Question {currentQ + 1} of {questions.length}</span>
            </div>
            <p className="text-gray-200 text-lg font-medium leading-relaxed mb-6">
              {questions[currentQ]}
            </p>

            {/* Pick a player */}
            <label className="block text-xs text-gray-500 mb-2 font-medium">Who's catching this one?</label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {otherPlayers.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setLocalPick(p);
                    if (!localAmount) setLocalAmount(String(config.minBetPerQuestion));
                    setError('');
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                    localPick === p
                      ? 'bg-gold-500/20 border-gold-500 text-gold-400'
                      : 'bg-dark-700 border-dark-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {displayName(p)}
                </button>
              ))}
            </div>

            {/* Bet amount */}
            <label className="block text-xs text-gray-500 mb-2 font-medium">
              How confident are you? (min {config.minBetPerQuestion}, max {maxForThis} pts)
            </label>
            <div className="relative mb-4">
              <input
                type="number"
                min={config.minBetPerQuestion}
                max={maxForThis}
                value={localAmount}
                onChange={(e) => { setLocalAmount(e.target.value); setError(''); }}
                placeholder={`${config.minBetPerQuestion}`}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-gray-200 focus:outline-none focus:border-gold-500 text-lg font-bold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-600">pts</span>
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-2 mb-4">
              {[5, 10, 15, 20, 25].filter(v => v <= maxForThis).map((v) => (
                <button
                  key={v}
                  onClick={() => { setLocalAmount(String(v)); setError(''); }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    Number(localAmount) === v
                      ? 'bg-gold-500/20 text-gold-400 border border-gold-500'
                      : 'bg-dark-700 text-gray-400 border border-dark-600 hover:border-gray-500'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-accent-red text-sm mb-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={goPrev}
              disabled={currentQ === 0}
              className="flex-1 bg-dark-700 hover:bg-dark-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 font-medium py-3.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            {currentQ < questions.length - 1 ? (
              <button
                onClick={goNext}
                className="flex-1 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-accent-green to-green-500 hover:from-green-500 hover:to-accent-green text-white font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Lock It In, No Excuses
              </button>
            )}
          </div>

          {/* Progress summary */}
          <div className="text-center text-sm text-gray-500">
            {questionsAnswered}/{questions.length} calls made &middot; {remaining} pts left to blow
          </div>
        </>
      )}
    </div>
  );
}
