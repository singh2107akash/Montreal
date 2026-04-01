import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { calculateFavorite } from '../utils/scoring';
import {
  Crown, ChevronRight, ChevronDown, TrendingUp, TrendingDown,
  Zap, Target, Swords, Check, X, Minus, Flame, AlertTriangle,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

export default function MyOddsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    players, questions, bets, nicknames,
    favoriteOverrides, resolutions, config,
  } = useGame();

  const playerName = user?.name;
  const playerBets = bets[playerName] || {};

  const [missionsOpen, setMissionsOpen] = useState(true);
  const [stealsOpen, setStealsOpen] = useState(true);
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);
  const toggleQ = (qi) => setExpandedQ(expandedQ === qi ? null : qi);

  const analysis = useMemo(() => {
    return questions.map((q, qi) => {
      const bet = playerBets[qi];
      const data = calculateFavorite(qi, bets, players);
      const override = favoriteOverrides[qi];
      const favorite = override || data.favorite;
      const pot = data.pointsByPlayer?.[favorite] || data.pot;
      const challengeValue = Math.floor(pot / 2);
      const isResolved = resolutions[qi]?.resolved;
      const resolution = resolutions[qi];
      const underdogPotBonus = Math.floor(pot * 0.75);

      const iAmFavorite = playerName === favorite;
      const iAmNotFavorite = favorite && playerName !== favorite;

      const pick = bet?.pick;
      const amount = bet?.amount || 0;
      const hasBet = !!(pick && amount);
      const betOnFavorite = pick === favorite;

      let favNet = 0, myPickNet = null, iStealNet = null, elseNet = 0, nobodyNet = 0;

      if (hasBet) {
        favNet = betOnFavorite ? Math.floor(amount * 1.5) : 0;
        if (iAmFavorite) favNet += challengeValue;

        if (!betOnFavorite) {
          myPickNet = Math.floor(amount * 2.5);
          if (pick === playerName) myPickNet += underdogPotBonus;
        }

        if (iAmNotFavorite) {
          iStealNet = underdogPotBonus;
          if (betOnFavorite) iStealNet -= amount;
          if (pick === playerName) iStealNet += Math.floor(amount * 2.5);
        }

        elseNet = betOnFavorite ? -amount : 0;
        if (iAmFavorite) elseNet -= challengeValue;

        nobodyNet = betOnFavorite ? -amount : 0;
        if (iAmFavorite) nobodyNet -= challengeValue;
      } else {
        if (iAmFavorite) { favNet = challengeValue; elseNet = -challengeValue; nobodyNet = -challengeValue; }
        if (iAmNotFavorite) iStealNet = underdogPotBonus;
      }

      let actualNet = null, actualLabel = null;
      if (isResolved && resolution) {
        const oc = resolution.outcomeType;
        if (oc === 'favorite') {
          actualNet = favNet;
          actualLabel = `${favorite} delivered`;
        } else if (oc === 'someone_else') {
          const ap = resolution.actualPerson;
          if (ap === playerName && iAmNotFavorite) {
            actualNet = iStealNet;
            actualLabel = 'You stole it!';
          } else if (ap === pick && !betOnFavorite) {
            actualNet = myPickNet;
            actualLabel = `${pick} stole it — your pick!`;
          } else {
            actualNet = elseNet;
            actualLabel = `${ap || 'Someone'} stole it`;
          }
        } else if (oc === 'nobody') {
          actualNet = nobodyNet;
          actualLabel = 'Nobody did it';
        }
      }

      const allNets = [favNet, myPickNet, iStealNet, elseNet, nobodyNet].filter(v => v !== null);
      const bestCase = Math.max(...allNets);
      const worstCase = Math.min(...allNets);

      return {
        question: q, index: qi, hasBet, pick, amount,
        favorite, pot, challengeValue, betOnFavorite,
        iAmFavorite, iAmNotFavorite, underdogPotBonus,
        isResolved, resolution, actualNet, actualLabel,
        favNet, myPickNet, iStealNet, elseNet, nobodyNet,
        bestCase, worstCase,
      };
    });
  }, [questions, playerBets, bets, players, favoriteOverrides, resolutions, playerName, config]);

  const dn = (p) => (nicknames[p] ? `${p} (${nicknames[p]})` : p);
  const fmt = (v) => (v > 0 ? `+${v}` : `${v}`);
  const clr = (v) => (v > 0 ? 'text-accent-green' : v < 0 ? 'text-accent-red' : 'text-gray-500');

  const withBets = analysis.filter(a => a.hasBet);
  const totalBet = withBets.reduce((s, a) => s + a.amount, 0);
  const resolved = analysis.filter(a => a.isResolved && a.actualNet !== null);
  const earnedSoFar = resolved.reduce((s, a) => s + a.actualNet, 0);

  const missions = analysis.filter(a => a.iAmFavorite && !a.isResolved);
  const stealOpps = analysis.filter(a => a.iAmNotFavorite && a.underdogPotBonus > 0 && !a.isResolved)
    .sort((a, b) => b.underdogPotBonus - a.underdogPotBonus);
  const deliveredMissions = analysis.filter(a => a.iAmFavorite && a.isResolved && a.resolution?.outcomeType === 'favorite');
  const chokedMissions = analysis.filter(a => a.iAmFavorite && a.isResolved && a.resolution?.outcomeType !== 'favorite');
  const stolenQuestions = analysis.filter(a => a.isResolved && a.resolution?.outcomeType === 'someone_else' && a.resolution?.actualPerson === playerName);

  const allMissionsCount = missions.length + deliveredMissions.length + chokedMissions.length;
  const allStealsCount = stealOpps.length + stolenQuestions.length;

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer">&larr; Home</button>
        <div className="flex gap-3">
          <button onClick={() => navigate('/market')} className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer">
            Odds Board <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/results')} className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer">
            Leaderboard <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        What's At Stake
      </h1>
      <p className="text-gray-500 text-sm mb-6">Your personal game plan — what to deliver, where to steal, and what's on the line.</p>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Wagered</div>
          <div className="text-lg font-black text-gold-400">{totalBet}</div>
          <div className="text-[10px] text-gray-600">of {config.totalBudget}</div>
        </div>
        <div className={`bg-dark-800 border rounded-xl p-3 text-center ${resolved.length > 0 ? (earnedSoFar >= 0 ? 'border-accent-green/30' : 'border-accent-red/30') : 'border-dark-600'}`}>
          <div className="text-[10px] text-gray-500 mb-0.5">{resolved.length > 0 ? 'Earned So Far' : 'Bets Placed'}</div>
          {resolved.length > 0 ? (
            <div className={`text-lg font-black ${clr(earnedSoFar)}`}>{fmt(earnedSoFar)}</div>
          ) : (
            <div className="text-lg font-black text-gray-300">{withBets.length}<span className="text-gray-600 text-sm">/{questions.length}</span></div>
          )}
          <div className="text-[10px] text-gray-600">{resolved.length > 0 ? `${resolved.length} resolved` : 'questions'}</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Your Roles</div>
          <div className="flex items-center justify-center gap-2">
            {allMissionsCount > 0 && (
              <span className="text-accent-green font-black text-sm flex items-center gap-0.5">
                <Crown className="w-3 h-3" />{allMissionsCount}
              </span>
            )}
            <span className="text-accent-purple font-black text-sm flex items-center gap-0.5">
              <Swords className="w-3 h-3" />{allStealsCount}
            </span>
          </div>
          <div className="text-[10px] text-gray-600">fav / steal opps</div>
        </div>
      </div>

      {/* ===== SECTION 1: MISSIONS ===== */}
      {allMissionsCount > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setMissionsOpen(!missionsOpen)}
            className="w-full flex items-center gap-2 mb-2 cursor-pointer group"
          >
            <Crown className="w-5 h-5 text-accent-green" />
            <h2 className="text-sm font-black text-accent-green uppercase tracking-wider flex-1 text-left">
              Your Missions ({allMissionsCount})
            </h2>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${missionsOpen ? 'rotate-180' : ''}`} />
          </button>

          {missionsOpen && (
            <div>
              <p className="text-xs text-gray-500 mb-3">The group picked you as most likely. Deliver and earn the pot bonus. Choke and lose it.</p>
              <div className="space-y-2">
                {missions.map(a => (
                  <div key={a.index} className="bg-dark-800 border border-accent-green/30 rounded-xl px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gold-500 mt-0.5 shrink-0">Q{a.index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 leading-relaxed">{a.question}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          <span className="text-gray-500">Pot: <span className="text-gold-400 font-bold">{a.pot}</span></span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-accent-green" />
                          <span className="text-accent-green font-black text-sm">+{a.challengeValue}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-accent-red" />
                          <span className="text-accent-red font-black text-sm">−{a.challengeValue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {deliveredMissions.map(a => (
                  <div key={a.index} className="bg-accent-green/10 border border-accent-green/20 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Check className="w-5 h-5 text-accent-green shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500">Q{a.index + 1}</span>
                      <span className="text-xs text-accent-green font-bold ml-2">Delivered!</span>
                    </div>
                    <span className="text-accent-green font-black text-sm">+{a.challengeValue}</span>
                  </div>
                ))}
                {chokedMissions.map(a => (
                  <div key={a.index} className="bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 flex items-center gap-3">
                    <X className="w-5 h-5 text-accent-red shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500">Q{a.index + 1}</span>
                      <span className="text-xs text-accent-red font-bold ml-2">
                        {a.resolution?.outcomeType === 'someone_else' ? `Got upset by ${a.resolution.actualPerson}` : 'Nobody did it — you choked'}
                      </span>
                    </div>
                    <span className="text-accent-red font-black text-sm">−{a.challengeValue}</span>
                  </div>
                ))}
              </div>
              {missions.length > 0 && (
                <div className="mt-3 bg-dark-700 rounded-lg px-3 py-2 text-center">
                  <span className="text-[11px] text-gray-400">
                    Total at stake: <span className="text-accent-green font-bold">+{missions.reduce((s, a) => s + a.challengeValue, 0)}</span> if you deliver all,{' '}
                    <span className="text-accent-red font-bold">−{missions.reduce((s, a) => s + a.challengeValue, 0)}</span> if you choke all
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== SECTION 2: STEAL OPPORTUNITIES ===== */}
      {allStealsCount > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setStealsOpen(!stealsOpen)}
            className="w-full flex items-center gap-2 mb-2 cursor-pointer group"
          >
            <Swords className="w-5 h-5 text-accent-purple" />
            <h2 className="text-sm font-black text-accent-purple uppercase tracking-wider flex-1 text-left">
              Steal Opportunities ({allStealsCount})
            </h2>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${stealsOpen ? 'rotate-180' : ''}`} />
          </button>

          {stealsOpen && (
            <div>
              <p className="text-xs text-gray-500 mb-3">You're not the favorite — but if YOU do it instead, you pocket 75% of the pot. Ranked by biggest payoff.</p>
              <div className="space-y-2">
                {stealOpps.map(a => (
                  <div key={a.index} className="bg-dark-800 border border-accent-purple/20 rounded-xl px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-bold text-gold-500 mt-0.5 shrink-0">Q{a.index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 leading-relaxed">{a.question}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          <span className="text-gray-500">Favorite: <span className="text-accent-green font-bold">{dn(a.favorite)}</span></span>
                          <span className="text-gray-500">Pot: <span className="text-gold-400 font-bold">{a.pot}</span></span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="bg-accent-purple/15 rounded-lg px-2.5 py-1.5 text-center">
                          <div className="text-accent-purple font-black text-sm">+{a.underdogPotBonus}</div>
                          <div className="text-[9px] text-accent-purple/60">if you steal</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {stolenQuestions.map(a => (
                  <div key={a.index} className="bg-accent-purple/10 border border-accent-purple/20 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Flame className="w-5 h-5 text-accent-purple shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-500">Q{a.index + 1}</span>
                      <span className="text-xs text-accent-purple font-bold ml-2">You stole it from {dn(a.favorite)}!</span>
                    </div>
                    <span className="text-accent-purple font-black text-sm">+{a.underdogPotBonus}</span>
                  </div>
                ))}
              </div>
              {stealOpps.length > 0 && (
                <div className="mt-3 bg-dark-700 rounded-lg px-3 py-2 text-center">
                  <span className="text-[11px] text-gray-400">
                    Max steal potential: <span className="text-accent-purple font-bold">+{stealOpps.reduce((s, a) => s + a.underdogPotBonus, 0)}</span> if you steal them all
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== SECTION 3: QUESTION BY QUESTION ===== */}
      <div className="mb-6">
        <button
          onClick={() => setQuestionsOpen(!questionsOpen)}
          className="w-full flex items-center gap-2 mb-2 cursor-pointer group"
        >
          <Target className="w-5 h-5 text-gold-400" />
          <h2 className="text-sm font-black text-gray-200 uppercase tracking-wider flex-1 text-left">
            All Bets — Question by Question ({withBets.length})
          </h2>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${questionsOpen ? 'rotate-180' : ''}`} />
        </button>

        {questionsOpen && (
          <div className="space-y-2">
            {analysis.map((a) => {
              const hasResult = a.isResolved && a.actualNet !== null;
              const isOpen = expandedQ === a.index;

              return (
                <div key={a.index} className={`bg-dark-800 border rounded-xl overflow-hidden ${hasResult ? 'border-accent-green/30' : 'border-dark-600'}`}>
                  {/* Collapsed row */}
                  <button
                    onClick={() => toggleQ(a.index)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left cursor-pointer hover:bg-dark-700/30 transition-colors"
                  >
                    <span className={`text-[10px] font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      hasResult
                        ? a.actualNet > 0 ? 'bg-accent-green/20 text-accent-green' : a.actualNet < 0 ? 'bg-accent-red/20 text-accent-red' : 'bg-dark-700 text-gray-500'
                        : 'bg-dark-700 text-gray-500'
                    }`}>
                      {hasResult ? <Check className="w-3 h-3" /> : a.index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      {a.hasBet ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${a.betOnFavorite ? 'text-accent-green' : 'text-accent-purple'}`}>{a.pick}</span>
                          <span className="text-[10px] text-gold-400 font-bold">{a.amount}pts</span>
                          {a.betOnFavorite
                            ? <span className="text-[9px] bg-accent-green/15 text-accent-green px-1.5 py-0.5 rounded font-bold">SAFE</span>
                            : <span className="text-[9px] bg-accent-purple/15 text-accent-purple px-1.5 py-0.5 rounded font-bold">UNDERDOG</span>
                          }
                          {a.iAmFavorite && <Crown className="w-3 h-3 text-accent-green" />}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-600 italic">No bet</span>
                      )}
                      {hasResult && <div className="text-[10px] text-gray-500 mt-0.5">{a.actualLabel}</div>}
                    </div>

                    <div className="shrink-0 text-right">
                      {hasResult ? (
                        <span className={`text-sm font-black ${clr(a.actualNet)}`}>{fmt(a.actualNet)}</span>
                      ) : a.hasBet ? (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-accent-red font-bold">{a.worstCase}</span>
                          <div className="w-8 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent-red to-accent-green rounded-full" />
                          </div>
                          <span className="text-accent-green font-bold">+{a.bestCase}</span>
                        </div>
                      ) : null}
                    </div>

                    <ChevronDown className={`w-4 h-4 text-gray-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Expanded analysis */}
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-dark-700">
                      <p className="text-sm text-gray-300 py-3 leading-relaxed">{a.question}</p>

                      {/* Role badges */}
                      {a.iAmFavorite && (
                        <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 rounded-lg px-3 py-2 mb-3">
                          <Crown className="w-4 h-4 text-accent-green shrink-0" />
                          <span className="text-xs font-bold text-accent-green flex-1">You're the Favorite</span>
                          <span className="text-xs"><span className="text-accent-green font-bold">+{a.challengeValue}</span> <span className="text-gray-600">/</span> <span className="text-accent-red font-bold">−{a.challengeValue}</span></span>
                        </div>
                      )}
                      {a.iAmNotFavorite && a.pot > 0 && (
                        <div className="flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/30 rounded-lg px-3 py-2 mb-3">
                          <Swords className="w-4 h-4 text-accent-purple shrink-0" />
                          <span className="text-xs font-bold text-accent-purple flex-1">Steal from {dn(a.favorite)}</span>
                          <span className="text-accent-purple font-bold text-xs">+{a.underdogPotBonus}</span>
                        </div>
                      )}

                      {/* Actual result banner */}
                      {hasResult && (
                        <div className={`rounded-lg px-3 py-2.5 mb-3 flex items-center justify-between ${
                          a.actualNet > 0 ? 'bg-accent-green/15 border border-accent-green/30' :
                          a.actualNet < 0 ? 'bg-accent-red/15 border border-accent-red/30' :
                          'bg-dark-700 border border-dark-600'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Check className={`w-4 h-4 ${a.actualNet >= 0 ? 'text-accent-green' : 'text-accent-red'}`} />
                            <span className="text-xs text-gray-300 font-medium">{a.actualLabel}</span>
                          </div>
                          <span className={`text-lg font-black ${clr(a.actualNet)}`}>{fmt(a.actualNet)}</span>
                        </div>
                      )}

                      {a.hasBet ? (
                        <>
                          {/* Bet info */}
                          <div className="flex items-center gap-3 mb-3 text-sm">
                            <span className="text-gray-500">Pick:</span>
                            <span className={`font-bold ${a.betOnFavorite ? 'text-accent-green' : 'text-accent-purple'}`}>{dn(a.pick)}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${a.betOnFavorite ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-purple/20 text-accent-purple'}`}>
                              {a.betOnFavorite ? 'FAV' : 'UNDERDOG'}
                            </span>
                            <span className="text-gold-400 font-bold ml-auto">{a.amount} pts</span>
                          </div>

                          {/* Scenario breakdown */}
                          <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-1.5">Every Scenario</div>
                          <div className="rounded-lg border border-dark-600 overflow-hidden divide-y divide-dark-700">
                            {/* Favorite delivers */}
                            <div className={`flex items-center gap-3 px-3 py-2.5 bg-dark-800 ${hasResult && a.resolution?.outcomeType === 'favorite' ? 'ring-1 ring-inset ring-accent-green/50' : ''}`}>
                              <Crown className="w-3.5 h-3.5 text-accent-green shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-300">{a.favorite ? dn(a.favorite) : '—'} delivers</div>
                                <div className="text-[10px] text-gray-600">
                                  {a.betOnFavorite ? `${a.amount} × 1.5 = ${Math.floor(a.amount * 1.5)}` : 'No effect on bet'}
                                  {a.iAmFavorite ? ` + ${a.challengeValue} pot bonus` : ''}
                                </div>
                              </div>
                              <span className={`text-sm font-black shrink-0 ${clr(a.favNet)}`}>{a.favNet === 0 ? '—' : fmt(a.favNet)}</span>
                              {hasResult && a.resolution?.outcomeType === 'favorite' && <Check className="w-3.5 h-3.5 text-accent-green shrink-0" />}
                            </div>

                            {/* YOU steal it */}
                            {a.iStealNet !== null && (
                              <div className={`flex items-center gap-3 px-3 py-2.5 bg-accent-purple/5 ${hasResult && a.actualLabel === 'You stole it!' ? 'ring-1 ring-inset ring-accent-purple/50' : ''}`}>
                                <Swords className="w-3.5 h-3.5 text-accent-purple shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-accent-purple">YOU steal it</div>
                                  <div className="text-[10px] text-gray-600">
                                    +{Math.floor(a.pot * 0.75)} pot
                                    {a.pick === playerName ? ` + ${Math.floor(a.amount * 2.5)} bet (×2.5)` : ''}
                                    {a.betOnFavorite ? ` − ${a.amount} lost bet` : ''}
                                  </div>
                                </div>
                                <span className={`text-sm font-black shrink-0 ${clr(a.iStealNet)}`}>{fmt(a.iStealNet)}</span>
                                {hasResult && a.actualLabel === 'You stole it!' && <Check className="w-3.5 h-3.5 text-accent-purple shrink-0" />}
                              </div>
                            )}

                            {/* Your pick steals (if underdog and not self) */}
                            {a.myPickNet !== null && a.pick !== playerName && (
                              <div className={`flex items-center gap-3 px-3 py-2.5 bg-dark-800 ${hasResult && a.resolution?.outcomeType === 'someone_else' && a.resolution?.actualPerson === a.pick ? 'ring-1 ring-inset ring-accent-purple/50' : ''}`}>
                                <Zap className="w-3.5 h-3.5 text-accent-purple shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium text-gray-300">{dn(a.pick)} steals it</div>
                                  <div className="text-[10px] text-gray-600">{a.amount} × 2.5 = {Math.floor(a.amount * 2.5)}</div>
                                </div>
                                <span className={`text-sm font-black shrink-0 ${clr(a.myPickNet)}`}>{fmt(a.myPickNet)}</span>
                                {hasResult && a.resolution?.outcomeType === 'someone_else' && a.resolution?.actualPerson === a.pick && <Check className="w-3.5 h-3.5 text-accent-green shrink-0" />}
                              </div>
                            )}

                            {/* Someone else steals */}
                            <div className={`flex items-center gap-3 px-3 py-2.5 bg-dark-800 ${hasResult && a.resolution?.outcomeType === 'someone_else' && a.actualNet === a.elseNet && a.actualLabel !== 'You stole it!' ? 'ring-1 ring-inset ring-accent-red/50' : ''}`}>
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-300">{a.betOnFavorite ? 'Someone else steals it' : 'Wrong underdog wins'}</div>
                                <div className="text-[10px] text-gray-600">
                                  {a.betOnFavorite ? `−${a.amount} lost bet` : 'No effect on bet'}
                                  {a.iAmFavorite ? ` − ${a.challengeValue} pot penalty` : ''}
                                </div>
                              </div>
                              <span className={`text-sm font-black shrink-0 ${clr(a.elseNet)}`}>{a.elseNet === 0 ? '—' : fmt(a.elseNet)}</span>
                            </div>

                            {/* Nobody */}
                            <div className={`flex items-center gap-3 px-3 py-2.5 bg-dark-800 ${hasResult && a.resolution?.outcomeType === 'nobody' ? 'ring-1 ring-inset ring-yellow-400/50' : ''}`}>
                              <Minus className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-300">Nobody does it</div>
                                <div className="text-[10px] text-gray-600">
                                  {a.betOnFavorite ? `−${a.amount} lost bet` : 'No effect on bet'}
                                  {a.iAmFavorite ? ` − ${a.challengeValue} pot penalty` : ''}
                                </div>
                              </div>
                              <span className={`text-sm font-black shrink-0 ${clr(a.nobodyNet)}`}>{a.nobodyNet === 0 ? '—' : fmt(a.nobodyNet)}</span>
                            </div>
                          </div>

                          {/* Range bar */}
                          <div className="mt-3 flex items-center gap-2 text-[11px]">
                            <span className="text-accent-red font-bold w-10 text-right">{fmt(a.worstCase)}</span>
                            <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden relative">
                              {a.worstCase < 0 && a.bestCase > 0 && (
                                <div className="absolute top-0 bottom-0 w-px bg-gray-500 z-10"
                                  style={{ left: `${(Math.abs(a.worstCase) / (a.bestCase - a.worstCase)) * 100}%` }}
                                />
                              )}
                              <div className="h-full bg-gradient-to-r from-accent-red via-yellow-400 to-accent-green rounded-full" />
                            </div>
                            <span className="text-accent-green font-bold w-10">{fmt(a.bestCase)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-600 italic">
                          No bet placed — {a.iAmFavorite ? 'but you\'re still the favorite with stakes above' : a.iAmNotFavorite ? 'steal opportunity still applies during the trip' : 'no exposure'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/market')} className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 text-gray-200 font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer">
          The Odds Board
        </button>
        <button onClick={() => navigate('/results')} className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer">
          Who's Winning?
        </button>
      </div>
    </div>
  );
}
