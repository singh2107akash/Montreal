import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGame } from '../GameContext';
import { Trophy, Target, Users, Zap, LogOut, Shield, Loader2, BookOpen, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { players, lockedPlayers, questions, resolutions, config, saving, error, bettingClosed, closeBetting, reopenBetting } = useGame();
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

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-10 max-w-md mx-auto text-left">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Users className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">{players.length} Degens</div>
            <div className="text-xs text-gray-500">{lockedPlayers.length} committed</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Target className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">
              {isLocked ? 'Locked & Loaded' : 'Put Up or Shut Up'}
            </div>
            <div className="text-xs text-gray-500">{config.totalBudget} pts, {questions.length} questions</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Zap className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">{resolvedCount} Fates Sealed</div>
            <div className="text-xs text-gray-500">of {questions.length} showdowns</div>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
            <Trophy className="w-5 h-5 text-gold-400 mb-2" />
            <div className="text-sm font-medium text-gray-200">Who's Winning</div>
            <div className="text-xs text-gray-500">{allLocked ? 'It\'s live, baby' : 'After everyone locks in'}</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 items-center">
          {!isLocked && !isAdmin ? (
            <button
              onClick={() => navigate('/betting')}
              className="w-full max-w-xs bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 pulse-gold cursor-pointer"
            >
              Time to Bet, Degen
            </button>
          ) : isAdmin ? (
            <button
              onClick={() => navigate('/setup')}
              className="w-full max-w-xs bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-500 text-dark-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 pulse-gold cursor-pointer"
            >
              Command Center
            </button>
          ) : (
            <div className="bg-dark-800 border border-accent-green/30 rounded-xl px-6 py-4 text-accent-green text-sm font-medium">
              You're locked in. No backing out now. Montreal decides everything.
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/betting')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Place Bets
              </button>
            )}
            <button
              onClick={() => navigate('/market')}
              className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
            >
              The Odds Board
            </button>
            {isAdmin && (
              <button
                onClick={() => navigate('/resolve')}
                className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
              >
                Judgment Day
              </button>
            )}
            <button
              onClick={() => navigate('/results')}
              className="text-sm text-gray-400 hover:text-gold-400 transition-colors cursor-pointer"
            >
              Who's Winning
            </button>
          </div>

          {/* Admin: End/Reopen Betting */}
          {isAdmin && (
            <div className="mt-4">
              {!bettingClosed ? (
                <button
                  onClick={closeBetting}
                  className="flex items-center gap-2 mx-auto text-sm text-accent-red hover:text-red-400 transition-colors cursor-pointer font-medium"
                >
                  <Lock className="w-4 h-4" /> End Betting (Lock Everyone)
                </button>
              ) : (
                <button
                  onClick={reopenBetting}
                  className="flex items-center gap-2 mx-auto text-sm text-accent-green hover:text-green-400 transition-colors cursor-pointer font-medium"
                >
                  <Unlock className="w-4 h-4" /> Reopen Betting
                </button>
              )}
            </div>
          )}
        </div>

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
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 text-left space-y-5 animate-fade-in-up">

              {/* The Game */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">The Game</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Sacré Bets is a pre-trip betting game. There are {questions.length} questions, all in the format
                  "Who is most likely to..." — you bet on which player you think will actually do each thing during the Montreal trip.
                </p>
              </div>

              {/* Before the Trip */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Before the Trip — Place Your Bets</h3>
                <ul className="text-gray-300 text-sm leading-relaxed space-y-1.5">
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">1.</span>
                    You get <span className="text-gold-400 font-bold">{config.totalBudget} points</span> to spread across all {questions.length} questions.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">2.</span>
                    For each question, pick which player you think will do it and bet points on it.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">3.</span>
                    Minimum bet is <span className="text-gold-400 font-bold">{config.minBetPerQuestion} pts</span> per question. You must answer all {questions.length}.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">4.</span>
                    Bet more on questions you feel confident about. Strategy matters!
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">5.</span>
                    Once you lock in, your bets are final. No changes.
                  </li>
                </ul>
              </div>

              {/* The Favorite */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">The Favorite</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  After everyone locks in, the player with the <span className="text-gold-400 font-bold">most total points</span> bet
                  on them for a question becomes the <span className="text-gold-400 font-bold">Favorite</span>.
                  The total points on the favorite is called the <span className="text-gold-400 font-bold">Pot</span>.
                  Half the pot is the <span className="text-accent-red font-bold">Challenge Value</span> — this
                  is the personal stake for the favorite.
                </p>
              </div>

              {/* During the Trip */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">During the Trip — Resolution</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-2">
                  As things happen on the trip, the admin resolves each question with one of three outcomes:
                </p>
                <div className="space-y-3">
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-accent-green font-bold text-xs mb-1">FAVORITE DID IT</div>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li>Everyone who bet on the favorite <span className="text-accent-green font-semibold">wins 1.5x</span> their bet amount</li>
                      <li>The favorite <span className="text-accent-green font-semibold">wins</span> 50% of the pot as a personal bonus</li>
                    </ul>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3 border border-accent-purple/30">
                    <div className="text-accent-purple font-bold text-xs mb-1">THE UNDERDOG STEALS IT</div>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li>Everyone who bet on the favorite <span className="text-accent-red font-semibold">loses</span> their bet amount</li>
                      <li>Everyone who correctly bet on the underdog <span className="text-accent-green font-semibold">wins 2.5x</span> their bet amount — massive reward for believing in the underdog</li>
                      <li>The favorite <span className="text-accent-red font-semibold">loses</span> 50% of the pot</li>
                      <li>The underdog <span className="text-accent-green font-semibold">wins 75% of the pot</span> — the biggest single payout in the game</li>
                    </ul>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-3">
                    <div className="text-yellow-400 font-bold text-xs mb-1">NOBODY DID IT</div>
                    <ul className="text-gray-400 text-xs space-y-1">
                      <li>Everyone who bet on the favorite <span className="text-accent-red font-semibold">loses</span> their bet amount</li>
                      <li>The favorite <span className="text-accent-red font-semibold">loses</span> the challenge value (pot/2)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Winning */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Winning the Game</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  After all {questions.length} questions are resolved, the player with the
                  <span className="text-gold-400 font-bold"> highest total score</span> wins.
                  Correct bets pay <span className="text-gold-400 font-bold">1.5x</span> your wager. Favorites who deliver get 50% of the pot.
                  But the real chaos move? <span className="text-accent-purple font-bold">Be the underdog.</span> If someone else steals it from the favorite, they take home <span className="text-accent-purple font-bold">75% of the pot</span> — the single biggest payout in the game. High risk, massive reward.
                </p>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-gold-400 font-bold text-sm mb-2 uppercase tracking-wider">Pro Tips</h3>
                <ul className="text-gray-300 text-sm leading-relaxed space-y-2.5">
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span>If you're the <span className="text-gold-400 font-bold">Favorite</span>, you better deliver. The group put their money on you for a reason — don't choke. Show up or get humbled.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span>If you bet on the favorite, don't just sit there — <span className="text-gold-400 font-bold">make your favorite deliver</span>. Peer pressure is a valid strategy. You invested in them, now manage your asset.</span>
                  </li>
                  <li className="bg-accent-purple/10 border border-accent-purple/30 rounded-lg p-3 -mx-1">
                    <div className="flex gap-2">
                      <span className="text-accent-purple shrink-0 font-bold text-lg">!</span>
                      <span><span className="text-accent-purple font-bold">THE UNDERDOG PATH:</span> Not the favorite? <span className="text-accent-purple font-bold">GOOD.</span> That's where the real money is. If you steal it from the favorite, you take <span className="text-accent-purple font-bold">75% of the pot</span> — the biggest payout in the game. Nobody sees you coming. Nobody expects it. Then you deliver and kick every doubter right in the Sacré Bleu Balls. The favorite gets humbled, you walk away loaded. This is the chaos play. This is how legends are made in Montreal.</span>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span>Spread your points — don't dump everything on one question like a degenerate. Unless you ARE that degenerate. Then go all in, we respect it.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-500 shrink-0">&bull;</span>
                    <span>Check the <span className="text-gold-400 font-bold">Market page</span> to see who the favorites are, where the money is going, and who the group thinks is absolutely going to embarrass themselves.</span>
                  </li>
                </ul>
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
