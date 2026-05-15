const express = require('express');
const axios = require('axios');
const router = express.Router();

const MLB_API = 'https://statsapi.mlb.com/api/v1';

function getTodayET() {
  const now = new Date();
  const etOffset = -4; // EDT (use -5 for EST in winter)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const et = new Date(utc + 3600000 * etOffset);
  return et.toISOString().split('T')[0];
}

router.get('/schedule', async (req, res) => {
  const cache = req.gameCache;
  const cached = cache.get('mlb_schedule');
  if (cached) return res.json(cached);

  try {
    const today = getTodayET();
    console.log('Fetching schedule for:', today);
    const response = await axios.get(`${MLB_API}/schedule`, {
      params: {
        sportId: 1,
        date: today,
        hydrate: 'linescore,probablePitcher,team'
      }
    });

    const games = response.data.dates?.[0]?.games || [];
    const simplified = games.map(g => ({
      gamePk: g.gamePk,
      status: g.status?.detailedState,
      abstractState: g.status?.abstractGameState,
      homeTeam: g.teams?.home?.team?.abbreviation,
      awayTeam: g.teams?.away?.team?.abbreviation,
      homeScore: g.teams?.home?.score,
      awayScore: g.teams?.away?.score,
      inning: g.linescore?.currentInning,
      inningOrdinal: g.linescore?.currentInningOrdinal,
      inningState: g.linescore?.inningState,
      isLive: g.status?.abstractGameState === 'Live',
      isFinal: g.status?.abstractGameState === 'Final',
    }));

    cache.set('mlb_schedule', simplified);
    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: 'MLB schedule fetch failed', detail: err.message });
  }
});

router.get('/game/:gamePk/live', async (req, res) => {
  const { gamePk } = req.params;
  const cache = req.gameCache;
  const cacheKey = `live_${gamePk}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
    const live = response.data.liveData;
    const matchup = live?.plays?.currentPlay?.matchup;
    const linescore = live?.linescore;
    const gameData = response.data.gameData;

    const result = {
      gamePk,
      inning: linescore?.currentInning,
      inningOrdinal: linescore?.currentInningOrdinal,
      inningState: linescore?.inningState,
      homeTeam: gameData?.teams?.home?.abbreviation,
      awayTeam: gameData?.teams?.away?.abbreviation,
      homeScore: linescore?.teams?.home?.runs,
      awayScore: linescore?.teams?.away?.runs,
      currentBatter: matchup?.batter ? {
        id: matchup.batter.id,
        name: matchup.batter.fullName,
      } : null,
      currentPitcher: matchup?.pitcher ? {
        id: matchup.pitcher.id,
        name: matchup.pitcher.fullName,
      } : null,
      balls: linescore?.balls,
      strikes: linescore?.strikes,
      outs: linescore?.outs,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'MLB live feed failed', detail: err.message });
  }
});

router.post('/check-roster', async (req, res) => {
  const { players } = req.body;
  if (!players?.length) return res.json({ active: [] });

  try {
    const today = getTodayET();
    console.log('Checking roster for date:', today);
    const schedResponse = await axios.get(`${MLB_API}/schedule`, {
      params: { sportId: 1, date: today }
    });

    const games = schedResponse.data.dates?.[0]?.games || [];
    const liveGames = games.filter(g => g.status?.abstractGameState === 'Live');
    console.log('Live games found:', liveGam
