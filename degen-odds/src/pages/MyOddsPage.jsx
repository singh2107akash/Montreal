import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { calculateFavorite } from '../utils/scoring';
import {
  Crown, ChevronRight, ChevronDown, TrendingUp, TrendingDown,
  Zap, Target, Swords, Check, Minus, AlertTriangle,
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

      const iAmFavorite = playerName === favorite;
      const iAmNotFavorite = favorite && playerName !== favorite;
      const underdogPotBonus = Math.floor(pot * 0.75);

      if (!bet || !bet.pick || !bet.amount) {
        return {
          question: q, index: qi, hasBet: false, isResolved, resolution,
          favorite, pot, challengeValue, iAmFavorite, iAmNotFavorite,
          underdogPotBonus,
        };
      }

      const pick = bet.pick;
      const amount = bet.amount;
      const betOnFavorite = pick === favorite;

      // === SCENARIOS ===

      // 1. Favorite delivers
      let favNet = betOnFavorite ? Math.floor(amount * 1.5) : 0;
      if (iAmFavorite) favNet += challengeValue;

      // 2. My pick delivers (underdog) — only if pick ≠ favorite
      let myPickNet = null;
      if (!betOnFavorite) {
        myPickNet = Math.floor(amount * 2.5);
        if (pick === playerName) myPickNet += underdogPotBonus;
      }

      // 3. I steal it (only if not favorite)
      let iStealNet = null;
      if (iAmNotFavorite) {
        iStealNet = underdogPotBonus;
        if (betOnFavorite) iStealNet -= amount;
        if (pick === playerName) iStealNet += Math.floor(amount * 2.5);
      }

      // 4. Someone else steals (not fav, not pick, not me)
      let elseNet = betOnFavorite ? -amount : 0;
      if (iAmFavorite) elseNet -= challengeValue;

      // 5. Nobody does it
      let nobodyNet = betOnFavorite ? -amount : 0;
      if (iAmFavorite) nobodyNet -= challengeValue;

      // Best / worst
      const allNets = [favNet, myPickNet, iStealNet, elseNet, nobodyNet].filter(v => v !== null);
      const bestCase = Math.max(...allNets);
      const worstCase = Math.min(...allNets);

      // Actual result
      let actualNet = null;
      let actualLabel = null;
      if (isResolved && resolution) {
        const oc = resolution.outcomeType;
        if (oc === 'favorite') {
          actualNet = favNet;
          actualLabel = `${favorite || 'Favorite'} delivered`;
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
        question: q, index: qi, hasBet: true,
        pick, amount, favorite, pot, challengeValue,
        betOnFavorite, iAmFavorite, iAmNotFavorite,
        isResolved, resolution, underdogPotBonus,
        favNet, myPickNet, iStealNet, elseNet, nobodyNet,
        bestCase, worstCase, actualNet, actualLabel,
      };
    });
  }, [questions, playerBets, bets, players, favoriteOverrides, resolutions, playerName, config]);

  const displayName = (p) => (nicknames[p] ? `${p} (${nicknames[p]})` : p);

  const fmt = (val) => (val > 0 ? `+${val}` : `${val}`);
  const clr = (val) => (val > 0 ? 'text-accent-green' : val < 0 ? 'text-accent-red' : 'text-gray-500');

  // Summary stats
  const withBets = analysis.filter(a => a.hasBet);
  const totalBet = withBets.reduce((s, a) => s + (a.amount || 0), 0);
  const maxUpside = withBets.reduce((s, a) => s + (a.bestCase || 0), 0);
  const maxDownside = withBets.reduce((s, a) => s + (a.worstCase || 0), 0);
  const favoriteCount = analysis.filter(a => a.iAmFavorite).length;
  const betOnFavCount = withBets.filter(a => a.betOnFavorite).length;
  const underdogCount = withBets.filter(a => !a.betOnFavorite).length;
  const resolvedWithBets = withBets.filter(a => a.isResolved && a.actualNet !== null);
  const earnedSoFar = resolvedWithBets.reduce((s, a) => s + a.actualNet, 0);

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gold-400 text-sm transition-colors cursor-pointer">
          &larr; Home
        </button>
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
      <p className="text-gray-500 text-sm mb-6">
        Tap any question to see every way it can play out.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
          <div className="text-[10px] text-gray-500 mb-0.5">Wagered</div>
          <div className="text-xl font-black text-gold-400">{totalBet}<span className="text-sm text-gray-600">/{config.totalBudget}</span></div>
        </div>
        {resolvedWithBets.length > 0 ? (
          <div className={`bg-dark-800 border rounded-xl p-3 text-center ${earnedSoFar >= 0 ? 'border-accent-green/30' : 'border-accent-red/30'}`}>
            <div className="text-[10px] text-gray-500 mb-0.5">Earned So Far</div>
            <div className={`text-xl font-black ${clr(earnedSoFar)}`}>{fmt(earnedSoFar)}</div>
          </div>
        ) : (
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
            <div className="text-[10px] text-gray-500 mb-0.5">Potential Range</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-black text-accent-red">{maxDownside}</span>
              <span className="text-gray-600 text-xs">to</span>
              <span className="text-sm font-black text-accent-green">+{maxUpside}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bet profile pills */}
      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        <span className="bg-accent-green/10 border border-accent-green/20 rounded-full px-3 py-1 text-accent-green flex items-center gap-1">
          <Crown className="w-3 h-3" /> {betOnFavCount} safe
        </span>
        <span className="bg-accent-purple/10 border border-accent-purple/20 rounded-full px-3 py-1 text-accent-purple flex items-center gap-1">
          <Zap className="w-3 h-3" /> {underdogCount} underdog
        </span>
        {favoriteCount > 0 && (
          <span className="bg-accent-green/10 border border-accent-green/20 rounded-full px-3 py-1 text-accent-green flex items-center gap-1">
            <Target className="w-3 h-3" /> Favorite {favoriteCount}x
          </span>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-2">
        {analysis.map((a) => {
          const isOpen = expandedQ === a.index;
          const hasResult = a.isResolved && a.actualNet !== null;

          return (
            <div
              key={a.index}
              className={`bg-dark-800 border rounded-xl overflow-hidden transition-colors ${
                hasResult ? 'border-accent-green/30' : 'border-dark-600'
              }`}
            >
              {/* Collapsed row — always visible */}
              <button
                onClick={() => toggleQ(a.index)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left cursor-pointer hover:bg-dark-700/30 transition-colors"
              >
                {/* Q number */}
                <span className={`text-xs font-bold shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                  hasResult ? 'bg-accent-green/20 text-accent-green' : 'bg-dark-700 text-gray-500'
                }`}>
                  {hasResult ? <Check className="w-3.5 h-3.5" /> : a.index + 1}
                </span>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 truncate">{a.question}</p>
                  {a.hasBet ? (
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold ${a.betOnFavorite ? 'text-accent-green' : 'text-accent-purple'}`}>
                        {a.pick}
                      </span>
                      <span className="text-[10px] text-gold-400 font-bold">{a.amount}pts</span>
                      {a.iAmFavorite && (
                        <span className="text-[9px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded font-bold">FAV</span>
                      )}
                      {a.iAmNotFavorite && a.underdogPotBonus > 0 && (
                        <span className="text-[9px] bg-accent-purple/15 text-accent-purple/80 px-1.5 py-0.5 rounded font-medium">
                          steal +{a.underdogPotBonus}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-600 mt-0.5 italic">No bet placed</div>
                  )}
                </div>

                {/* Right side: result or range */}
                <div className="shrink-0 text-right">
                  {hasResult ? (
                    <div className={`text-lg font-black ${clr(a.actualNet)}`}>{fmt(a.actualNet)}</div>
                  ) : a.hasBet ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-accent-red font-bold">{a.worstCase}</span>
                        <div className="w-10 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent-red to-accent-green rounded-full" style={{ width: '100%' }} />
                        </div>
                        <span className="text-accent-green font-bold">+{a.bestCase}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-600 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-dark-700">
                  {/* Full question text */}
                  <p className="text-sm text-gray-300 py-3 leading-relaxed">{a.question}</p>

                  {/* Role badges */}
                  {a.iAmFavorite && (
                    <div className="flex items-center gap-2 bg-accent-green/10 border border-accent-green/30 rounded-lg px-3 py-2 mb-3">
                      <Crown className="w-4 h-4 text-accent-green shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-accent-green">You're the Favorite</span>
                        <span className="text-[10px] text-gray-500 ml-2">Pot: {a.pot}pts</span>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="text-accent-green font-bold">+{a.challengeValue}</span>
                        <span className="text-gray-600 mx-1">/</span>
                        <span className="text-accent-red font-bold">−{a.challengeValue}</span>
                      </div>
                    </div>
                  )}

                  {a.iAmNotFavorite && a.pot > 0 && (
                    <div className="flex items-center gap-2 bg-accent-purple/10 border border-accent-purple/30 rounded-lg px-3 py-2 mb-3">
                      <Swords className="w-4 h-4 text-accent-purple shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-accent-purple">Steal Opportunity</span>
                        <span className="text-[10px] text-gray-500 ml-2">vs {a.favorite}</span>
                      </div>
                      <span className="text-accent-purple font-bold text-sm">+{a.underdogPotBonus}</span>
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
                        <span className="text-gray-500">Your pick:</span>
                        <span className={`font-bold ${a.betOnFavorite ? 'text-accent-green' : 'text-accent-purple'}`}>
                          {displayName(a.pick)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          a.betOnFavorite ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-purple/20 text-accent-purple'
                        }`}>
                          {a.betOnFavorite ? 'FAV' : 'UNDERDOG'}
                        </span>
                        <span className="text-gold-400 font-bold ml-auto">{a.amount} pts</span>
                      </div>

                      {/* Scenario table */}
                      <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-1.5">What could happen</div>
                      <div className="rounded-lg border border-dark-600 overflow-hidden divide-y divide-dark-700">
                        {/* Row: Favorite delivers */}
                        <ScenarioRow
                          icon={<Crown className="w-3.5 h-3.5 text-accent-green" />}
                          label={`${a.favorite || '—'} delivers`}
                          sublabel={a.betOnFavorite ? `${a.amount} × 1.5${a.iAmFavorite ? ' + pot bonus' : ''}` : a.iAmFavorite ? 'pot bonus' : null}
                          net={a.favNet}
                          isActual={hasResult && a.actualNet === a.favNet && a.resolution?.outcomeType === 'favorite'}
                          fmt={fmt} clr={clr}
                        />

                        {/* Row: You steal it */}
                        {a.iStealNet !== null && (
                          <ScenarioRow
                            icon={<Swords className="w-3.5 h-3.5 text-accent-purple" />}
                            label="YOU steal it"
                            sublabel={`75% pot${a.pick === playerName ? ' + 2.5× bet' : ''}${a.betOnFavorite ? ' − lost bet' : ''}`}
                            net={a.iStealNet}
                            highlight="purple"
                            isActual={hasResult && a.actualLabel === 'You stole it!'}
                            fmt={fmt} clr={clr}
                          />
                        )}

                        {/* Row: Your pick steals it (if underdog and not self) */}
                        {a.myPickNet !== null && a.pick !== playerName && (
                          <ScenarioRow
                            icon={<Zap className="w-3.5 h-3.5 text-accent-purple" />}
                            label={`${a.pick} steals it`}
                            sublabel={`${a.amount} × 2.5`}
                            net={a.myPickNet}
                            isActual={hasResult && a.resolution?.outcomeType === 'someone_else' && a.resolution?.actualPerson === a.pick}
                            fmt={fmt} clr={clr}
                          />
                        )}

                        {/* Row: Someone else steals */}
                        <ScenarioRow
                          icon={<AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />}
                          label={a.betOnFavorite ? 'Someone else steals it' : 'Wrong underdog wins'}
                          sublabel={a.betOnFavorite ? `−${a.amount} lost bet${a.iAmFavorite ? ' − pot penalty' : ''}` : a.iAmFavorite ? 'pot penalty' : null}
                          net={a.elseNet}
                          isActual={hasResult && a.resolution?.outcomeType === 'someone_else' && a.actualNet === a.elseNet && a.actualLabel !== 'You stole it!'}
                          fmt={fmt} clr={clr}
                        />

                        {/* Row: Nobody */}
                        <ScenarioRow
                          icon={<Minus className="w-3.5 h-3.5 text-gray-500" />}
                          label="Nobody does it"
                          sublabel={a.betOnFavorite ? `−${a.amount} lost bet${a.iAmFavorite ? ' − pot penalty' : ''}` : a.iAmFavorite ? 'pot penalty' : null}
                          net={a.nobodyNet}
                          isActual={hasResult && a.resolution?.outcomeType === 'nobody'}
                          fmt={fmt} clr={clr}
                        />
                      </div>

                      {/* Range bar */}
                      <div className="mt-3 flex items-center gap-2 text-[11px]">
                        <span className="text-accent-red font-bold w-10 text-right">{fmt(a.worstCase)}</span>
                        <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden relative">
                          {a.worstCase < 0 && a.bestCase > 0 && (
                            <div
                              className="absolute top-0 bottom-0 w-px bg-gray-500 z-10"
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

function ScenarioRow({ icon, label, sublabel, net, highlight, isActual, fmt, clr }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 ${
      isActual ? 'bg-accent-green/10' :
      highlight === 'purple' ? 'bg-accent-purple/5' : 'bg-dark-800'
    }`}>
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium ${isActual ? 'text-gray-200' : 'text-gray-400'}`}>{label}</div>
        {sublabel && <div className="text-[10px] text-gray-600">{sublabel}</div>}
      </div>
      <div className={`text-sm font-black shrink-0 ${net === 0 ? 'text-gray-600' : clr(net)}`}>
        {net === 0 ? '—' : fmt(net)}
      </div>
      {isActual && <Check className="w-3.5 h-3.5 text-accent-green shrink-0" />}
    </div>
  );
}
