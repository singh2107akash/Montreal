import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Trophy, Target, Users, Zap, LogOut, Shield, Loader2, BookOpen, ChevronDown, ChevronUp, Lock, Unlock, TrendingUp, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { players, lockedPlayers, questions, resolutions, config, saving, error, bettingClosed, closeBetting, reopenBetting, unlockAllPlayers } = useGame();
  const [showRules, setShowRules] = useState(false);

  const isAdmin = user?.isAdmin;
  const isLocked = lockedPlayers.includes(user?.name);
  const allLocked = players.every((p) => lockedPlayers.includes(p));
  const resolvedCount = Object.values(resolutions).filter((r) => r?.resolved).length;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 relative">
      {/* Header bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          {isAdmin && <Shield className="w-4 h-4 text-gold-400" />}
          <span className="text-gray-400">
            {user?.name}
            {isAdmin && <span className="text-gold-400 ml-1">(Admin)</span>}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {saving && <Loader2 className="w-3.5 h-3.5 text-gold-400 animate-spin" />}
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-400 transition-colors cursor-pointer flex items-center gap-1 text-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-2xl w-full text-center mt-12">
        <div className="mb-2 text-gold-400 text-sm font-semibold tracking-[0.3em] uppercase">
          Montreal Edition
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-gold-400 via-yellow-200 to-gold-500 bg-clip-text text-transparent leading-tight">
          SACRÉ BETS
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
          Talk is cheap. Put your points where your mouth is.
          Montreal will expose who's all bark and no bite.
        </p>

        {/* Main action buttons - what players actually want to do */}
        <div className="grid grid-cols-2 gap-3 mb-6 max-w-md mx-auto">
          {!isAdmin ? (
            <button
              onClick={() => navigate('/betting')}
              className={`rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer border ${
                isLocked
                  ? 'bg-dark-800 border-accent-green/30 opacity-60'
                  : 'bg-gradient-to-br from-gold-500/20 to-gold-600/10 border-gold-500/50 hover:border-gold-400'
              }`}
            >
              <Target className={`w-6 h-6 ${isLocked ? 'text-accent-green' : 'text-gold-400'}`} />
              <div className={`text-sm font-bold ${isLocked ? 'text-accent-green' : 'text-gold-400'}`}>
                {isLocked ? 'Locked In' : 'Place Bets'}
              </div>
              <div className="text-[11px] text-gray-500">{isLocked ? 'No backing out' : `${config.totalBudget} pts to spend`}</div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/setup')}
              className="bg-gradient-to-br from-gold-500/20 to-gold-600/10 border border-gold-500/50 hover:border-gold-400 rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer"
            >
              <Shield className="w-6 h-6 text-gold-400" />
              <div className="text-sm font-bold text-gold-400">Command Center</div>
              <div className="text-[11px] text-gray-500">Run the show</div>
            </button>
          )}

          <button
            onClick={() => navigate('/market')}
            className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer"
          >
            <TrendingUp className="w-6 h-6 text-gold-400" />
            <div className="text-sm font-bold text-gray-200">The Odds Board</div>
            <div className="text-[11px] text-gray-500">See who's on the hook</div>
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/resolve')}
              className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-6 h-6 text-gold-400" />
              <div className="text-sm font-bold text-gray-200">Judgment Day</div>
              <div className="text-[11px] text-gray-500">{resolvedCount}/{questions.length} sealed</div>
            </button>
          )}

          <button
            onClick={() => navigate('/my-odds')}
            className="bg-dark-800 border border-accent-purple/30 hover:border-accent-purple/60 rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer"
          >
            <BarChart3 className="w-6 h-6 text-accent-purple" />
            <div className="text-sm font-bold text-gray-200">What's At Stake</div>
            <div className="text-[11px] text-gray-500">Your scenarios</div>
          </button>

          <button
            onClick={() => navigate('/results')}
            className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer"
          >
            <Trophy className="w-6 h-6 text-gold-400" />
            <div className="text-sm font-bold text-gray-200">Who's Winning</div>
            <div className="text-[11px] text-gray-500">Leaderboard</div>
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/betting')}
              className="bg-dark-800 border border-dark-600 hover:border-gold-500/50 rounded-xl px-4 py-5 flex flex-col items-center gap-2 transition-all cursor-pointer"
            >
              <Target className="w-6 h-6 text-gold-400" />
              <div className="text-sm font-bold text-gray-200">Place Bets</div>
              <div className="text-[11px] text-gray-500">Manage bets</div>
            </button>
          )}
        </div>

        {/* Compact stats bar */}
        <div className="flex justify-center gap-4 text-xs text-gray-500 mb-4">
          <span><span className="text-gold-400 font-bold">{players.length}</span> degens</span>
          <span>&middot;</span>
          <span><span className="text-gold-400 font-bold">{lockedPlayers.length}</span> committed</span>
          <span>&middot;</span>
          <span><span className="text-gold-400 font-bold">{resolvedCount}</span>/{questions.length} sealed</span>
        </div>

        {/* Admin: Betting Controls */}
        {isAdmin && (
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            {!bettingClosed ? (
              <button
                onClick={closeBetting}
                className="flex items-center gap-2 text-sm text-accent-red hover:text-red-400 transition-colors cursor-pointer font-medium"
              >
                <Lock className="w-4 h-4" /> End Betting (Lock Everyone)
              </button>
            ) : (
              <button
                onClick={reopenBetting}
                className="flex items-center gap-2 text-sm text-accent-green hover:text-green-400 transition-colors cursor-pointer font-medium"
              >
                <Unlock className="w-4 h-4" /> Reopen Betting
              </button>
            )}
            {lockedPlayers.length > 0 && !bettingClosed && (
              <button
                onClick={unlockAllPlayers}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer font-medium"
              >
                <Unlock className="w-4 h-4" /> Unlock All ({lockedPlayers.length}) — Let Them Edit
              </button>
            )}
          </div>
        )}

        {/* Rules Section */}
        <div className="mt-12 max-w-lg mx-auto">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-gold-400 transition-colors cursor-pointer py-3"
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-semibold text-sm">How to Play</span>
            {showRules ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRules && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-left space-y-6 animate-fade-in-up">

              {/* TL;DR */}
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
                <h3 className="text-gold-400 font-bold text-sm mb-2">TL;DR — How This Works</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Before the trip, everyone bets on <span className="text-gold-400 font-bold">who will do what</span> in Montreal.
                  You get <span className="text-gold-400 font-bold">{config.totalBudget} points</span> to spread across {questions.length} questions.
                  During the trip, the admin resolves what actually happened.
                  You earn points from <span className="text-gold-400 font-bold">correct bets</span> and from
                  <span className="text-accent-purple font-bold"> being the underdog who actually does it</span>.
                  Most points at the end wins. Two ways to win: bet smart, or go full chaos mode and steal the spotlight.
                </p>
              </div>

              {/* Step 1: Placing Bets */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Step 1 — Place Your Bets (Before the Trip)</h3>
                <ul className="text-gray-300 text-sm leading-relaxed space-y-2">
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0 font-bold">1.</span>
                    <span>There are <span className="text-gold-400 font-bold">{questions.length} questions</span>, all in the format "Who is most likely to..." — e.g., "Who is most likely to get lost?" or "Who is most likely to miss the flight?"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0 font-bold">2.</span>
                    <span>For <span className="font-semibold text-gray-200">each question</span>, you pick one player you think will actually do that thing during the trip, then bet points on it. You <span className="font-semibold text-gray-200">must answer all {questions.length}</span>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0 font-bold">3.</span>
                    <span>You have a total budget of <span className="text-gold-400 font-bold">{config.totalBudget} pts</span> to split across all questions. Minimum <span className="text-gold-400 font-bold">{config.minBetPerQuestion} pts</span> per question. Bet more on ones you feel confident about.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0 font-bold">4.</span>
                    <span>Once you <span className="text-accent-red font-bold">lock in</span>, your bets are <span className="font-semibold text-gray-200">final</span>. No edits unless the admin unlocks everyone. Think before you commit.</span>
                  </li>
                </ul>
              </div>

              {/* Step 2: Key Terms */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Step 2 — Understanding the Key Terms</h3>
                <div className="space-y-3">
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold-400 font-bold text-xs">THE FAVORITE</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      For each question, after everyone locks in, the player with the <span className="text-gold-400 font-semibold">most total points</span> bet
                      on them becomes the <span className="text-gold-400 font-semibold">Favorite</span>. The group basically said: "This person is MOST likely to do this."
                      Being the favorite is both a blessing and a curse — deliver and you win big, choke and you get punished.
                    </p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold-400 font-bold text-xs">THE POT</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      The Pot = total points bet on the favorite for that question. If 8 people bet on Rahul for a question and those bets total 60 pts, the Pot is 60.
                    </p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-accent-red font-bold text-xs">CHALLENGE VALUE</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Challenge Value = <span className="font-semibold">half the Pot</span>. This is the favorite's personal stake — what they win if they deliver, or lose if they don't.
                      If the pot is 60, the challenge value is 30.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Three Outcomes */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Step 3 — The Three Outcomes (During the Trip)</h3>
                <p className="text-gray-400 text-xs mb-3">
                  As things happen on the trip, the admin resolves each question. There are only 3 possible outcomes:
                </p>
                <div className="space-y-3">
                  {/* Outcome 1 */}
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-accent-green font-bold text-xs mb-2">OUTCOME 1: FAVORITE DELIVERS</div>
                    <p className="text-gray-400 text-xs mb-2">The person the group expected to do it actually did it. Predictable. Safe bettors get paid.</p>
                    <ul className="text-gray-400 text-xs space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-accent-green shrink-0">+</span>
                        <span>Everyone who bet on the favorite <span className="text-accent-green font-semibold">wins 1.5x their bet</span>. Bet 10? You get 15.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-green shrink-0">+</span>
                        <span>The favorite themselves <span className="text-accent-green font-semibold">wins 50% of the pot</span> as a personal bonus for delivering.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gray-600 shrink-0">·</span>
                        <span>Everyone who bet on someone else? Nothing happens to them. No win, no loss.</span>
                      </li>
                    </ul>
                    <div className="bg-dark-800 rounded-md p-2 mt-2">
                      <div className="text-[10px] text-gray-500 font-semibold mb-1">EXAMPLE: Pot = 60, Challenge = 30</div>
                      <div className="text-[10px] text-gray-500">You bet 10 on the favorite → <span className="text-accent-green">you win 15 pts</span></div>
                      <div className="text-[10px] text-gray-500">The favorite → <span className="text-accent-green">wins 30 pts</span> bonus for delivering</div>
                    </div>
                  </div>

                  {/* Outcome 2 */}
                  <div className="bg-dark-700 rounded-lg p-3 border-2 border-accent-purple/40">
                    <div className="text-accent-purple font-bold text-xs mb-2">OUTCOME 2: SOMEONE ELSE STEALS IT (UNDERDOG)</div>
                    <p className="text-gray-400 text-xs mb-2">
                      Plot twist. The favorite DIDN'T do it — someone unexpected stepped up. This is where the game gets wild.
                    </p>
                    <ul className="text-gray-400 text-xs space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>Everyone who bet on the favorite <span className="text-accent-red font-semibold">loses their entire bet</span>. You backed the wrong horse.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-green shrink-0">+</span>
                        <span>If you correctly bet on the person who actually did it, you <span className="text-accent-green font-semibold">win 2.5x your bet</span>. Bet 10 on the right underdog? That's 25 pts.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>The favorite <span className="text-accent-red font-semibold">loses 50% of the pot</span>. They got humbled.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-purple shrink-0 font-bold">!</span>
                        <span>The underdog who actually did it <span className="text-accent-purple font-bold">wins 75% of the pot</span> — the single biggest payout in the entire game.</span>
                      </li>
                    </ul>
                    <div className="bg-dark-800 rounded-md p-2 mt-2">
                      <div className="text-[10px] text-gray-500 font-semibold mb-1">EXAMPLE: Pot = 60, Challenge = 30</div>
                      <div className="text-[10px] text-gray-500">You bet 10 on the favorite → <span className="text-accent-red">you lose 10 pts</span></div>
                      <div className="text-[10px] text-gray-500">You bet 10 on the underdog who did it → <span className="text-accent-green">you win 25 pts</span></div>
                      <div className="text-[10px] text-gray-500">The favorite → <span className="text-accent-red">loses 30 pts</span></div>
                      <div className="text-[10px] text-accent-purple font-semibold">The underdog who did it → <span>wins 45 pts</span> (75% of pot) + any bet winnings</div>
                    </div>
                  </div>

                  {/* Outcome 3 */}
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold text-xs mb-2">OUTCOME 3: NOBODY DID IT</div>
                    <p className="text-gray-400 text-xs mb-2">Nobody had the guts. The question goes undelivered. Favorite takes the fall.</p>
                    <ul className="text-gray-400 text-xs space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>Everyone who bet on the favorite <span className="text-accent-red font-semibold">loses their entire bet</span>.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>The favorite <span className="text-accent-red font-semibold">loses the challenge value</span> (pot/2). They were supposed to do it and didn't.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gray-600 shrink-0">·</span>
                        <span>Everyone who bet on someone else? No effect. Your bet just didn't hit.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Two Ways to Score */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Two Ways to Score Points</h3>
                <p className="text-gray-400 text-xs mb-3">You earn points from two completely separate sources. Understanding this is the key to winning.</p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-3">
                    <div className="text-gold-400 font-bold text-xs mb-1">1. YOUR BETS (Everyone earns from this)</div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Every correct bet earns you points. Bet on the favorite and they deliver? <span className="text-gold-400 font-semibold">1.5x payout</span>.
                      Bet on an underdog and they steal it? <span className="text-gold-400 font-semibold">2.5x payout</span>.
                      This is the safe, consistent way to build points — predict correctly and get rewarded.
                    </p>
                  </div>
                  <div className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-3">
                    <div className="text-accent-purple font-bold text-xs mb-1">2. YOUR ACTIONS ON THE TRIP (Personal bonuses)</div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      This is separate from betting. On the trip, if YOU are the one who actually does the thing:
                    </p>
                    <ul className="text-gray-400 text-xs mt-1.5 space-y-1">
                      <li>• If you're the <span className="text-gold-400 font-semibold">Favorite</span> and deliver → <span className="text-accent-green font-semibold">+50% of the pot</span></li>
                      <li>• If you're the <span className="text-accent-purple font-semibold">Underdog</span> and steal it → <span className="text-accent-purple font-bold">+75% of the pot</span> (the biggest single payout)</li>
                      <li>• If you're the Favorite and choke → <span className="text-accent-red font-semibold">−50% of the pot</span></li>
                    </ul>
                    <p className="text-gray-500 text-[10px] mt-1.5 italic">
                      This means you can earn HUGE points just from what you do on the trip — even if your bets were garbage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Winning the Game */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Winning the Game</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  After all {questions.length} questions are resolved, the player with the
                  <span className="text-gold-400 font-bold"> highest total score</span> wins.
                  Your score = points from correct bets + personal bonuses from being the favorite or underdog − penalties from wrong bets and choking as favorite.
                </p>
              </div>

              {/* Strategy Guide */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Strategy Guide — How to Actually Win</h3>
                <div className="space-y-3">

                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-gold-400 font-bold text-xs mb-1.5">STRATEGY 1: THE SAFE PLAY — BET ON FAVORITES</div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-1.5">
                      Pick whoever the group is obviously going to bet on. If 10 people bet on Rahul for "most likely to get lost,"
                      and Rahul actually gets lost, you earn <span className="text-accent-green font-semibold">1.5x your bet</span>. Safe, consistent, boring — but it stacks up.
                    </p>
                    <p className="text-gray-500 text-[10px] italic">
                      Risk: If someone else steals it, you <span className="text-accent-red font-semibold">lose your entire bet</span>. No partial refunds.
                    </p>
                  </div>

                  <div className="bg-dark-700 rounded-lg p-3 border border-accent-purple/30">
                    <div className="text-accent-purple font-bold text-xs mb-1.5">STRATEGY 2: THE CHAOS PLAY — BET ON UNDERDOGS</div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-1.5">
                      Pick someone unexpected. If they actually do it, your bet pays <span className="text-accent-green font-semibold">2.5x</span> instead of 1.5x.
                      Higher payout because it's riskier. Even better: <span className="text-accent-purple font-bold">bet on yourself</span>. If you're right and you actually do it,
                      you get 2.5x your bet PLUS 75% of the pot for being the underdog. That's a massive swing.
                    </p>
                    <p className="text-gray-500 text-[10px] italic">
                      Risk: If the favorite delivers instead, your bet just doesn't pay out (no loss, but no gain either).
                    </p>
                  </div>

                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-gold-400 font-bold text-xs mb-1.5">STRATEGY 3: THE TRIP PLAY — BE THE UNDERDOG</div>
                    <p className="text-gray-400 text-xs leading-relaxed mb-1.5">
                      Forget betting for a second. On the actual trip, if you do something unexpected — something the group bet
                      someone ELSE would do — <span className="text-accent-purple font-bold">you get 75% of the pot</span> just for doing it. That can be 30-50+ points from a single question.
                      Stack 3-4 underdog steals and you can win the entire game regardless of how you bet.
                    </p>
                    <p className="text-gray-500 text-[10px] italic">
                      This is why it pays to read the Odds Board. See where big pots are stacking up on someone else and ask yourself: "Can I steal this?"
                    </p>
                  </div>

                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-gold-400 font-bold text-xs mb-1.5">STRATEGY 4: BUDGET MANAGEMENT</div>
                    <ul className="text-gray-400 text-xs leading-relaxed space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-gold-500 shrink-0">•</span>
                        <span><span className="font-semibold text-gray-300">Don't spread evenly.</span> Put {config.minBetPerQuestion} on questions you're unsure about and load up on ones you're confident in. A 20-pt bet at 1.5x = 30 pts. A {config.minBetPerQuestion}-pt bet = only {Math.floor(config.minBetPerQuestion * 1.5)}.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gold-500 shrink-0">•</span>
                        <span><span className="font-semibold text-gray-300">Bet big on underdogs you believe in.</span> 2.5x on a 15-pt underdog bet = 37 pts. That's better than three safe bets hitting.</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gold-500 shrink-0">•</span>
                        <span><span className="font-semibold text-gray-300">Mix safe and risky.</span> Go heavy favorite on 12-15 questions, go underdog on 5-8 where you see opportunity. You need both consistency and big swings.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Pro Tips */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Pro Tips</h3>
                <ul className="text-gray-300 text-sm leading-relaxed space-y-2.5">
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span><span className="text-gold-400 font-bold">Peer pressure is a strategy.</span> If you bet on someone, make sure they deliver. Push them into it. Remind them what's at stake. You invested in them — manage your asset.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span><span className="text-gold-400 font-bold">Check "What's At Stake" page.</span> It shows every scenario for every bet you placed — exactly how much you win or lose in each outcome. Use it to understand your exposure.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span><span className="text-gold-400 font-bold">Watch the Odds Board.</span> See where money is piling up. Big pots = big opportunity for whoever steals it. If 80 pts are on someone for a question, the underdog who steals it gets 60 pts.</span>
                  </li>
                  <li className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-3 -mx-1">
                    <div className="flex gap-2">
                      <span className="text-accent-purple shrink-0 font-bold text-lg">!</span>
                      <span><span className="text-accent-purple font-bold">THE ULTIMATE PLAY:</span> Bet on yourself as the underdog, then actually do the thing on the trip.
                        You get <span className="text-accent-purple font-bold">2.5x your bet</span> (correct underdog bet) <span className="text-accent-purple font-bold">+ 75% of the pot</span> (underdog bonus).
                        If you do this on a question with a fat pot, that single move can be worth 50-80+ points.
                        Nobody sees you coming. Nobody expects it. That's the degen dream right there.
                      </span>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span><span className="text-gold-400 font-bold">If you're the Favorite</span>, you have pressure on you. You win 50% of the pot if you deliver — but lose 50% if you don't. The group is watching. Don't choke.</span>
                  </li>
                </ul>
              </div>

              {/* Quick Reference */}
              <div className="bg-dark-700 rounded-lg p-3">
                <div className="text-gold-400 font-bold text-xs mb-2">QUICK REFERENCE — PAYOUT CHEAT SHEET</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div className="text-gray-500">Correct bet on favorite</div>
                  <div className="text-accent-green font-bold">+1.5x your bet</div>
                  <div className="text-gray-500">Correct bet on underdog</div>
                  <div className="text-accent-green font-bold">+2.5x your bet</div>
                  <div className="text-gray-500">Wrong bet on favorite (upset)</div>
                  <div className="text-accent-red font-bold">−your full bet</div>
                  <div className="text-gray-500">Wrong bet on underdog</div>
                  <div className="text-gray-500 font-bold">no effect</div>
                  <div className="col-span-2 border-t border-dark-600 my-1"></div>
                  <div className="text-gray-500">You deliver as favorite</div>
                  <div className="text-accent-green font-bold">+50% of pot</div>
                  <div className="text-gray-500">You choke as favorite</div>
                  <div className="text-accent-red font-bold">−50% of pot</div>
                  <div className="text-gray-500">You steal it as underdog</div>
                  <div className="text-accent-purple font-bold">+75% of pot</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-dark-500">
        No live betting. You commit before the trip. Montreal does the rest.
      </div>
    </div>
  );
}
