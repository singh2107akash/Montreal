import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { QUESTIONS, DEFAULT_PLAYERS, GAME_CONFIG } from './data/questions';
import { writeData, updateData, onData, removeData, isFirebaseConfigured } from './firebase';

const GameContext = createContext(null);

const defaultState = {
  players: DEFAULT_PLAYERS,
  nicknames: {},
  bets: {},
  lockedPlayers: [],
  resolutions: {},
  favoriteOverrides: {},
  gamePhase: 'setup',
  config: GAME_CONFIG,
};

export function GameProvider({ children }) {
  const [state, setState] = useState({ ...defaultState });
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Listen to Firebase for real-time updates
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }

    setFirebaseReady(true);
    const unsubscribe = onData('', (data) => {
      if (data) {
        setState({
          players: data.players || DEFAULT_PLAYERS,
          nicknames: data.nicknames || {},
          bets: data.bets || {},
          lockedPlayers: data.lockedPlayers || [],
          resolutions: data.resolutions || {},
          favoriteOverrides: data.favoriteOverrides || {},
          gamePhase: data.gamePhase || 'setup',
          config: data.config || GAME_CONFIG,
        });
      } else {
        // First time - initialize Firebase with defaults
        writeData('', defaultState);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const syncToFirebase = useCallback((path, value) => {
    if (firebaseReady) {
      writeData(path, value).catch(console.error);
    }
  }, [firebaseReady]);

  const setPlayers = useCallback((players) => {
    syncToFirebase('players', players);
  }, [syncToFirebase]);

  const setNickname = useCallback((player, nickname) => {
    const updated = { ...state.nicknames, [player]: nickname };
    syncToFirebase('nicknames', updated);
  }, [syncToFirebase, state.nicknames]);

  const placeBet = useCallback((player, questionIndex, pick, amount) => {
    const playerBets = { ...(state.bets[player] || {}) };
    playerBets[questionIndex] = { pick, amount: Number(amount) };
    syncToFirebase(`bets/${player}`, playerBets);
  }, [syncToFirebase, state.bets]);

  const lockPlayer = useCallback((player) => {
    const updated = [...new Set([...state.lockedPlayers, player])];
    syncToFirebase('lockedPlayers', updated);
  }, [syncToFirebase, state.lockedPlayers]);

  const resolveQuestion = useCallback((questionIndex, outcomeType, actualPerson = null) => {
    const updated = {
      ...state.resolutions,
      [questionIndex]: {
        resolved: true,
        outcomeType,
        actualPerson,
        favoriteOverride: state.favoriteOverrides[questionIndex] || null,
        resolvedAt: new Date().toISOString(),
      },
    };
    syncToFirebase('resolutions', updated);
  }, [syncToFirebase, state.resolutions, state.favoriteOverrides]);

  const unresolveQuestion = useCallback((questionIndex) => {
    const updated = { ...state.resolutions };
    delete updated[questionIndex];
    syncToFirebase('resolutions', updated);
  }, [syncToFirebase, state.resolutions]);

  const setFavoriteOverride = useCallback((questionIndex, player) => {
    const updated = { ...state.favoriteOverrides, [questionIndex]: player };
    syncToFirebase('favoriteOverrides', updated);
  }, [syncToFirebase, state.favoriteOverrides]);

  const setGamePhase = useCallback((phase) => {
    syncToFirebase('gamePhase', phase);
  }, [syncToFirebase]);

  const resetGame = useCallback(() => {
    writeData('', defaultState).catch(console.error);
  }, []);

  const value = {
    ...state,
    questions: QUESTIONS,
    loading,
    firebaseReady,
    setPlayers,
    setNickname,
    placeBet,
    lockPlayer,
    resolveQuestion,
    unresolveQuestion,
    setFavoriteOverride,
    setGamePhase,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
