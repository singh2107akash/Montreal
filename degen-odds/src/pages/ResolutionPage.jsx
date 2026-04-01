import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import { calculateFavorite, calculateScoreChanges } from '../utils/scoring';
import { Crown, Check, X, UserCheck, ChevronRight, RotateCcw } from 'lucide-react';

export default function ResolutionPage() {
  const navigate = useNavigate();
  const {
    players, questions, bets, resolutions, favoriteOverrides,
    resolveQuestion, unresolveQuestion,
  } = useGame();

  const resolvedCount = Object.values(resolutions).filter((r) => r?.resolved).length;

  const questionsData = useMemo(() => {
    return questions.map((q, qi) => {
      const data = calculateFavorite(qi, bets, players);
      const override = favoriteOverrides[qi];
      const favorite = override || data.favorite;
      const pot = data.pointsByPlayer?.[favorite] || data.pot;
      const challengeValue = Math.floor(pot / 2);
      const resolution = resolutions[qi];

      return {
        question: q,
        index: qi,
        favorite,
        pot,
        challengeValue,
        resolution,
      };
    });
  }, [questions, bets, players, favoriteOverrides, resolutions]);

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer"
        >
          &larr; Home
        </button>
        <button
          onClick={() => navigate('/results')}
          className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
        >
          Leaderboard <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        Judgment Day
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {resolvedCount}/{questions.length} fates sealed
      </p>

      {/* Progress bar */}
      <div className="w-full bg-dark-700 rounded-full h-2 mb-8">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-accent-green to-green-400 transition-all duration-500"
          style={{ width: `${(resolvedCount / questions.length) * 100}%` }}
        />
      </div>

      <div className="space-y-4">
        {questionsData.map((qd) => (
          <ResolutionCard
            key={qd.index}
            data={qd}
            players={players}
            bets={bets}
            onResolve={resolveQuestion}
            onUnresolve={unresolveQuestion}
          />
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate('/results')}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 cursor-pointer"
        >
          Leaderboard
        </button>
      </div>
    </div>
  );
}

function ResolutionCard({ data, players, bets, onResolve, onUnresolve }) {
  const { question, index, favorite, pot, challengeValue, resolution } = data;
  const isResolved = resolution?.resolved;
  const [selectedOutcome, setSelectedOutcome] = useState(resolution?.outcomeType || '');
  const [selectedPerson, setSelectedPerson] = useState(resolution?.actualPerson || '');
  const [showPreview, setShowPreview] = useState(false);

  const previewChanges = useMemo(() => {
    if (!selectedOutcome || !favorite) return null;
    if (selectedOutcome === 'someone_else' && !selectedPerson) return null;
    return calculateScoreChanges(
      index, bets, players, favorite, pot, challengeValue,
      selectedOutcome, selectedPerson
    );
  }, [selectedOutcome, selectedPerson, index, bets, players, favorite, pot, challengeValue]);

  const handleResolve = () => {
    if (!selectedOutcome) return;
    if (selectedOutcome === 'someone_else' && !selectedPerson) return;
    onResolve(index, selectedOutcome, selectedOutcome === 'someone_else' ? selectedPerson : null);
  };

  const handleUnresolve = () => {
    onUnresolve(index);
    setSelectedOutcome('');
    setSelectedPerson('');
  };

  return (
    <div className={`bg-dark-800 border rounded-xl overflow-hidden transition-colors ${
      isResolved ? 'border-accent-green/30' : 'border-dark-600'
    }`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2">
            <span className={`text-xs font-bold mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isResolved ? 'bg-accent-green/20 text-accent-green' : 'bg-dark-600 text-gray-500'
            }`}>
              {isResolved ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>
            <p className="text-sm text-gray-300">{question}</p>
          </div>
          {isResolved && (
            <button
              onClick={handleUnresolve}
              className="shrink-0 text-gray-600 hover:text-accent-red transition-colors cursor-pointer"
              title="Re-open this question"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Info row */}
        <div className="flex flex-wrap gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-gray-400">Favorite:</span>
            <span className="font-semibold text-accent-green">{favorite || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-500">Pot:</span>{' '}
            <span className="text-gold-400 font-bold">{pot}</span>
          </div>
          <div>
            <span className="text-gray-500">Challenge:</span>{' '}
            <span className="text-accent-red font-bold">{challengeValue}</span>
          </div>
        </div>

        {isResolved ? (
          <div className={`rounded-lg p-3 text-sm ${
            resolution.outcomeType === 'favorite'
              ? 'bg-accent-green/10 text-accent-green'
              : resolution.outcomeType === 'someone_else'
              ? 'bg-accent-purple/10 text-accent-purple'
              : 'bg-yellow-400/10 text-yellow-400'
          }`}>
            {resolution.outcomeType === 'favorite' && (
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">{favorite}</span> delivered!
              </div>
            )}
            {resolution.outcomeType === 'someone_else' && (
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span className="font-semibold">{resolution.actualPerson}</span> stole it from {favorite}!
              </div>
            )}
            {resolution.outcomeType === 'nobody' && (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Nobody delivered. {favorite} choked as favorite.
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Outcome selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <button
                onClick={() => { setSelectedOutcome('favorite'); setSelectedPerson(''); setShowPreview(true); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  selectedOutcome === 'favorite'
                    ? 'bg-accent-green/20 border-accent-green/50 text-accent-green'
                    : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <Crown className="w-3.5 h-3.5 inline mr-1" />
                Favorite delivered
              </button>
              <button
                onClick={() => { setSelectedOutcome('someone_else'); setShowPreview(true); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  selectedOutcome === 'someone_else'
                    ? 'bg-accent-purple/20 border-accent-purple/50 text-accent-purple'
                    : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 inline mr-1" />
                Someone stole it
              </button>
              <button
                onClick={() => { setSelectedOutcome('nobody'); setSelectedPerson(''); setShowPreview(true); }}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                  selectedOutcome === 'nobody'
                    ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400'
                    : 'bg-dark-700 border-dark-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                <X className="w-3.5 h-3.5 inline mr-1" />
                Nobody delivered
              </button>
            </div>

            {/* Person picker for "someone else" */}
            {selectedOutcome === 'someone_else' && (
              <select
                value={selectedPerson}
                onChange={(e) => setSelectedPerson(e.target.value)}
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-gold-500 mb-3 cursor-pointer appearance-none"
              >
                <option value="">Who actually pulled it off?</option>
                {players.filter((p) => p !== favorite).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}

            {/* Score preview */}
            {showPreview && previewChanges && (
              <div className="bg-dark-900/50 rounded-lg p-3 mb-3">
                <div className="text-xs text-gray-500 mb-2 font-medium">Damage Report</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {Object.entries(previewChanges)
                    .filter(([, v]) => v !== 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([player, change]) => (
                      <div key={player} className="flex items-center justify-between text-xs px-2 py-1">
                        <span className="text-gray-400 truncate">{player}</span>
                        <span className={`font-bold ${change > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                          {change > 0 ? '+' : ''}{change}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Resolve button */}
            <button
              onClick={handleResolve}
              disabled={!selectedOutcome || (selectedOutcome === 'someone_else' && !selectedPerson)}
              className="w-full bg-gold-500 hover:bg-gold-400 disabled:opacity-30 disabled:cursor-not-allowed text-dark-900 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors cursor-pointer"
            >
              Seal Q{index + 1}'s Fate
            </button>
          </>
        )}
      </div>
    </div>
  );
}
