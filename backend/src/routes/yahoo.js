const express = require('express');
const axios = require('axios');
const router = express.Router();
const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const YAHOO_API_BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';
router.get('/auth', (req, res) => {
  const { YAHOO_CLIENT_ID, YAHOO_REDIRECT_URI } = process.env;
  if (!YAHOO_CLIENT_ID) return res.status(500).json({ error: 'YAHOO_CLIENT_ID not set' });
  const params = new URLSearchParams({ client_id: YAHOO_CLIENT_ID, redirect_uri: YAHOO_REDIRECT_URI, response_type: 'code', scope: 'fspt-r' });
  res.redirect('https://api.login.yahoo.com/oauth2/request_auth?' + params);
});
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, YAHOO_REDIRECT_URI } = process.env;
  try {
    const response = await axios.post(YAHOO_TOKEN_URL, new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: YAHOO_REDIRECT_URI }), { auth: { username: YAHOO_CLIENT_ID, password: YAHOO_CLIENT_SECRET }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    const { access_token, refresh_token } = response.data;
    res.redirect((process.env.FRONTEND_URL || 'http://localhost:3000') + '/auth/yahoo/success?token=' + access_token + '&refresh=' + refresh_token);
  } catch (err) {
    res.status(500).json({ error: 'Yahoo OAuth failed', detail: err.message });
  }
});
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const { YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET } = process.env;
  try {
    const response = await axios.post(YAHOO_TOKEN_URL, new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }), { auth: { username: YAHOO_CLIENT_ID, password: YAHOO_CLIENT_SECRET }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    res.json({ accessToken: response.data.access_token });
  } catch (err) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
router.get('/roster', async (req, res) => {
  const { teamKey } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing Yahoo token' });
  if (!teamKey) return res.status(400).json({ error: 'teamKey required' });
  try {
    const response = await axios.get(YAHOO_API_BASE + '/team/' + teamKey + '/roster/players', { params: { format: 'json' }, headers: { Authorization: 'Bearer ' + token } });
    const rosterData = response.data.fantasy_content?.team?.[1]?.roster?.['0']?.players;
    const players = [];
    if (rosterData) {
      for (let i = 0; i < rosterData.count; i++) {
        const p = rosterData[i]?.player;
        if (!p) continue;
        const info = p[0];
        const name = info?.find(x => x?.name)?.name;
        const pos = info?.find(x => x?.selected_position)?.[1]?.position;
        const teamAbbr = info?.find(x => x?.editorial_team_abbr)?.editorial_team_abbr?.toUpperCase();
        if (name && pos && pos !== 'BN' && pos !== 'IL') players.push({ name: name.full, team: teamAbbr, pos, source: 'Yahoo' });
      }
    }
    res.json({ players });
  } catch (err) {
    res.status(500).json({ error: 'Yahoo API error', detail: err.message });
  }
});
module.exports = router;
