import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import { calculateLeaderboard, calculateFavorite } from '../utils/scoring';
import { exportGameState } from '../utils/storage';
import {
  Trophy, Crown, TrendingUp, TrendingDown, Flame, Target,
  Download, RotateCcw, Check, X, UserCheck,
} from 'lucide-react';

const RANK_STYLES = [
  'from-yellow-400 to-amber-500 text-dark-900',
  'from-gray-300 to-gray-400 text-dark-900',
  'from-amber-600 to-amber-700 text-dark-900',
];

const RANK_LABELS = ['1st', '2nd', '3rd'];

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    players, questions, bets, resolutions, favoriteOverrides, nicknames,
    resetGame,
  } = useGame();

  const leaderboard = useMemo(
    () => calculateLeaderboard(players, bets, resolutions, questions),
    [players, bets, resolutions, questions]
  );

  const resolvedCount = Object.values(resolutions).filter((r) => r?.resolved).length;

  const questionResults = useMemo(() => {
    return questions.map((q, qi) => {
      const data = calculateFavorite(qi, bets, players);
      const override = favoriteOverrides[qi];
      const favorite = override || data.favorite;
      const resolution = resolutions[qi];
      return { question: q, index: qi, favorite, resolution };
    });
  }, [questions, bets, players, favoriteOverrides, resolutions]);

  const displayName = (p) => (nicknames[p] ? `${p} (${nicknames[p]})` : p);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the entire game? This cannot be undone.')) {
      resetGame();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/resolve')}
          className="text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
        >
          &larr; Resolution
        </button>
        <div className="flex gap-3">
          <button
            onClick={exportGameState}
            className="text-gray-500 hover:text-gold-400 text-sm transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-accent-red text-sm transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase mb-1">
          Montreal Bachelor Edition
        </div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent mb-2">
          LEADERBOARD
        </h1>
        <p className="text-gray-500 text-sm">
          {resolvedCount}/{questions.length} questions resolved
        </p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[1, 0, 2].map((rankIdx) => {
            const entry = leaderboard[rankIdx];
            if (!entry) return null;
            const isFirst = rankIdx === 0;
            return (
              <div
                key={entry.name}
                className={`text-center ${isFirst ? 'order-2' : rankIdx === 1 ? 'order-1' : 'order-3'}`}
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${RANK_STYLES[rankIdx]} flex items-center justify-center mx-auto mb-2 ${isFirst ? 'ring-4 ring-gold-400/30 scale-110' : ''}`}>
                  {isFirst ? (
                    <Trophy className="w-8 h-8 md:w-10 md:h-10" />
                  ) : (
                    <span className="text-2xl font-black">{rankIdx + 1}</span>
                  )}
                </div>
                <div className="text-sm font-bold text-gray-200 truncate max-w-[80px] md:max-w-[100px]">
                  {entry.name}
                </div>
                <div className={`text-lg font-black ${entry.score >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {entry.score > 0 ? '+' : ''}{entry.score}
                </div>
                <div className="text-[10px] text-gray-600 font-medium">{RANK_LABELS[rankIdx]}</div>
                <div className={`mt-1 ${isFirst ? 'h-24' : rankIdx === 1 ? 'h-16' : 'h-10'} w-20 md:w-24 bg-gradient-to-t ${RANK_STYLES[rankIdx]} rounded-t-lg opacity-20`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Full leaderboard */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-dark-700">
          <h2 className="font-bold text-gray-200 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold-400" />
            Full Rankings
          </h2>
        </div>
        <div className="divide-y divide-dark-700">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.name}
              className={`px-4 py-3 flex items-center gap-4 ${i < 3 ? 'bg-dark-700/30' : ''}`}
            >
              <span className={`text-sm font-bold w-6 text-center ${
                i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-600'
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-200 text-sm truncate">{displayName(entry.name)}</div>
                <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Crown className="w-3 h-3 text-gold-500" />
                    Fav {entry.timesFavorite}x
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-accent-green" />
                    Delivered {entry.deliveredAsFavorite}x
                  </span>
                  <span className="flex items-center gap-0.5">
                    <X className="w-3 h-3 text-accent-red" />
                    Penalized {entry.penalizedAsFavorite}x
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-accent-purple" />
                    Stolen {entry.stolenCategories}x
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-black ${entry.score >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {entry.score > 0 ? '+' : ''}{entry.score}
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-accent-green flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +{entry.totalGains}
                  </span>
                  <span className="text-accent-red flex items-center gap-0.5">
                    <TrendingDown className="w-2.5 h-2.5" />
                    {entry.totalLosses}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-player betting summary */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden mb-8">
        <div className="px-4 py-3 border-b border-dark-700">
          <h2 className="font-bold text-gray-200 flex items-center gap-2">
            <Target className="w-4 h-4 text-gold-400" />
            Betting Summary
          </h2>
        </div>
        <div className="divide-y divide-dark-700">
          {players.map((player) => {
            const playerBets = bets[player] || {};
            const totalSpent = Object.values(playerBets).reduce((s, b) => s + (b?.amount || 0), 0);
            const picks = Object.entries(playerBets)
              .filter(([, b]) => b?.pick)
              .map(([qi, b]) => ({ qi: Number(qi), ...b }));

            return (
              <details key={player} className="group">
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-dark-700/30 transition-colors">
                  <span className="font-medium text-gray-200 text-sm">{displayName(player)}</span>
                  <span className="text-xs text-gray-500">{totalSpent} pts spent</span>
                </summary>
                <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {picks.map(({ qi, pick, amount }) => (
                    <div key={qi} className="text-[11px] text-gray-500 flex justify-between px-2 py-1 bg-dark-900/30 rounded">
                      <span className="truncate">Q{qi + 1}: {pick}</span>
                      <span className="text-gold-400 font-bold ml-2">{amount}</span>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      {/* Question-by-question results */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-200 flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-gold-400" />
          Question Results
        </h2>
        <div className="space-y-2">
          {questionResults.map((qr) => (
            <div
              key={qr.index}
              className={`bg-dark-800 border rounded-lg px-4 py-3 flex items-start gap-3 ${
                qr.resolution?.resolved ? 'border-dark-600' : 'border-dark-700 opacity-50'
              }`}
            >
              <span className={`text-xs font-bold mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                qr.resolution?.resolved ? 'bg-accent-green/20 text-accent-green' : 'bg-dark-600 text-gray-600'
              }`}>
                {qr.resolution?.resolved ? <Check className="w-3 h-3" /> : qr.index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 leading-relaxed mb-1">{qr.question}</p>
                {qr.resolution?.resolved ? (
                  <div className={`text-xs font-semibold ${
                    qr.resolution.outcomeType === 'favorite'
                      ? 'text-accent-green'
                      : qr.resolution.outcomeType === 'someone_else'
                      ? 'text-accent-blue'
                      : 'text-accent-red'
                  }`}>
                    {qr.resolution.outcomeType === 'favorite' && `${qr.favorite} delivered!`}
                    {qr.resolution.outcomeType === 'someone_else' && `${qr.resolution.actualPerson} stole it!`}
                    {qr.resolution.outcomeType === 'nobody' && 'Nobody did it'}
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">Pending...</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] text-gray-600">Fav</div>
                <div className="text-xs font-bold text-gold-400">{qr.favorite || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex gap-3 mb-12">
        <button
          onClick={() => navigate('/resolve')}
          className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          Back to Resolution
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 bg-dark-700 hover:bg-dark-600 text-gray-300 font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer"
        >
          Home
        </button>
      </div>
    </div>
  );
}
