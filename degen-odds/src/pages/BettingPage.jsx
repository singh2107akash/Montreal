import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Lock, ChevronRight, AlertCircle, Check, ChevronDown, Shield } from 'lucide-react';

export default function BettingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    players, questions, bets, lockedPlayers, config, nicknames,
    placeBet, lockPlayer,
  } = useGame();

  const isAdmin = user?.isAdmin;

  // Players can only bet for themselves. Admin can manage any player.
  const [activePlayer, setActivePlayer] = useState(() => {
    if (!isAdmin) return user.name;
    return players.find((p) => !lockedPlayers.includes(p)) || players[0];
  });
  const [errors, setErrors] = useState({});
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);

  const playerBets = bets[activePlayer] || {};

  const totalSpent = useMemo(() => {
    return Object.values(playerBets).reduce((sum, b) => sum + (b?.amount || 0), 0);
  }, [playerBets]);

  const remaining = config.totalBudget - totalSpent;
  const isLocked = lockedPlayers.includes(activePlayer);
  const allLocked = players.every((p) => lockedPlayers.includes(p));

  const questionsAnswered = Object.keys(playerBets).filter(
    (k) => playerBets[k]?.pick && playerBets[k]?.amount >= config.minBetPerQuestion
  ).length;

  const handleBet = (qi, pick, amount) => {
    if (isLocked && !isAdmin) return;

    const numAmount = Number(amount);
    const newErrors = { ...errors };
    delete newErrors[qi];

    if (amount !== '' && numAmount < config.minBetPerQuestion) {
      newErrors[qi] = `Min bet is ${config.minBetPerQuestion} pts`;
    }

    const otherSpent = Object.entries(playerBets)
      .filter(([k]) => Number(k) !== qi)
      .reduce((sum, [, b]) => sum + (b?.amount || 0), 0);

    if (numAmount + otherSpent > config.totalBudget) {
      newErrors[qi] = `Exceeds budget (${config.totalBudget - otherSpent} remaining)`;
    }

    setErrors(newErrors);
    placeBet(activePlayer, qi, pick, amount === '' ? 0 : numAmount);
  };

  const canSubmit = useMemo(() => {
    if (questionsAnswered < questions.length) return false;
    if (totalSpent > config.totalBudget) return false;
    if (totalSpent < config.minBetPerQuestion * questions.length) return false;
    return Object.keys(errors).length === 0;
  }, [questionsAnswered, totalSpent, config, questions.length, errors]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    lockPlayer(activePlayer);
    if (isAdmin) {
      const next = players.find((p) => !lockedPlayers.includes(p) && p !== activePlayer);
      if (next) setActivePlayer(next);
    }
  };

  const displayName = (p) => nicknames[p] ? `${p} (${nicknames[p]})` : p;
  const otherPlayers = players.filter((p) => p !== activePlayer);

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
              View Market <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        {isAdmin ? 'Manage Bets' : 'Place Your Bets'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {lockedPlayers.length}/{players.length} players locked in
      </p>

      {/* Player selector - admin can switch, players see only themselves */}
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
                  {isLocked ? 'Bets locked' : `${questionsAnswered}/${questions.length} answered`}
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
                  onClick={() => { setActivePlayer(p); setShowPlayerSelect(false); setErrors({}); }}
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
              {isLocked ? 'Bets locked' : `${questionsAnswered}/${questions.length} answered`}
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
          <h2 className="text-xl font-bold text-gray-200 mb-2">Bets Locked</h2>
          <p className="text-gray-500 text-sm mb-4">
            {isAdmin
              ? `${activePlayer}'s bets are locked. Select another player above.`
              : 'Your bets are in! Check the market to see favorites.'}
          </p>
          <button
            onClick={() => navigate('/market')}
            className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors cursor-pointer"
          >
            View Market &rarr;
          </button>
        </div>
      ) : (
        <>
          {/* Question cards */}
          <div className="space-y-3 mb-8">
            {questions.map((q, qi) => {
              const bet = playerBets[qi];
              const hasError = errors[qi];
              const isComplete = bet?.pick && bet?.amount >= config.minBetPerQuestion;

              return (
                <div
                  key={qi}
                  className={`bg-dark-800 border rounded-xl p-4 transition-colors ${
                    hasError ? 'border-accent-red/50' : isComplete ? 'border-accent-green/30' : 'border-dark-600'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span className={`text-xs font-bold mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-accent-green/20 text-accent-green' : 'bg-dark-600 text-gray-500'
                    }`}>
                      {isComplete ? <Check className="w-3.5 h-3.5" /> : qi + 1}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed">{q}</p>
                  </div>

                  <div className="flex gap-2 flex-col sm:flex-row">
                    <select
                      value={bet?.pick || ''}
                      onChange={(e) => handleBet(qi, e.target.value, bet?.amount || config.minBetPerQuestion)}
                      className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-gold-500 cursor-pointer appearance-none"
                    >
                      <option value="">Pick a player...</option>
                      {otherPlayers.map((p) => (
                        <option key={p} value={p}>{displayName(p)}</option>
                      ))}
                    </select>

                    <div className="relative w-full sm:w-28">
                      <input
                        type="number"
                        min={config.minBetPerQuestion}
                        max={config.totalBudget}
                        value={bet?.amount || ''}
                        onChange={(e) => handleBet(qi, bet?.pick || '', e.target.value)}
                        placeholder={`${config.minBetPerQuestion}+`}
                        className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-gold-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">pts</span>
                    </div>
                  </div>

                  {hasError && (
                    <div className="flex items-center gap-1 mt-2 text-accent-red text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {errors[qi]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <div className="sticky bottom-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 shadow-lg cursor-pointer"
            >
              Lock In {isAdmin ? `${activePlayer}'s` : 'My'} Bets ({questionsAnswered}/{questions.length})
            </button>
            {!canSubmit && questionsAnswered > 0 && (
              <p className="text-center text-xs text-gray-600 mt-2">
                {questionsAnswered < questions.length
                  ? `Answer all ${questions.length} questions`
                  : remaining < 0
                  ? 'Over budget!'
                  : 'Fix errors above'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
