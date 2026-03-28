import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { QUESTIONS, DEFAULT_PLAYERS, GAME_CONFIG } from './data/questions';
import { loadGameState, saveGameState } from './utils/storage';

const GameContext = createContext(null);

const defaultState = {
  players: DEFAULT_PLAYERS,
  nicknames: {},
  bets: {},
  lockedPlayers: [],
  resolutions: {},
  favoriteOverrides: {},
  gamePhase: 'landing', // landing | setup | betting | market | resolution | results
  config: GAME_CONFIG,
};

export function GameProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = loadGameState();
    return saved || { ...defaultState };
  });

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const update = useCallback((partial) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const setPlayers = useCallback((players) => {
    update({ players });
  }, [update]);

  const setNickname = useCallback((player, nickname) => {
    setState((prev) => ({
      ...prev,
      nicknames: { ...prev.nicknames, [player]: nickname },
    }));
  }, []);

  const placeBet = useCallback((player, questionIndex, pick, amount) => {
    setState((prev) => {
      const playerBets = { ...(prev.bets[player] || {}) };
      playerBets[questionIndex] = { pick, amount: Number(amount) };
      return { ...prev, bets: { ...prev.bets, [player]: playerBets } };
    });
  }, []);

  const lockPlayer = useCallback((player) => {
    setState((prev) => ({
      ...prev,
      lockedPlayers: [...new Set([...prev.lockedPlayers, player])],
    }));
  }, []);

  const resolveQuestion = useCallback((questionIndex, outcomeType, actualPerson = null) => {
    setState((prev) => ({
      ...prev,
      resolutions: {
        ...prev.resolutions,
        [questionIndex]: {
          resolved: true,
          outcomeType,
          actualPerson,
          favoriteOverride: prev.favoriteOverrides[questionIndex] || null,
          resolvedAt: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const unresolveQuestion = useCallback((questionIndex) => {
    setState((prev) => {
      const resolutions = { ...prev.resolutions };
      delete resolutions[questionIndex];
      return { ...prev, resolutions };
    });
  }, []);

  const setFavoriteOverride = useCallback((questionIndex, player) => {
    setState((prev) => ({
      ...prev,
      favoriteOverrides: { ...prev.favoriteOverrides, [questionIndex]: player },
    }));
  }, []);

  const resetGame = useCallback(() => {
    setState({ ...defaultState });
  }, []);

  const loadState = useCallback((newState) => {
    setState(newState);
  }, []);

  const value = {
    ...state,
    questions: QUESTIONS,
    setPlayers,
    setNickname,
    placeBet,
    lockPlayer,
    resolveQuestion,
    unresolveQuestion,
    setFavoriteOverride,
    update,
    resetGame,
    loadState,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
