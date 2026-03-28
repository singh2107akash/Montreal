import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { QUESTIONS, DEFAULT_PLAYERS, GAME_CONFIG } from './data/questions';
import { readState, writeState, startPolling, stopPolling, hasToken } from './github-storage';

const GameContext = createContext(null);

const defaultState = {
  players: DEFAULT_PLAYERS,
  nicknames: {},
  bets: {},
  lockedPlayers: [],
  resolutions: {},
  favoriteOverrides: {},
  playerPasswords: {},
  questions: QUESTIONS,
  gamePhase: 'setup',
  config: GAME_CONFIG,
};

export function GameProvider({ children }) {
  const [state, setState] = useState({ ...defaultState });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const data = await readState();
        if (data) {
          setState({ ...defaultState, ...data });
        } else {
          await writeState(defaultState);
        }
      } catch (err) {
        console.error('Init error:', err);
        setError(err.message);
      }
      setLoading(false);
    };

    init();

    startPolling((data) => {
      if (data) {
        setState((prev) => {
          const newStr = JSON.stringify(data);
          const prevStr = JSON.stringify({
            players: prev.players,
            nicknames: prev.nicknames,
            bets: prev.bets,
            lockedPlayers: prev.lockedPlayers,
            resolutions: prev.resolutions,
            favoriteOverrides: prev.favoriteOverrides,
            playerPasswords: prev.playerPasswords,
            questions: prev.questions,
            gamePhase: prev.gamePhase,
            config: prev.config,
          });
          if (newStr === prevStr) return prev;
          return { ...defaultState, ...data };
        });
      }
    }, 8000);

    return () => stopPolling();
  }, []);

  const save = useCallback(async (newState) => {
    setSaving(true);
    setError(null);
    try {
      const toSave = {
        players: newState.players,
        nicknames: newState.nicknames,
        bets: newState.bets,
        lockedPlayers: newState.lockedPlayers,
        resolutions: newState.resolutions,
        favoriteOverrides: newState.favoriteOverrides,
        playerPasswords: newState.playerPasswords,
        questions: newState.questions,
        gamePhase: newState.gamePhase,
        config: newState.config,
      };
      await writeState(toSave);
      setState(newState);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save. Try again.');
    }
    setSaving(false);
  }, []);

  const setPlayers = useCallback((players) => {
    const next = { ...stateRef.current, players };
    save(next);
  }, [save]);

  const setNickname = useCallback((player, nickname) => {
    const next = {
      ...stateRef.current,
      nicknames: { ...stateRef.current.nicknames, [player]: nickname },
    };
    save(next);
  }, [save]);

  const setPlayerPassword = useCallback((player, password) => {
    const next = {
      ...stateRef.current,
      playerPasswords: { ...stateRef.current.playerPasswords, [player]: password },
    };
    save(next);
  }, [save]);

  const setQuestions = useCallback((questions) => {
    const next = {
      ...stateRef.current,
      questions,
      config: { ...stateRef.current.config, questionCount: questions.length },
    };
    save(next);
  }, [save]);

  const placeBet = useCallback((player, questionIndex, pick, amount) => {
    setState((prev) => {
      const playerBets = { ...(prev.bets[player] || {}) };
      playerBets[questionIndex] = { pick, amount: Number(amount) };
      return { ...prev, bets: { ...prev.bets, [player]: playerBets } };
    });
  }, []);

  const lockPlayer = useCallback((player) => {
    const current = stateRef.current;
    const next = {
      ...current,
      bets: { ...current.bets },
      lockedPlayers: [...new Set([...current.lockedPlayers, player])],
    };
    save(next);
  }, [save]);

  const resolveQuestion = useCallback((questionIndex, outcomeType, actualPerson = null) => {
    const current = stateRef.current;
    const next = {
      ...current,
      resolutions: {
        ...current.resolutions,
        [questionIndex]: {
          resolved: true,
          outcomeType,
          actualPerson,
          favoriteOverride: current.favoriteOverrides[questionIndex] || null,
          resolvedAt: new Date().toISOString(),
        },
      },
    };
    save(next);
  }, [save]);

  const unresolveQuestion = useCallback((questionIndex) => {
    const current = stateRef.current;
    const resolutions = { ...current.resolutions };
    delete resolutions[questionIndex];
    save({ ...current, resolutions });
  }, [save]);

  const setFavoriteOverride = useCallback((questionIndex, player) => {
    const current = stateRef.current;
    const next = {
      ...current,
      favoriteOverrides: { ...current.favoriteOverrides, [questionIndex]: player },
    };
    save(next);
  }, [save]);

  const setGamePhase = useCallback((phase) => {
    save({ ...stateRef.current, gamePhase: phase });
  }, [save]);

  const resetGame = useCallback(() => {
    save({ ...defaultState });
  }, [save]);

  const value = {
    ...state,
    loading,
    error,
    saving,
    setPlayers,
    setNickname,
    setPlayerPassword,
    setQuestions,
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
