import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { calculateFavorite } from '../utils/scoring';
import {
  Crown, ChevronRight, TrendingUp, TrendingDown,
  Zap, Target, Swords, Check, X, Minus, Shield, Flame,
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

      // Net calculations per outcome
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

      // Actual result
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

      return {
        question: q, index: qi, hasBet, pick, amount,
        favorite, pot, challengeValue, betOnFavorite,
        iAmFavorite, iAmNotFavorite, underdogPotBonus,
        isResolved, resolution, actualNet, actualLabel,
        favNet, myPickNet, iStealNet, elseNet, nobodyNet,
      };
    });
  }, [questions, playerBets, bets, players, favoriteOverrides, resolutions, playerName, config]);

  const dn = (p) => (nicknames[p] ? `${p} (${nicknames[p]})` : p);
  const fmt = (v) => (v > 0 ? `+${v}` : `${v}`);
  const clr = (v) => (v > 0 ? 'text-accent-green' : v < 0 ? 'text-accent-red' : 'text-gray-500');

  // Derived data
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

      {/* ==================== SECTION 1: OVERALL SUMMARY ==================== */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Wagered</div>
          <div className="text-lg font-black text-gold-400">{totalBet}</div>
          <div className="text-[10px] text-gray-600">of {config.totalBudget}</div>
        </div>
        <div className={`bg-dark-800 border rounded-xl p-3 text-center ${resolved.length > 0 ? (earnedSoFar >= 0 ? 'border-accent-green/30' : 'border-accent-red/30') : 'border-dark-600'}`}>
          <div className="text-[10px] text-gray-500 mb-0.5">{resolved.length > 0 ? 'Earned So Far' : 'Questions'}</div>
          {resolved.length > 0 ? (
            <div className={`text-lg font-black ${clr(earnedSoFar)}`}>{fmt(earnedSoFar)}</div>
          ) : (
            <div className="text-lg font-black text-gray-300">{withBets.length}<span className="text-gray-600 text-sm">/{questions.length}</span></div>
          )}
          <div className="text-[10px] text-gray-600">{resolved.length > 0 ? `${resolved.length} resolved` : 'bets placed'}</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Your Roles</div>
          <div className="flex items-center justify-center gap-2">
            {missions.length + deliveredMissions.length + chokedMissions.length > 0 && (
              <span className="text-accent-green font-black text-sm flex items-center gap-0.5">
                <Crown className="w-3 h-3" />{missions.length + deliveredMissions.length + chokedMissions.length}
              </span>
            )}
            <span className="text-accent-purple font-black text-sm flex items-center gap-0.5">
              <Swords className="w-3 h-3" />{stealOpps.length + stolenQuestions.length}
            </span>
          </div>
          <div className="text-[10px] text-gray-600">fav / steal opps</div>
        </div>
      </div>

      {/* ==================== SECTION 2: MISSIONS TO DELIVER ==================== */}
      {(missions.length > 0 || deliveredMissions.length > 0 || chokedMissions.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-accent-green" />
            <h2 className="text-sm font-black text-accent-green uppercase tracking-wider">Your Missions — Deliver or Get Humbled</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">The group picked you as most likely. Deliver and earn the pot bonus. Choke and lose it.</p>

          <div className="space-y-2">
            {/* Pending missions */}
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
                  <div className="shrink-0 text-right">
                    <div className="flex flex-col items-end gap-1">
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
              </div>
            ))}

            {/* Delivered missions */}
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

            {/* Choked missions */}
            {chokedMissions.map(a => (
              <div key={a.index} className="bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 flex items-center gap-3">
                <X className="w-5 h-5 text-accent-red shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-500">Q{a.index + 1}</span>
                  <span className="text-xs text-accent-red font-bold ml-2">
                    {a.resolution?.outcomeType === 'someone_else'
                      ? `Got upset by ${a.resolution.actualPerson}`
                      : 'Nobody did it — you choked'}
                  </span>
                </div>
                <span className="text-accent-red font-black text-sm">−{a.challengeValue}</span>
              </div>
            ))}
          </div>

          {missions.length > 0 && (
            <div className="mt-3 bg-dark-700 rounded-lg px-3 py-2 text-center">
              <span className="text-[11px] text-gray-400">
                Total at stake as favorite: <span className="text-accent-green font-bold">+{missions.reduce((s, a) => s + a.challengeValue, 0)}</span> if you deliver all,{' '}
                <span className="text-accent-red font-bold">−{missions.reduce((s, a) => s + a.challengeValue, 0)}</span> if you choke all
              </span>
            </div>
          )}
        </div>
      )}

      {/* ==================== SECTION 3: STEAL OPPORTUNITIES ==================== */}
      {(stealOpps.length > 0 || stolenQuestions.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Swords className="w-5 h-5 text-accent-purple" />
            <h2 className="text-sm font-black text-accent-purple uppercase tracking-wider">Steal Opportunities — Be the Underdog</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">You're not the favorite here — but if YOU end up doing it, you pocket 75% of the pot. Ranked by biggest payoff.</p>

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

      {/* ==================== SECTION 4: QUESTION BY QUESTION ==================== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-gold-400" />
          <h2 className="text-sm font-black text-gray-200 uppercase tracking-wider">All Bets — Question by Question</h2>
        </div>

        <div className="rounded-xl border border-dark-600 overflow-hidden divide-y divide-dark-700">
          {analysis.map((a) => {
            const hasResult = a.isResolved && a.actualNet !== null;

            return (
              <div key={a.index} className={`${hasResult ? 'bg-dark-800/80' : 'bg-dark-800'}`}>
                {/* Main row */}
                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Q number */}
                  <span className={`text-[10px] font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    hasResult
                      ? a.actualNet > 0 ? 'bg-accent-green/20 text-accent-green' : a.actualNet < 0 ? 'bg-accent-red/20 text-accent-red' : 'bg-dark-700 text-gray-500'
                      : 'bg-dark-700 text-gray-500'
                  }`}>
                    {hasResult ? <Check className="w-3 h-3" /> : a.index + 1}
                  </span>

                  {/* Bet details */}
                  <div className="flex-1 min-w-0">
                    {a.hasBet ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${a.betOnFavorite ? 'text-accent-green' : 'text-accent-purple'}`}>
                          {a.pick}
                        </span>
                        <span className="text-[10px] text-gold-400 font-bold">{a.amount}pts</span>
                        {a.betOnFavorite ? (
                          <span className="text-[9px] bg-accent-green/15 text-accent-green px-1.5 py-0.5 rounded font-bold">SAFE</span>
                        ) : (
                          <span className="text-[9px] bg-accent-purple/15 text-accent-purple px-1.5 py-0.5 rounded font-bold">UNDERDOG</span>
                        )}
                        {a.iAmFavorite && <Crown className="w-3 h-3 text-accent-green" />}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-600 italic">No bet</span>
                    )}
                    {hasResult && (
                      <div className="text-[10px] text-gray-500 mt-0.5">{a.actualLabel}</div>
                    )}
                  </div>

                  {/* Outcome: resolved or potential */}
                  <div className="shrink-0 text-right">
                    {hasResult ? (
                      <span className={`text-sm font-black ${clr(a.actualNet)}`}>{fmt(a.actualNet)}</span>
                    ) : a.hasBet ? (
                      <div className="flex items-center gap-2 text-[11px]">
                        {a.betOnFavorite ? (
                          <>
                            <span className="text-accent-green font-bold">{fmt(a.favNet)}</span>
                            <span className="text-gray-600">/</span>
                            <span className="text-accent-red font-bold">{a.nobodyNet}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-accent-green font-bold">{fmt(a.myPickNet !== null ? a.myPickNet : 0)}</span>
                            <span className="text-gray-600">/</span>
                            <span className="text-gray-500">0</span>
                          </>
                        )}
                      </div>
                    ) : a.iAmFavorite ? (
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-accent-green font-bold">+{a.challengeValue}</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-accent-red font-bold">−{a.challengeValue}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/market')}
          className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 text-gray-200 font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer"
        >
          The Odds Board
        </button>
        <button
          onClick={() => navigate('/results')}
          className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-3 px-6 rounded-xl text-sm transition-all cursor-pointer"
        >
          Who's Winning?
        </button>
      </div>
    </div>
  );
}
