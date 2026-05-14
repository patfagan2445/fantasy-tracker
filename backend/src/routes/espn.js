const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/roster', async (req, res) => {
  const leagueId = req.query.leagueId || process.env.ESPN_LEAGUE_ID;
  const teamId = req.query.teamId || process.env.ESPN_TEAM_ID;
  const seasonId = req.query.seasonId || '2026';
  const espn_s2 = process.env.ESPN_S2;
  const swid = process.env.ESPN_SWID;

  if (!espn_s2 || !swid) {
    return res.status(401).json({ error: 'Missing ESPN credentials in environment variables' });
  }

  if (!leagueId) {
    return res.status(400).json({ error: 'leagueId required' });
  }

  try {
    const url = `https://fantasy.espn.com/apis/v3/games/flb/seasons/${seasonId}/segments/0/leagues/${leagueId}`;
    const response = await axios.get(url, {
      params: { view: 'mRoster' },
      headers: {
        Cookie: `espn_s2=${espn_s2}; SWID=${swid}`,
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://fantasy.espn.com',
        'X-Fantasy-Source': 'kona',
        'X-Fantasy-Platform': 'kona-PROD-m117f6986ef04e379a9cfa50041b29dce5a1dc06'
      }
    });

    const data = response.data;

    if (!data.teams || data.teams.length === 0) {
      return res.status(404).json({ 
        error: 'No teams found',
        detail: 'ESPN returned empty response — cookies may be expired'
      });
    }

    let myTeam = data.teams.find(t => t.id === Number(teamId));
    if (!myTeam) {
      myTeam = data.teams.find(t => t.roster?.entries?.length > 0);
    }
    if (!myTeam) {
      return res.status(404).json({
        error: 'Team not found',
        detail: `Available team IDs: ${data.teams.map(t => t.id).join(', ')}`
      });
    }

    const MLB_TEAM_MAP = {
      1:'BAL',2:'BOS',3:'LAA',4:'CWS',5:'CLE',6:'DET',7:'KC',8:'MIL',9:'MIN',
      10:'NYY',11:'OAK',12:'SEA',13:'TEX',14:'TOR',15:'ATL',16:'CHC',17:'CIN',
      18:'HOU',19:'LAD',20:'WSH',21:'NYM',22:'PHI',23:'PIT',24:'STL',25:'SD',
      26:'SF',27:'COL',28:'MIA',29:'ARI',30:'TB'
    };

    const POSITION_MAP = {
      0:'C',1:'1B',2:'2B',3:'3B',4:'SS',5:'OF',6:'OF',7:'OF',
      8:'DH',9:'P',10:'P',11:'P',12:'P',13:'P',14:'BN',15:'IL'
    };

    const players = myTeam.roster.entries.map(entry => ({
      id: entry.playerPoolEntry?.player?.id,
      name: entry.playerPoolEntry?.player?.fullName,
      team: MLB_TEAM_MAP[entry.playerPoolEntry?.player?.proTeamId] || 'UNK',
      pos: POSITION_MAP[entry.lineupSlotId] || 'BN',
      source: 'ESPN'
    })).filter(p => p.name && p.pos !== 'BN' && p.pos !== 'IL');

    res.json({
      players,
      teamName: myTeam.location + ' ' + myTeam.nickname,
      teamId: myTeam.id
    });

  } catch (err) {
    const status = err.response?.status;
    const detail = err.response?.data || err.message;
    console.error('ESPN error:', status, JSON.stringify(detail));
    if (status === 401) return res.status(401).json({ error: 'ESPN auth failed', detail });
    if (status === 404) return res.status(404).json({ error: 'League not found', detail });
    res.status(500).json({ error: 'ESPN API error', detail, status });
  }
});

module.exports = router;
