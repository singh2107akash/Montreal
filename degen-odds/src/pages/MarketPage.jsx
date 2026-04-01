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
    // Count how many questions each player is favorite for
    const favoriteCounts = {};
    questions.forEach((q, qi) => {
      const data = calculateFavorite(qi, bets, players);
      const override = favoriteOverrides[qi];
      const fav = override || data.favorite;
      if (fav) favoriteCounts[fav] = (favoriteCounts[fav] || 0) + 1;
    });

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
        favoriteCount: favorite ? favoriteCounts[favorite] : 0,
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
          <button
            onClick={() => navigate('/my-odds')}
            className="text-accent-purple hover:text-purple-400 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            What's At Stake <ChevronRight className="w-4 h-4" />
          </button>
          {isAdmin && (
            <button
              onClick={() => navigate('/resolve')}
              className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              Judgment Day <ChevronRight className="w-4 h-4" />
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
        The Odds Board
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        See who the group is putting their money on. No hiding now.
        {!allLocked && (
          <span className="text-yellow-500 ml-2">
            ({players.length - lockedPlayers.length} degens still deciding)
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

              {/* Favorite / Pot */}
              <div className="flex flex-wrap gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent-green" />
                  <span className="text-sm font-semibold text-gray-200">
                    {md.favorite ? displayName(md.favorite) : 'No bets yet'}
                  </span>
                  {md.favorite && md.favoriteCount > 1 && (
                    <span className="text-[10px] bg-dark-600 text-gray-400 px-1.5 py-0.5 rounded font-bold">
                      Favorite {md.favoriteCount}x
                    </span>
                  )}
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
                          className="bg-dark-700 hover:bg-accent-green/20 border border-dark-500 hover:border-accent-green text-gray-300 hover:text-accent-green px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
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
                Who's on the hook
              </div>
              <div className="space-y-1.5">
                {players
                  .filter((p) => md.pointsByPlayer?.[p] > 0)
                  .sort((a, b) => (md.pointsByPlayer[b] || 0) - (md.pointsByPlayer[a] || 0))
                  .map((p) => {
                    const pts = md.pointsByPlayer[p] || 0;
                    const backers = md.backersByPlayer?.[p] || 0;
                    const isFav = p === md.favorite;
                    const barWidth = md.pot > 0 ? Math.max(8, (pts / md.pot) * 100) : 0;
                    return (
                      <div key={p}>
                        <div className="flex items-center justify-between text-sm mb-0.5">
                          <div className="flex items-center gap-2">
                            {isFav && <Crown className="w-3.5 h-3.5 text-accent-green" />}
                            <span className={`font-medium ${isFav ? 'text-accent-green' : 'text-gray-300'}`}>
                              {displayName(p)}
                            </span>
                            {isFav && (
                              <span className="text-[10px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded font-bold">
                                FAVORITE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">{backers} {backers === 1 ? 'bet' : 'bets'}</span>
                            <span className={`font-bold ${isFav ? 'text-accent-green' : 'text-gray-400'}`}>{pts} pts</span>
                          </div>
                        </div>
                        <div className="w-full bg-dark-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isFav ? 'bg-accent-green' : 'bg-gray-600'
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {players.filter((p) => md.pointsByPlayer?.[p] > 0).length === 0 && (
                  <p className="text-xs text-gray-600">Nobody has the guts to bet yet</p>
                )}
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
          {isAdmin ? 'Time to Settle Scores' : 'Leaderboard'}
        </button>
      </div>
    </div>
  );
}
