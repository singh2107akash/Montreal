import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { calculateFavorite } from '../utils/scoring';
import { Crown, ChevronRight, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function MarketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const {
    players, questions, bets, lockedPlayers, nicknames,
    favoriteOverrides, setFavoriteOverride, resolutions,
  } = useGame();

  const allLocked = players.every((p) => lockedPlayers.includes(p));

  const marketData = useMemo(() => {
    return questions.map((q, qi) => {
      const data = calculateFavorite(qi, bets, players);
      const override = favoriteOverrides[qi];
      const favorite = override || data.favorite;
      const pot = data.pointsByPlayer?.[favorite] || data.pot;
      const isResolved = resolutions[qi]?.resolved;

      return {
        question: q,
        index: qi,
        ...data,
        favorite,
        pot,
        challengeValue: Math.floor(pot / 2),
        hasOverride: !!override,
        isResolved,
      };
    });
  }, [questions, bets, players, favoriteOverrides, resolutions]);

  const displayName = (p) => (nicknames[p] ? `${p} (${nicknames[p]})` : p);

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
        >
          &larr; Home
        </button>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => navigate('/resolve')}
              className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              Resolution <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => navigate('/results')}
            className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            Leaderboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        The Market
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Favorites, pots, and breakdown for each question.
        {!allLocked && (
          <span className="text-yellow-500 ml-2">
            ({players.length - lockedPlayers.length} players still betting)
          </span>
        )}
      </p>

      <div className="space-y-4">
        {marketData.map((md) => (
          <div
            key={md.index}
            className={`bg-dark-800 border rounded-xl overflow-hidden ${
              md.isResolved ? 'border-accent-green/30' : md.isTied ? 'border-yellow-500/40' : 'border-dark-600'
            }`}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start gap-2 mb-3">
                <span className="text-xs font-bold text-gold-500 mt-0.5 shrink-0">Q{md.index + 1}</span>
                <p className="text-sm text-gray-300">{md.question}</p>
                {md.isResolved && (
                  <span className="shrink-0 text-[10px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full font-semibold">
                    RESOLVED
                  </span>
                )}
              </div>

              {/* Favorite / Pot / Challenge */}
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gold-400" />
                  <span className="text-sm font-semibold text-gray-200">
                    {md.favorite ? displayName(md.favorite) : 'No bets yet'}
                  </span>
                  {md.hasOverride && (
                    <span className="text-[10px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded font-medium">
                      OVERRIDE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-500">Pot:</span>
                  <span className="text-gold-400 font-bold">{md.pot}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-gray-500">Challenge:</span>
                  <span className="text-accent-red font-bold">{md.challengeValue}</span>
                </div>
              </div>

              {/* Tie warning */}
              {md.isTied && !md.hasOverride && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">Tie for favorite!</span>
                  </div>
                  {isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      {md.tiedPlayers.map((tp) => (
                        <button
                          key={tp}
                          onClick={() => setFavoriteOverride(md.index, tp)}
                          className="bg-dark-700 hover:bg-gold-500/20 border border-dark-500 hover:border-gold-500 text-gray-300 hover:text-gold-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        >
                          Set {tp} as favorite
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-yellow-400/70">Admin will resolve this tie.</p>
                  )}
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="bg-dark-900/50 px-4 py-3 border-t border-dark-700">
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                <Users className="w-3 h-3" />
                Bet breakdown
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {players
                  .filter((p) => md.pointsByPlayer?.[p] > 0)
                  .sort((a, b) => (md.pointsByPlayer[b] || 0) - (md.pointsByPlayer[a] || 0))
                  .map((p) => (
                    <div
                      key={p}
                      className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${
                        p === md.favorite ? 'bg-gold-500/10 text-gold-400' : 'text-gray-400'
                      }`}
                    >
                      <span className="truncate">{p}</span>
                      <span className="font-bold ml-1">{md.pointsByPlayer[p]}</span>
                    </div>
                  ))}
              </div>
              {/* Who bet on whom */}
              <div className="mt-2 space-y-1">
                {Object.entries(bets).map(([bettor, playerBets]) => {
                  const bet = playerBets[md.index];
                  if (!bet?.pick) return null;
                  return (
                    <div key={bettor} className="text-[11px] text-gray-600">
                      <span className="text-gray-400">{bettor}</span> bet{' '}
                      <span className="text-gold-400">{bet.amount}</span> on{' '}
                      <span className="text-gray-400">{bet.pick}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue */}
      <div className="mt-8">
        <button
          onClick={() => navigate(isAdmin ? '/resolve' : '/results')}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 cursor-pointer"
        >
          {isAdmin ? 'Go to Resolution' : 'View Leaderboard'}
        </button>
      </div>
    </div>
  );
}
