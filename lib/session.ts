const SESSION_KEY = "eventify.session";
const MAX_IDLE_MS = 60 * 60 * 1000;

type SessionPayload = { lastActive: number };

export const setSessionActive = () => {
  const payload: SessionPayload = { lastActive: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const isSessionValid = () => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as SessionPayload;
    if (!parsed?.lastActive) {
      return false;
    }
    return Date.now() - parsed.lastActive < MAX_IDLE_MS;
  } catch {
    return false;
  }
};
