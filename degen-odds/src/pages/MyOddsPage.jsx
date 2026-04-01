import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { calculateFavorite } from '../utils/scoring';
import { Crown, ChevronRight, TrendingUp, TrendingDown, Minus, Zap, Target, AlertTriangle, ArrowUpRight, ArrowDownRight, Flame, Swords } from 'lucide-react';

export default function MyOddsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;
  const {
    players, questions, bets, lockedPlayers, nicknames,
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

      const iAmFavorite = playerName === favorite;
      const iAmNotFavorite = favorite && playerName !== favorite;
      const underdogPotBonus = Math.floor(pot * 0.75);

      // === YOUR ROLE STAKES (independent of betting) ===
      // As favorite: you win challengeValue if you deliver, lose it if you don't
      let favoriteStakes = null;
      if (iAmFavorite && favorite) {
        favoriteStakes = {
          deliver: challengeValue,
          choke: -challengeValue,
        };
      }

      // As potential underdog: if YOU steal it, you get 75% pot
      let underdogStakes = null;
      if (iAmNotFavorite && pot > 0) {
        underdogStakes = {
          stealBonus: underdogPotBonus,
          favPenalty: challengeValue, // what the favorite loses
        };
      }

      if (!bet || !bet.pick || !bet.amount) {
        return {
          question: q, index: qi, hasBet: false, isResolved,
          favorite, pot, challengeValue, iAmFavorite, iAmNotFavorite,
          favoriteStakes, underdogStakes,
        };
      }

      const pick = bet.pick;
      const amount = bet.amount;
      const betOnFavorite = pick === favorite;

      // === BETTING SCENARIOS (what happens to your wager) ===

      // Scenario 1: Favorite delivers
      let favoriteDelivers;
      if (betOnFavorite) {
        let total = Math.floor(amount * 1.5);
        if (iAmFavorite) total += challengeValue;
        favoriteDelivers = { net: total, label: 'You bet right', type: 'win' };
      } else {
        let total = 0;
        if (iAmFavorite) total += challengeValue;
        favoriteDelivers = { net: total, label: iAmFavorite ? 'You deliver as favorite' : 'No effect on your bet', type: total > 0 ? 'win' : 'neutral' };
      }

      // Scenario 2: My pick delivers (underdog steals it) — only if pick ≠ favorite
      let myPickDelivers = null;
      if (!betOnFavorite) {
        let total = Math.floor(amount * 2.5);
        if (pick === playerName) {
          total += underdogPotBonus;
        }
        myPickDelivers = { net: total, label: pick === playerName ? 'You steal it + 75% pot' : `${pick} steals it`, type: 'win' };
      }

      // Scenario 3: I steal it myself (regardless of who I bet on) — only if I'm not the favorite
      let iStealIt = null;
      if (iAmNotFavorite) {
        let total = underdogPotBonus; // 75% pot for being the underdog who did it
        // Also factor in bet outcome: if I bet on favorite, I lose it (favorite got upset)
        if (betOnFavorite) {
          total -= amount;
        }
        // If I bet on myself, I also get 2.5x bet
        if (pick === playerName) {
          total += Math.floor(amount * 2.5);
        }
        // If I bet on someone else (not favorite, not me), bet has no effect
        iStealIt = { net: total, type: 'win' };
      }

      // Scenario 4: Someone else steals it (not favorite, not my pick, not me)
      let someoneElseDelivers;
      if (betOnFavorite) {
        let total = -amount;
        if (iAmFavorite) total -= challengeValue;
        someoneElseDelivers = { net: total, label: iAmFavorite ? 'You get upset + lose bet' : 'Your pick gets upset', type: 'loss' };
      } else {
        let total = 0;
        if (iAmFavorite) total -= challengeValue;
        someoneElseDelivers = { net: total, label: iAmFavorite ? 'You get upset as favorite' : 'Wrong underdog pick', type: iAmFavorite ? 'loss' : 'neutral' };
      }

      // Scenario 5: Nobody does it
      let nobodyDoesIt;
      if (betOnFavorite) {
        let total = -amount;
        if (iAmFavorite) total -= challengeValue;
        nobodyDoesIt = { net: total, label: iAmFavorite ? 'You choke + lose bet' : 'Favorite chokes, you lose bet', type: 'loss' };
      } else {
        let total = 0;
        if (iAmFavorite) total -= challengeValue;
        nobodyDoesIt = { net: total, label: iAmFavorite ? 'You choke as favorite' : 'No impact on bet', type: iAmFavorite ? 'loss' : 'neutral' };
      }

      // Actual result if resolved
      let actualResult = null;
      if (isResolved && resolution) {
        const oc = resolution.outcomeType;
        if (oc === 'favorite') {
          actualResult = favoriteDelivers;
        } else if (oc === 'someone_else') {
          if (resolution.actualPerson === playerName && iAmNotFavorite) {
            actualResult = iStealIt;
          } else if (resolution.actualPerson === pick && !betOnFavorite) {
            actualResult = myPickDelivers;
          } else {
            actualResult = someoneElseDelivers;
          }
        } else if (oc === 'nobody') {
          actualResult = nobodyDoesIt;
        }
      }

      // Best and worst case (include iStealIt in calculations)
      const allScenarios = [favoriteDelivers, myPickDelivers, iStealIt, someoneElseDelivers, nobodyDoesIt].filter(Boolean);
      const bestCase = Math.max(...allScenarios.map(s => s.net));
      const worstCase = Math.min(...allScenarios.map(s => s.net));

      return {
        question: q,
        index: qi,
        hasBet: true,
        pick,
        amount,
        favorite,
        pot,
        challengeValue,
        betOnFavorite,
        iAmFavorite,
        iAmNotFavorite,
        isResolved,
        favoriteStakes,
        underdogStakes,
        iStealIt,
        favoriteDelivers,
        myPickDelivers,
        someoneElseDelivers,
        nobodyDoesIt,
        actualResult,
        bestCase,
        worstCase,
      };
    });
  }, [questions, playerBets, bets, players, favoriteOverrides, resolutions, playerName, config]);

  const displayName = (p) => (nicknames[p] ? `${p} (${nicknames[p]})` : p);

  // Summary stats
  const totalBet = analysis.filter(a => a.hasBet).reduce((sum, a) => sum + (a.amount || 0), 0);
  const maxUpside = analysis.filter(a => a.hasBet).reduce((sum, a) => sum + (a.bestCase || 0), 0);
  const maxDownside = analysis.filter(a => a.hasBet).reduce((sum, a) => sum + (a.worstCase || 0), 0);
  const favoriteCount = analysis.filter(a => a.iAmFavorite).length;
  const betOnFavoriteCount = analysis.filter(a => a.hasBet && a.betOnFavorite).length;
  const underdogBetCount = analysis.filter(a => a.hasBet && !a.betOnFavorite).length;

  const formatNet = (val) => {
    if (val > 0) return `+${val}`;
    return `${val}`;
  };

  const netColor = (val) => {
    if (val > 0) return 'text-accent-green';
    if (val < 0) return 'text-accent-red';
    return 'text-gray-500';
  };

  const netBg = (type) => {
    if (type === 'win') return 'bg-accent-green/10 border-accent-green/20';
    if (type === 'loss') return 'bg-accent-red/10 border-accent-red/20';
    return 'bg-dark-700 border-dark-600';
  };

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
            onClick={() => navigate('/market')}
            className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            The Odds Board <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/results')}
            className="text-gold-400 hover:text-gold-500 text-sm font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            Who's Winning <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
        What's At Stake
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        Every bet you placed. Every scenario. Every way this can go right — or blow up in your face.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Wagered</div>
          <div className="text-xl font-black text-gold-400">{totalBet}</div>
          <div className="text-[10px] text-gray-600">of {config.totalBudget} pts</div>
        </div>
        <div className="bg-dark-800 border border-accent-green/20 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Best Case</div>
          <div className="text-xl font-black text-accent-green">+{maxUpside}</div>
          <div className="text-[10px] text-gray-600">if everything hits</div>
        </div>
        <div className="bg-dark-800 border border-accent-red/20 rounded-xl p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Worst Case</div>
          <div className="text-xl font-black text-accent-red">{maxDownside}</div>
          <div className="text-[10px] text-gray-600">if everything tanks</div>
        </div>
      </div>

      {/* Bet Profile */}
      <div className="flex gap-3 mb-6 text-xs">
        <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-accent-green" />
          <span className="text-accent-green font-bold">{betOnFavoriteCount}</span>
          <span className="text-gray-400">safe bets</span>
        </div>
        <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-accent-purple" />
          <span className="text-accent-purple font-bold">{underdogBetCount}</span>
          <span className="text-gray-400">underdog bets</span>
        </div>
        {favoriteCount > 0 && (
          <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-accent-green" />
            <span className="text-accent-green font-bold">{favoriteCount}</span>
            <span className="text-gray-400">times favorite</span>
          </div>
        )}
      </div>

      {/* Per-question breakdown */}
      <div className="space-y-4">
        {analysis.map((a) => (
          <div
            key={a.index}
            className={`bg-dark-800 border rounded-xl overflow-hidden ${
              a.isResolved ? 'border-accent-green/30' : 'border-dark-600'
            }`}
          >
            {/* Question header */}
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-bold text-gold-500 mt-0.5 shrink-0">Q{a.index + 1}</span>
                <p className="text-sm text-gray-300 flex-1">{a.question}</p>
                {a.isResolved && (
                  <span className="shrink-0 text-[10px] bg-accent-green/20 text-accent-green px-2 py-0.5 rounded-full font-semibold">
                    SEALED
                  </span>
                )}
              </div>

              {/* === YOUR ROLE: Favorite or Underdog === */}
              {a.favoriteStakes && (
                <div className="bg-gradient-to-r from-accent-green/10 to-green-900/5 border border-accent-green/40 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-accent-green" />
                    <span className="text-xs font-black text-accent-green uppercase tracking-wider">You're the Favorite — Deliver or Get Humbled</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-dark-800/60 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-0.5">You deliver</div>
                      <div className="text-lg font-black text-accent-green">+{a.favoriteStakes.deliver}</div>
                      <div className="text-[10px] text-gray-600">50% pot bonus</div>
                    </div>
                    <div className="bg-dark-800/60 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-0.5">You choke</div>
                      <div className="text-lg font-black text-accent-red">{a.favoriteStakes.choke}</div>
                      <div className="text-[10px] text-gray-600">pot penalty</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-accent-green/70 text-center font-medium">
                    The group bet <span className="text-accent-green font-bold">{a.pot} pts</span> on you. Pot is yours to win or lose.
                  </div>
                </div>
              )}

              {a.underdogStakes && a.favorite && (
                <div className="bg-gradient-to-r from-accent-purple/10 to-purple-900/5 border border-accent-purple/40 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className="w-4 h-4 text-accent-purple" />
                    <span className="text-xs font-black text-accent-purple uppercase tracking-wider">Underdog Opportunity — Steal It</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-dark-800/60 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-0.5">You steal it</div>
                      <div className="text-lg font-black text-accent-green">+{a.underdogStakes.stealBonus}</div>
                      <div className="text-[10px] text-gray-600">75% of pot</div>
                    </div>
                    <div className="bg-dark-800/60 rounded-lg p-2.5 text-center">
                      <div className="text-[10px] text-gray-500 mb-0.5">{displayName(a.favorite)} loses</div>
                      <div className="text-lg font-black text-accent-red">−{a.underdogStakes.favPenalty}</div>
                      <div className="text-[10px] text-gray-600">their penalty</div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-accent-purple/70 text-center font-medium">
                    If you do this instead of <span className="text-accent-purple font-bold">{displayName(a.favorite)}</span>, you pocket <span className="text-accent-purple font-bold">{a.underdogStakes.stealBonus} pts</span> and they lose {a.underdogStakes.favPenalty}.
                  </div>
                </div>
              )}

              {!a.hasBet ? (
                <div className="text-xs text-gray-600 italic">No bet placed yet — role stakes above still apply during the trip</div>
              ) : (
                <>
                  {/* Bet info bar */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Target className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-500">Your pick:</span>
                      <span className={`font-bold ${a.betOnFavorite ? 'text-accent-green' : 'text-accent-purple'}`}>
                        {displayName(a.pick)}
                      </span>
                      {a.betOnFavorite && (
                        <span className="text-[10px] bg-accent-green/20 text-accent-green px-1.5 py-0.5 rounded font-bold">FAV</span>
                      )}
                      {!a.betOnFavorite && (
                        <span className="text-[10px] bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded font-bold">UNDERDOG</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-gray-500">Bet:</span>
                      <span className="text-gold-400 font-bold">{a.amount} pts</span>
                    </div>
                  </div>

                  {/* Scenario grid */}
                  <div className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-2">Betting Scenarios</div>
                  <div className="grid grid-cols-1 gap-2">
                    {/* Favorite delivers */}
                    <div className={`border rounded-lg p-3 ${a.isResolved && a.actualResult === a.favoriteDelivers ? 'ring-2 ring-accent-green' : ''} ${netBg(a.favoriteDelivers.type)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5 text-accent-green" />
                          <div>
                            <div className="text-xs font-bold text-gray-300">Favorite Delivers</div>
                            <div className="text-[10px] text-gray-500">{a.favorite ? displayName(a.favorite) : '—'} comes through</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-black ${netColor(a.favoriteDelivers.net)}`}>
                            {formatNet(a.favoriteDelivers.net)}
                          </div>
                          <div className="text-[10px] text-gray-600">{a.favoriteDelivers.label}</div>
                        </div>
                      </div>
                      {a.betOnFavorite && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-accent-green" />
                          {a.amount} × 1.5 = {Math.floor(a.amount * 1.5)} pts
                          {a.iAmFavorite && <span className="ml-1">+ {a.challengeValue} pot bonus</span>}
                        </div>
                      )}
                      {a.iAmFavorite && !a.betOnFavorite && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-accent-green" />
                          +{a.challengeValue} pot bonus (you deliver as favorite)
                        </div>
                      )}
                    </div>

                    {/* YOU steal it (only if not the favorite) */}
                    {a.iStealIt && (
                      <div className={`border-2 border-accent-purple/50 rounded-lg p-3 bg-accent-purple/5 ${a.isResolved && a.actualResult === a.iStealIt ? 'ring-2 ring-accent-purple' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Swords className="w-3.5 h-3.5 text-accent-purple" />
                            <div>
                              <div className="text-xs font-bold text-accent-purple">YOU Steal It</div>
                              <div className="text-[10px] text-gray-500">You upset {a.favorite ? displayName(a.favorite) : 'the favorite'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-black ${netColor(a.iStealIt.net)}`}>
                              {formatNet(a.iStealIt.net)}
                            </div>
                            <div className="text-[10px] text-accent-purple/70">total if you do it</div>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-accent-purple" />
                            +{Math.floor(a.pot * 0.75)} underdog pot bonus (75%)
                          </div>
                          {a.pick === playerName && (
                            <div className="flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3 text-accent-green" />
                              +{Math.floor(a.amount * 2.5)} bet payout ({a.amount} × 2.5) — you bet on yourself
                            </div>
                          )}
                          {a.betOnFavorite && (
                            <div className="flex items-center gap-1">
                              <ArrowDownRight className="w-3 h-3 text-accent-red" />
                              −{a.amount} lost bet (you bet on the favorite)
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* My pick steals it (only if underdog bet AND pick isn't me) */}
                    {a.myPickDelivers && a.pick !== playerName && (
                      <div className={`border rounded-lg p-3 ${a.isResolved && a.actualResult === a.myPickDelivers ? 'ring-2 ring-accent-purple' : ''} ${netBg(a.myPickDelivers.type)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-accent-purple" />
                            <div>
                              <div className="text-xs font-bold text-accent-purple">Your Pick Steals It</div>
                              <div className="text-[10px] text-gray-500">{displayName(a.pick)} upsets the favorite</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-black ${netColor(a.myPickDelivers.net)}`}>
                              {formatNet(a.myPickDelivers.net)}
                            </div>
                            <div className="text-[10px] text-gray-600">{a.myPickDelivers.label}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowUpRight className="w-3 h-3 text-accent-purple" />
                          {a.amount} × 2.5 = {Math.floor(a.amount * 2.5)} pts
                        </div>
                      </div>
                    )}

                    {/* Someone else steals it (not favorite, not my pick, not me) */}
                    <div className={`border rounded-lg p-3 ${a.isResolved && a.actualResult === a.someoneElseDelivers ? 'ring-2 ring-accent-red' : ''} ${netBg(a.someoneElseDelivers.type)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                          <div>
                            <div className="text-xs font-bold text-gray-300">
                              {a.betOnFavorite ? 'Someone Else Steals It' : 'Wrong Underdog Wins'}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              Someone unexpected delivers
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-black ${netColor(a.someoneElseDelivers.net)}`}>
                            {a.someoneElseDelivers.net === 0 ? '—' : formatNet(a.someoneElseDelivers.net)}
                          </div>
                          <div className="text-[10px] text-gray-600">{a.someoneElseDelivers.label}</div>
                        </div>
                      </div>
                      {a.betOnFavorite && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-accent-red" />
                          −{a.amount} pts (bet on favorite who got upset)
                        </div>
                      )}
                      {a.iAmFavorite && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-accent-red" />
                          −{a.challengeValue} pot penalty (you got upset as favorite)
                        </div>
                      )}
                    </div>

                    {/* Nobody does it */}
                    <div className={`border rounded-lg p-3 ${a.isResolved && a.actualResult === a.nobodyDoesIt ? 'ring-2 ring-yellow-400' : ''} ${netBg(a.nobodyDoesIt.type)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Minus className="w-3.5 h-3.5 text-gray-500" />
                          <div>
                            <div className="text-xs font-bold text-gray-300">Nobody Does It</div>
                            <div className="text-[10px] text-gray-500">Everyone talks, nobody walks</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-black ${netColor(a.nobodyDoesIt.net)}`}>
                            {a.nobodyDoesIt.net === 0 ? '—' : formatNet(a.nobodyDoesIt.net)}
                          </div>
                          <div className="text-[10px] text-gray-600">{a.nobodyDoesIt.label}</div>
                        </div>
                      </div>
                      {a.betOnFavorite && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-accent-red" />
                          −{a.amount} pts
                        </div>
                      )}
                      {a.iAmFavorite && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <ArrowDownRight className="w-3 h-3 text-accent-red" />
                          −{a.challengeValue} pot penalty (you choked)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Best/Worst range bar */}
                  <div className="mt-3 flex items-center gap-2 text-[11px]">
                    <span className="text-accent-red font-bold">{formatNet(a.worstCase)}</span>
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden relative">
                      {a.worstCase < 0 && a.bestCase > 0 && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-gray-500"
                          style={{ left: `${(Math.abs(a.worstCase) / (a.bestCase - a.worstCase)) * 100}%` }}
                        />
                      )}
                      <div
                        className="h-full bg-gradient-to-r from-accent-red via-yellow-400 to-accent-green rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <span className="text-accent-green font-bold">{formatNet(a.bestCase)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
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
