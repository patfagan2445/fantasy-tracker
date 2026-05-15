const BASE = process.env.REACT_APP_API_URL || '';

const getCreds = () => {
  try { return JSON.parse(localStorage.getItem('ft_creds') || '{}'); }
  catch { return {}; }
};

export const saveCreds = (platform, data) => {
  const creds = getCreds();
  creds[platform] = data;
  localStorage.setItem('ft_creds', JSON.stringify(creds));
};

const authHeaders = (platform) => {
  const creds = getCreds();
  switch (platform) {
    case 'ESPN':
      return { 'espn_s2': creds.ESPN?.s2 || '', 'swid': creds.ESPN?.swid || '' };
    case 'Yahoo':
      return { 'Authorization': `Bearer ${creds.Yahoo?.accessToken || ''}` };
    case 'Fantrax':
      return { 'fantrax-session': creds.Fantrax?.session || '' };
    default:
      return {};
  }
};

const call = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.detail || `HTTP ${res.status}`);
  }
  return res.json();
};

export const fetchESPNRoster = (leagueId, teamId) =>
  call(`/api/espn/roster?leagueId=${leagueId}&teamId=${teamId}`, { headers: authHeaders('ESPN') });

export const fetchYahooRoster = (teamKey) =>
  call(`/api/yahoo/roster?teamKey=${teamKey}`, { headers: authHeaders('Yahoo') });

export const fetchFantraxRoster = (leagueId) =>
  call(`/api/fantrax/roster?leagueId=${leagueId}`, { headers: authHeaders('Fantrax') });

export const fetchCombinedRoster = async (leagues) => {
  const results = { players: [], errors: [] };

  if (leagues.ESPN) {
    try {
      const d = await fetchESPNRoster(leagues.ESPN, leagues.ESPNTeamId || '4');
      results.players.push(...d.players);
    } catch (e) { results.errors.push({ platform: 'ESPN', error: e.message }); }
  }

  if (leagues.Yahoo) {
    try {
      const d = await fetchYahooRoster(leagues.Yahoo);
      results.players.push(...d.players);
    } catch (e) { results.errors.push({ platform: 'Yahoo', error: e.message }); }
  }

  if (leagues.Fantrax) {
    try {
      const d = await fetchFantraxRoster(leagues.Fantrax);
      results.players.push(...d.players);
    } catch (e) { results.errors.push({ platform: 'Fantrax', error: e.message }); }
  }

  const seen = new Set();
  results.players = results.players.filter(p => {
    const k = `${p.name}_${p.team}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return results;
};

export const checkRosterActive = (players) =>
  call('/api/mlb/check-roster', {
    method: 'POST',
    body: JSON.stringify({ players })
  });

export const getVapidKey = () => call('/api/notify/vapid-public-key');

export const sendSubscription = (subscription) =>
  call('/api/notify/subscribe', {
    method: 'POST',
    body: JSON.stringify({ subscription, userId: 'default' })
  });

export const openMLBTV = (gamePk) => {
  const url = `https://www.mlb.com/tv/g${gamePk}`;
  window.open(url, '_blank', 'noopener');
};
