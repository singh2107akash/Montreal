/**
 * Calculate the favorite for a given question based on all bets.
 * Returns { favorite, pot, challengeValue, backerCount, isTied, tiedPlayers }
 */
export function calculateFavorite(questionIndex, bets, players) {
  const pointsByPlayer = {};
  const backersByPlayer = {};

  players.forEach((p) => {
    pointsByPlayer[p] = 0;
    backersByPlayer[p] = 0;
  });

  Object.values(bets).forEach((playerBets) => {
    const bet = playerBets[questionIndex];
    if (bet && bet.pick && bet.amount > 0) {
      pointsByPlayer[bet.pick] = (pointsByPlayer[bet.pick] || 0) + bet.amount;
      backersByPlayer[bet.pick] = (backersByPlayer[bet.pick] || 0) + 1;
    }
  });

  const sorted = Object.entries(pointsByPlayer)
    .filter(([, pts]) => pts > 0)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return (backersByPlayer[b[0]] || 0) - (backersByPlayer[a[0]] || 0);
    });

  if (sorted.length === 0) {
    return { favorite: null, pot: 0, challengeValue: 0, backerCount: 0, isTied: false, tiedPlayers: [] };
  }

  const topPoints = sorted[0][1];
  const topBackers = backersByPlayer[sorted[0][0]];
  const tied = sorted.filter(
    ([name]) => pointsByPlayer[name] === topPoints && backersByPlayer[name] === topBackers
  );

  const isTied = tied.length > 1;
  const favorite = sorted[0][0];
  const pot = topPoints;
  const challengeValue = Math.floor(pot / 2);

  return {
    favorite,
    pot,
    challengeValue,
    backerCount: backersByPlayer[favorite],
    isTied,
    tiedPlayers: isTied ? tied.map(([name]) => name) : [],
    pointsByPlayer,
    backersByPlayer,
  };
}

/**
 * Calculate score changes for a resolved question.
 * outcomeType: 'favorite' | 'someone_else' | 'nobody'
 * actualPerson: the person who actually did it (only for 'someone_else')
 */
export function calculateScoreChanges(questionIndex, bets, players, favorite, pot, challengeValue, outcomeType, actualPerson) {
  const changes = {};
  players.forEach((p) => {
    changes[p] = 0;
  });

  if (outcomeType === 'favorite') {
    // Everyone who bet on the favorite wins 1.5x their bet amount
    Object.entries(bets).forEach(([player, playerBets]) => {
      const bet = playerBets[questionIndex];
      if (bet && bet.pick === favorite) {
        changes[player] = (changes[player] || 0) + Math.floor(bet.amount * 1.5);
      }
    });
    // The favorite wins 50% of pot
    changes[favorite] = (changes[favorite] || 0) + challengeValue;
  } else if (outcomeType === 'someone_else') {
    // Everyone who bet on the favorite loses their bet amount
    // Everyone who correctly bet on the actual person wins 1.5x their bet amount
    Object.entries(bets).forEach(([player, playerBets]) => {
      const bet = playerBets[questionIndex];
      if (bet && bet.pick === favorite) {
        changes[player] = (changes[player] || 0) - bet.amount;
      } else if (bet && actualPerson && bet.pick === actualPerson) {
        changes[player] = (changes[player] || 0) + Math.floor(bet.amount * 2.5);
      }
    });
    // The favorite loses 50% of pot
    changes[favorite] = (changes[favorite] || 0) - challengeValue;
    // The underdog who actually did it wins 75% of pot
    if (actualPerson) {
      const underdogBonus = Math.floor(pot * 0.75);
      changes[actualPerson] = (changes[actualPerson] || 0) + underdogBonus;
    }
  } else if (outcomeType === 'nobody') {
    // Everyone who bet on the favorite loses points equal to their bet amount
    Object.entries(bets).forEach(([player, playerBets]) => {
      const bet = playerBets[questionIndex];
      if (bet && bet.pick === favorite) {
        changes[player] = (changes[player] || 0) - bet.amount;
      }
    });
    // The favorite loses points equal to half the pot
    changes[favorite] = (changes[favorite] || 0) - challengeValue;
  }

  return changes;
}

/**
 * Calculate the full leaderboard from all resolved questions.
 */
export function calculateLeaderboard(players, bets, resolutions, questions) {
  const scores = {};
  const stats = {};

  players.forEach((p) => {
    scores[p] = 0;
    stats[p] = {
      timesFavorite: 0,
      deliveredAsFavorite: 0,
      penalizedAsFavorite: 0,
      stolenCategories: 0,
      totalGains: 0,
      totalLosses: 0,
    };
  });

  questions.forEach((_, qi) => {
    const resolution = resolutions[qi];
    if (!resolution || !resolution.resolved) return;

    const favoriteData = calculateFavorite(qi, bets, players);
    const favorite = resolution.favoriteOverride || favoriteData.favorite;
    const pot = favoriteData.pot;
    const challengeValue = Math.floor(pot / 2);

    // Track favorite stats
    if (favorite) {
      stats[favorite].timesFavorite++;
    }

    const changes = calculateScoreChanges(
      qi, bets, players, favorite, pot, challengeValue,
      resolution.outcomeType, resolution.actualPerson
    );

    Object.entries(changes).forEach(([player, change]) => {
      scores[player] += change;
      if (change > 0) stats[player].totalGains += change;
      if (change < 0) stats[player].totalLosses += change;
    });

    if (resolution.outcomeType === 'favorite' && favorite) {
      stats[favorite].deliveredAsFavorite++;
    } else if (resolution.outcomeType === 'someone_else') {
      if (favorite) stats[favorite].penalizedAsFavorite++;
      if (resolution.actualPerson) stats[resolution.actualPerson].stolenCategories++;
    } else if (resolution.outcomeType === 'nobody') {
      if (favorite) stats[favorite].penalizedAsFavorite++;
    }
  });

  const leaderboard = players
    .map((p) => ({
      name: p,
      score: scores[p],
      ...stats[p],
    }))
    .sort((a, b) => b.score - a.score);

  return leaderboard;
}
