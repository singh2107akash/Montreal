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

              {/* Objective */}
              <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
                <h3 className="text-gold-400 font-bold text-sm mb-2">Objective</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Before the trip, each player bets on who they think will do certain things in Montreal.
                  During the trip, the admin decides what actually happened.
                  Players earn or lose points based on their bets and, in some cases, based on what they personally do.
                  The player with the <span className="text-gold-400 font-bold">most points</span> at the end wins.
                </p>
              </div>

              {/* 1. Before the Trip */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">1. Before the Trip — Place Your Bets</h3>
                <ul className="text-gray-300 text-sm leading-relaxed space-y-1.5">
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">•</span>
                    <span>There are <span className="text-gold-400 font-bold">{questions.length} questions</span>, each in the format "Who is most likely to..."</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">•</span>
                    <span>For each question, choose one player and bet some of your points on that choice</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">•</span>
                    <span>You must answer all {questions.length} questions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">•</span>
                    <span>You have <span className="text-gold-400 font-bold">{config.totalBudget} total points</span> to split across all questions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">•</span>
                    <span>Minimum bet is <span className="text-gold-400 font-bold">{config.minBetPerQuestion} pts</span> per question — bet more where you're confident</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">•</span>
                    <span>Once locked in, bets are <span className="text-accent-red font-bold">final</span> unless the admin reopens them for everyone</span>
                  </li>
                </ul>
              </div>

              {/* 2. Key Terms */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">2. After Betting Closes — Key Terms</h3>
                <p className="text-gray-400 text-xs mb-3">For each question, once everyone locks in:</p>
                <div className="space-y-3">
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-gold-400 font-bold text-xs">THE FAVORITE</span>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                      The player with the most total points bet on them. The group said: "This person is most likely to do it."
                      Being the favorite has personal stakes — you earn a bonus if you deliver, and lose points if you don't.
                    </p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-accent-purple font-bold text-xs">THE UNDERDOG</span>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                      Any player who is <span className="italic">not</span> the favorite for a question. If an underdog ends up being the one who actually does it,
                      they steal the spotlight from the favorite. This triggers the biggest single payout in the game.
                    </p>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-gold-400 font-bold text-xs">THE POT</span>
                    <span className="text-gray-400 text-xs ml-2">= total points bet on the favorite</span>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <span className="text-accent-red font-bold text-xs">CHALLENGE VALUE</span>
                    <span className="text-gray-400 text-xs ml-2">= 50% of the Pot (the favorite's personal stake)</span>
                  </div>
                </div>
                <div className="bg-dark-800 border border-dark-600 rounded-md p-2.5 mt-3">
                  <div className="text-[10px] text-gray-500 font-semibold mb-1">EXAMPLE</div>
                  <div className="text-[10px] text-gray-500">Rahul gets the most bets totaling 60 pts →
                    <span className="text-gold-400"> Favorite = Rahul</span>,
                    <span className="text-gold-400"> Pot = 60</span>,
                    <span className="text-accent-red"> Challenge = 30</span>
                  </div>
                </div>
              </div>

              {/* 3. Three Outcomes */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">3. During the Trip — Three Outcomes</h3>
                <p className="text-gray-400 text-xs mb-3">Each question is resolved in one of these three ways:</p>
                <div className="space-y-3">

                  {/* Outcome A */}
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-accent-green font-bold text-xs mb-2">A. THE FAVORITE DOES IT</div>
                    <ul className="text-gray-400 text-xs space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-accent-green shrink-0">+</span>
                        <span>Anyone who bet on the favorite <span className="text-accent-green font-semibold">earns 1.5× their bet</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-green shrink-0">+</span>
                        <span>The favorite <span className="text-accent-green font-semibold">earns +50% of the Pot</span> (personal bonus)</span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gray-600 shrink-0">·</span>
                        <span>Everyone else — no effect</span>
                      </li>
                    </ul>
                    <div className="bg-dark-800 rounded-md p-2 mt-2 text-[10px] text-gray-500">
                      Pot = 60 · You bet 10 on favorite → <span className="text-accent-green">+15</span> · Favorite → <span className="text-accent-green">+30</span> bonus
                    </div>
                  </div>

                  {/* Outcome B */}
                  <div className="bg-dark-700 rounded-lg p-3 border-2 border-accent-purple/40">
                    <div className="text-accent-purple font-bold text-xs mb-2">B. SOMEONE ELSE DOES IT (UNDERDOG STEALS IT)</div>
                    <ul className="text-gray-400 text-xs space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>Anyone who bet on the favorite <span className="text-accent-red font-semibold">loses their full bet</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-green shrink-0">+</span>
                        <span>Anyone who correctly bet on the actual person <span className="text-accent-green font-semibold">earns 2.5× their bet</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>The favorite <span className="text-accent-red font-semibold">loses 50% of the Pot</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-purple shrink-0 font-bold">!</span>
                        <span>The person who actually did it <span className="text-accent-purple font-bold">earns 75% of the Pot</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gray-600 shrink-0">·</span>
                        <span>Everyone who bet on someone else (wrong) — no effect</span>
                      </li>
                    </ul>
                    <div className="bg-dark-800 rounded-md p-2 mt-2 text-[10px] text-gray-500">
                      Pot = 60 · You bet 10 on favorite → <span className="text-accent-red">−10</span> · You bet 10 on the actual person → <span className="text-accent-green">+25</span><br />
                      Favorite → <span className="text-accent-red">−30</span> · Person who did it → <span className="text-accent-purple font-semibold">+45</span> (75% of pot)
                    </div>
                  </div>

                  {/* Outcome C */}
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold text-xs mb-2">C. NOBODY DOES IT</div>
                    <ul className="text-gray-400 text-xs space-y-1.5">
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>Anyone who bet on the favorite <span className="text-accent-red font-semibold">loses their full bet</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-accent-red shrink-0">−</span>
                        <span>The favorite <span className="text-accent-red font-semibold">loses 50% of the Pot</span></span>
                      </li>
                      <li className="flex gap-1.5">
                        <span className="text-gray-600 shrink-0">·</span>
                        <span>Everyone else — no effect</span>
                      </li>
                    </ul>
                    <div className="bg-dark-800 rounded-md p-2 mt-2 text-[10px] text-gray-500">
                      Pot = 60 · You bet 10 on favorite → <span className="text-accent-red">−10</span> · Favorite → <span className="text-accent-red">−30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. How Scoring Works */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">4. How Scoring Works</h3>
                <p className="text-gray-400 text-xs mb-3">Points move in two ways. These are independent — you can earn from both on the same question.</p>
                <div className="space-y-3">
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-gold-400 font-bold text-xs mb-1.5">A. BET RESULTS</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div className="text-gray-500">Correct bet on favorite</div>
                      <div className="text-accent-green font-bold">+1.5× your bet</div>
                      <div className="text-gray-500">Correct bet on non-favorite</div>
                      <div className="text-accent-green font-bold">+2.5× your bet</div>
                      <div className="text-gray-500">Wrong bet on favorite</div>
                      <div className="text-accent-red font-bold">−full bet</div>
                      <div className="text-gray-500">Wrong bet on anyone else</div>
                      <div className="text-gray-500 font-bold">no effect</div>
                    </div>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-accent-purple font-bold text-xs mb-1.5">B. PERSONAL RESULT (if you're involved)</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                      <div className="text-gray-500">You're the favorite & deliver</div>
                      <div className="text-accent-green font-bold">+50% of Pot</div>
                      <div className="text-gray-500">You're the favorite & don't deliver</div>
                      <div className="text-accent-red font-bold">−50% of Pot</div>
                      <div className="text-gray-500">You're the underdog & steal it</div>
                      <div className="text-accent-purple font-bold">+75% of Pot</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. How to Win */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">5. How to Win</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  After all {questions.length} questions are resolved, add up all gains and losses from your bets,
                  your personal bonuses, and your personal penalties.
                  The player with the <span className="text-gold-400 font-bold">highest total score</span> wins.
                </p>
              </div>

              {/* Quick Reference */}
              <div className="bg-dark-700 rounded-lg p-3">
                <div className="text-gold-400 font-bold text-xs mb-2">QUICK REFERENCE</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div className="text-gray-400 font-semibold col-span-2 mb-0.5">Bet Results</div>
                  <div className="text-gray-500">Correct bet on favorite</div>
                  <div className="text-accent-green font-bold">+1.5× your bet</div>
                  <div className="text-gray-500">Correct bet on someone else</div>
                  <div className="text-accent-green font-bold">+2.5× your bet</div>
                  <div className="text-gray-500">Wrong bet on favorite</div>
                  <div className="text-accent-red font-bold">−full bet</div>
                  <div className="text-gray-500">Wrong bet on someone else</div>
                  <div className="text-gray-500 font-bold">no effect</div>
                  <div className="col-span-2 border-t border-dark-600 my-1"></div>
                  <div className="text-gray-400 font-semibold col-span-2 mb-0.5">Personal Results</div>
                  <div className="text-gray-500">Favorite delivers</div>
                  <div className="text-accent-green font-bold">+50% of Pot</div>
                  <div className="text-gray-500">Favorite chokes</div>
                  <div className="text-accent-red font-bold">−50% of Pot</div>
                  <div className="text-gray-500">Underdog steals it</div>
                  <div className="text-accent-purple font-bold">+75% of Pot</div>
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
