const OWNER = 'singh2107akash';
const REPO = 'Montreal';
const FILE_PATH = 'game-state.json';
const BRANCH = 'main';

let cachedSha = null;
let cachedState = null;
let etag = null;

function getToken() {
  return localStorage.getItem('sacre-bleu-bets-code') || '';
}

export function setToken(token) {
  localStorage.setItem('sacre-bleu-bets-code', token);
}

export function hasToken() {
  return !!getToken();
}

export function clearToken() {
  localStorage.removeItem('sacre-bleu-bets-code');
}

async function apiRequest(method, body = null, extraHeaders = {}) {
  const token = getToken();
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    ...(token && { 'Authorization': `token ${token}` }),
    ...(body && { 'Content-Type': 'application/json' }),
    ...extraHeaders,
  };

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
  const res = await fetch(url, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  });

  return res;
}

export async function readState() {
  try {
    const headers = {};
    if (etag) headers['If-None-Match'] = etag;

    const res = await apiRequest('GET', null, headers);

    if (res.status === 304) {
      return cachedState;
    }

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `GitHub API error: ${res.status}`);
    }

    const data = await res.json();
    etag = res.headers.get('etag');
    cachedSha = data.sha;

    const content = JSON.parse(atob(data.content));
    cachedState = content;
    return content;
  } catch (err) {
    console.error('Failed to read state:', err);
    if (cachedState) return cachedState;
    throw err;
  }
}

export async function writeState(state, retries = 3) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(state, null, 2))));

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Always get latest SHA before writing
      if (attempt > 0 || !cachedSha) {
        const current = await apiRequest('GET');
        if (current.ok) {
          const data = await current.json();
          cachedSha = data.sha;
        }
      }

      const body = {
        message: `Update game state`,
        content,
        branch: BRANCH,
        ...(cachedSha && { sha: cachedSha }),
      };

      const res = await apiRequest('PUT', body);

      if (res.ok) {
        const data = await res.json();
        cachedSha = data.content.sha;
        cachedState = state;
        etag = null; // invalidate etag after write
        return true;
      }

      if (res.status === 409 && attempt < retries) {
        // SHA conflict - retry with fresh SHA
        cachedSha = null;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }

      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Write failed: ${res.status}`);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

export async function validateToken() {
  try {
    const res = await apiRequest('GET');
    if (res.ok) return { valid: true, exists: true };
    if (res.status === 404) return { valid: true, exists: false };
    if (res.status === 401 || res.status === 403) return { valid: false, exists: false };
    return { valid: false, exists: false };
  } catch {
    return { valid: false, exists: false };
  }
}

let pollInterval = null;

export function startPolling(callback, intervalMs = 10000) {
  stopPolling();
  const poll = async () => {
    try {
      const state = await readState();
      if (state) callback(state);
    } catch (err) {
      console.error('Poll error:', err);
    }
  };
  poll(); // immediate first read
  pollInterval = setInterval(poll, intervalMs);
}

export function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
