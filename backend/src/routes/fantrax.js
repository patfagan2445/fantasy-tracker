const express = require('express');
const axios = require('axios');
const router = express.Router();
router.get('/roster', async (req, res) => {
  const { leagueId } = req.query;
  const sessionCookie = req.headers['fantrax-session'];
  if (!sessionCookie) return res.status(401).json({ error: 'Missing Fantrax session cookie' });
  if (!leagueId) return res.status(400).json({ error: 'leagueId required' });
  try {
    const response = await axios.post('https://www.fantrax.com/fxpa/req', { msgs: [{ method: 'getTeamRosterInfo', data: { leagueId, period: 'CURRENT' } }] }, { headers: { 'Content-Type': 'application/json', 'Cookie': 'fantrax.session=' + sessionCookie, 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.fantrax.com' } });
    const rosterData = response.data?.responses?.[0]?.data;
    if (!rosterData) return res.status(404).json({ error: 'No roster data' });
    const players = [];
    const rows = rosterData.tableList?.[0]?.rows || [];
    rows.forEach(row => {
      const name = row.columns?.find(c => c.columnType === 'PLAYER')?.playerInfo?.fullName;
      const team = row.columns?.find(c => c.columnType === 'TEAM')?.content;
      const pos = row.columns?.find(c => c.columnType === 'POSITION')?.content;
      const slot = row.columns?.find(c => c.columnType === 'ROSTER_STATUS')?.content;
      if (name && slot !== 'BN' && slot !== 'IL') players.push({ name, team, pos, source: 'Fantrax' });
    });
    res.json({ players });
  } catch (err) {
    res.status(500).json({ error: 'Fantrax API error', detail: err.message });
  }
});
module.exports = router;
