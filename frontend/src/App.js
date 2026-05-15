import React, { useState, useEffect, useCallback } from 'react';
import { fetchCombinedRoster, openMLBTV, saveCreds } from './utils/api';
import { useLiveTracker, useNotifications } from './hooks/useLiveTracker';
import './App.css';

const TABS = ['Roster', 'Live', 'Platforms', 'Settings'];

const POS_COLORS = {
  P: '#e8e0fa:#4a2fa0', C: '#fde8e8:#992020',
  '1B': '#e8f0fa:#1a4a7a', '2B': '#e8f0fa:#1a4a7a',
  '3B': '#e8f0fa:#1a4a7a', SS: '#e8f0fa:#1a4a7a',
  OF: '#e8f5ee:#1a5c3a', DH: '#fff0dc:#7a3f00'
};

function PosBadge({ pos }) {
  const colors = POS_COLORS[pos] || '#f0f0f0:#666';
  const [bg, fg] = colors.split(':');
  return (
    <span style={{ background: bg, color: fg, padding: '2px 6px', borderRadius: 4,
      fontSize: 11, fontFamily: 'IBM Plex Mono,monospace', fontWeight: 500 }}>
      {pos}
    </span>
  );
}

function AlertBanner({ alert, onDismiss }) {
  return (
    <div className="alert-banner">
      <div>
        <strong>{alert.player.name}</strong> is {alert.situation === 'batting' ? '🏏 at bat' : '⚾ pitching'} —&nbsp;
        {alert.inning} · {alert.score}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button className="watch-btn" onClick={() => openMLBTV(alert.gamePk)}>▶ Watch</button>
        <button className="dismiss-btn" onClick={onDismiss}>×</button>
      </div>
    </div>
  );
}

function RosterTab({ players, activePlayers, loading }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const activeMap = Object.fromEntries(activePlayers.map(a => [a.player.name, a]));
  const filtered = players.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
      || p.team.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all'
      || (filter === 'active' && activeMap[p.name])
      || filter === p.source;
    return matchSearch && matchFilter;
  });
  return (
    <div>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-val">{players.length}</div><div className="stat-label">Players</div></div>
        <div className="stat-card"><div className="stat-val amber">{activePlayers.length}</div><div className="stat-label">Active Now</div></div>
        <div className="stat-card"><div className="stat-val">{[...new Set(players.map(p => p.source))].length}</div><div className="stat-label">Platforms</div></div>
        <div className="stat-card"><div className="stat-val">{[...new Set(players.map(p => p.team))].length}</div><div className="stat-label">Teams</div></div>
      </div>
      <div className="search-row">
        <input className="search-input" placeholder="Search players or teams..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active Now</option>
          <option value="ESPN">ESPN</option>
          <option value="Yahoo">Yahoo</option>
          <option value="Fantrax">Fantrax</option>
          <option value="Manual">Manual</option>
        </select>
      </div>
      {loading ? (
        <div className="loading-state">Loading roster...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">⚾ No players match your search</div>
      ) : (
        <div className="player-table">
          <div className="player-row header">
            <span>Pos</span><span>Player</span><span>Source</span>
            <span>Status</span><span>Situation</span><span>Watch</span>
          </div>
          {filtered.map(p => {
            const active = activeMap[p.name];
            return (
              <div key={`${p.name}_${p.source}`} className={`player-row ${active ? 'active-row' : ''}`}>
                <PosBadge pos={p.pos} />
                <div>
                  <div className="player-name">{p.name}</div>
                  <div className="player-meta">{p.team}</div>
                </div>
                <span className={`source-pill src-${p.source}`}>{p.source}</span>
                <div style={{ fontSize: 12 }}>
                  {active ? <span style={{ color: '#e74c3c' }}>● {active.inning}</span> : <span style={{ color: '#999' }}>Sched.</span>}
                </div>
                <div>
                  {active?.situation === 'batting' && <span className="badge-amber">⚡ At Bat</span>}
                  {active?.situation === 'pitching' && <span className="badge-red">⚾ Pitching</span>}
                  {!active && <span style={{ color: '#999', fontSize: 12 }}>–</span>}
                </div>
                <button className={`watch-mini ${active ? 'watch-active' : ''}`}
                  disabled={!active} onClick={() => active && openMLBTV(active.gamePk)}>
                  ▶ TV
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LiveTab({ activePlayers }) {
  if (!activePlayers.length) {
    return (
      <div className="empty-state" style={{ paddingTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚾</div>
        <div>No roster players currently at bat or pitching</div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Checks every 30 seconds during live games</div>
      </div>
    );
  }
  return (
    <div>
      <div className="section-header">
        <span className="section-title">Active Right Now</span>
        <span className="badge-red">{activePlayers.length} Live</span>
      </div>
      {activePlayers.map((item, i) => (
        <div key={i} className="live-card">
          <div className="live-card-top">
            <div>
              <div className="live-player-name">{item.player.name}</div>
              <div className="live-meta">{item.player.team} · {item.inning} · {item.score}</div>
              {item.count && <div className="live-count">{item.count}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              {item.situation === 'batting'
                ? <span className="badge-amber large">🏏 At Bat</span>
                : <span className="badge-red large">⚾ Pitching</span>}
              <span className={`source-pill src-${item.player.source}`}>{item.player.source}</span>
            </div>
          </div>
          <button className="watch-full-btn" onClick={() => openMLBTV(item.gamePk)}>
            ▶ Watch on MLB.tv
          </button>
        </div>
      ))}
    </div>
  );
}

function PlatformsTab({ config, onSave, players, onAddPlayer, onRemovePlayer }) {
  const [espnS2, setEspnS2] = useState(config.ESPN?.s2 || '');
  const [espnSwid, setEspnSwid] = useState(config.ESPN?.swid || '');
  const [espnLeague, setEspnLeague] = useState(config.leagues?.ESPN || '');
  const [yahooTeam, setYahooTeam] = useState(config.leagues?.Yahoo || '');
  const [fantraxSession, setFantraxSession] = useState(config.Fantrax?.session || '');
  const [fantraxLeague, setFantraxLeague] = useState(config.leagues?.Fantrax || '');
  const [manualName, setManualName] = useState('');
  const [manualTeam, setManualTeam] = useState('');
  const [manualPos, setManualPos] = useState('OF');

  const handleSave = () => {
    if (espnS2 && espnSwid) saveCreds('ESPN', { s2: espnS2, swid: espnSwid });
    if (fantraxSession) saveCreds('Fantrax', { session: fantraxSession });
    onSave({ leagues: { ESPN: espnLeague, Yahoo: yahooTeam, Fantrax: fantraxLeague } });
  };

  const handleAddPlayer = () => {
    if (!manualName || !manualTeam) return;
    onAddPlayer({ name: manualName, team: manualTeam.toUpperCase(), pos: manualPos, source: 'Manual' });
    setManualName('');
    setManualTeam('');
  };

  return (
    <div>
      <div className="platform-section">
        <div className="platform-header" style={{ background: '#f0f5e8' }}>
          <span className="platform-name" style={{ color: '#1a5c3a' }}>Manual Roster</span>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px auto', gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Player name"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
              style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13 }}
            />
            <input
              placeholder="Team"
              value={manualTeam}
              onChange={e => setManualTeam(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, textTransform: 'uppercase' }}
            />
            <select
              value={manualPos}
              onChange={e => setManualPos(e.target.value)}
              style={{ padding: '8px 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, background: 'white' }}
            >
              {['C','1B','2B','3B','SS','OF','P','DH'].map(p => <option key={p}>{p}</option>)}
            </select>
            <button
              onClick={handleAddPlayer}
              style={{ padding: '8px 12px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 6, fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              + Add
            </button>
          </div>
          <div className="field-hint">Use the player's last name exactly as it appears on MLB.com (e.g. "Ohtani", "Judge")</div>
        </div>
        {players.filter(p => p.source === 'Manual').length > 0 && (
          <div>
            {players.filter(p => p.source === 'Manual').map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PosBadge pos={p.pos} />
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.team}</span>
                </div>
                <button
                  onClick={() => onRemovePlayer(p.name)}
                  style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 18, cursor: 'pointer', padding: '0 4px' }}
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="platform-section">
        <div className="platform-header espn">
          <span className="platform-name">ESPN Fantasy</span>
        </div>
        <div className="field-group">
          <label>League ID</label>
          <input value={espnLeague} onChange={e => setEspnLeague(e.target.value)} placeholder="e.g. 12345678" />
          <div className="field-hint">In your ESPN Fantasy URL: ?leagueId=XXXXXXXX</div>
        </div>
        <div className="field-group">
          <label>ESPN_S2 Cookie</label>
          <input value={espnS2} onChange={e => setEspnS2(e.target.value)} placeholder="Paste ESPN_S2 value" type="password" />
        </div>
        <div className="field-group">
          <label>SWID Cookie</label>
          <input value={espnSwid} onChange={e => setEspnSwid(e.target.value)} placeholder="{XXXXXXXX-XXXX-...}" />
          <div className="field-hint">DevTools → Application → Cookies → fantasy.espn.com</div>
        </div>
      </div>

      <div className="platform-section">
        <div className="platform-header yahoo">
          <span className="platform-name">Yahoo Fantasy</span>
        </div>
        <div className="field-group">
          <label>Team Key</label>
          <input value={yahooTeam} onChange={e => setYahooTeam(e.target.value)} placeholder="mlb.l.LEAGUEID.t.TEAMID" />
        </div>
        <div className="oauth-row">
          <div className="field-hint" style={{ flex: 1 }}>Tap Connect to authorize Yahoo</div>
          <button className="connect-btn yahoo" onClick={() => window.location.href = '/api/yahoo/auth'}>
            Connect Yahoo
          </button>
        </div>
      </div>

      <div className="platform-section">
        <div className="platform-header fantrax">
          <span className="platform-name">Fantrax</span>
        </div>
        <div className="field-group">
          <label>League ID</label>
          <input value={fantraxLeague} onChange={e => setFantraxLeague(e.target.value)} placeholder="e.g. abc123def456" />
        </div>
        <div className="field-group">
          <label>Session Cookie</label>
          <input value={fantraxSession} onChange={e => setFantraxSession(e.target.value)} placeholder="Paste fantrax.session value" type="password" />
          <div className="field-hint">DevTools → Application → Cookies → fantrax.com</div>
        </div>
      </div>

      <button className="save-btn" onClick={handleSave}>Save Platform Settings</button>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <div className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}>
      <div className="toggle-thumb" />
    </div>
  );
}

function SettingsTab({ prefs, onPrefsChange, notifications }) {
  const { permission, requestPermission } = notifications;
  return (
    <div>
      <div className="settings-section">
        <div className="settings-title">Notifications</div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Browser / Mobile Alerts</div>
            <div className="setting-desc">Notify when a player is at bat or pitching</div>
          </div>
          {permission === 'granted'
            ? <span className="badge-green">✓ Enabled</span>
            : <button className="connect-btn" onClick={requestPermission}>Enable</button>}
        </div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Auto-open MLB.tv</div>
            <div className="setting-desc">Skip the alert — open the game immediately</div>
          </div>
          <Toggle value={prefs.autoOpen} onChange={v => onPrefsChange({ ...prefs, autoOpen: v })} />
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title">Polling</div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Refresh Interval</div>
            <div className="setting-desc">How often to check MLB Stats API</div>
          </div>
          <select className="filter-select" value={prefs.interval || 30}
            onChange={e => onPrefsChange({ ...prefs, interval: Number(e.target.value) })}>
            <option value={30}>30 sec</option>
            <option value={60}>1 min</option>
            <option value={120}>2 min</option>
          </select>
        </div>
      </div>
      <div className="settings-section">
        <div className="settings-title">Test</div>
        <div className="setting-row">
          <div>
            <div className="setting-label">Test Notification</div>
            <div className="setting-desc">Fire a fake alert to test push and MLB.tv</div>
          </div>
          <button className="connect-btn" onClick={() => {
            fetch(process.env.REACT_APP_API_URL + '/api/notify/test')
              .then(r => r.json())
              .then(d => alert(d.success ? 'Notification sent! Check your phone.' : 'Error: ' + d.error))
              .catch(e => alert('Error: ' + e.message));
          }}>
            Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('Roster');
  const [players, setPlayers] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [rosterError, setRosterError] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [prefs, setPrefs] = useState({ autoOpen: false, atBat: true, pitching: true, interval: 30 });
  const [manualPlayers, setManualPlayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ft_manual_players') || '[]'); } catch { return []; }
  });
  const [platformConfig, setPlatformConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ft_config') || '{}'); } catch { return {}; }
  });

  const handleAddPlayer = (player) => {
    const updated = [...manualPlayers, player];
    setManualPlayers(updated);
    localStorage.setItem('ft_manual_players', JSON.stringify(updated));
  };

  const handleRemovePlayer = (name) => {
    const updated = manualPlayers.filter(p => p.name !== name);
    setManualPlayers(updated);
    localStorage.setItem('ft_manual_players', JSON.stringify(updated));
  };

  const notifications = useNotifications();
  const allPlayers = [...players, ...manualPlayers];
  const { activePlayers, lastCheck, isPolling, checkNow } = useLiveTracker(allPlayers, true);

  const visibleAlerts = activePlayers.filter(a =>
    !dismissedAlerts.has(`${a.player.name}_${a.situation}_${a.inning}`)
  );

  const loadRoster = useCallback(async () => {
    if (!platformConfig.leagues) return;
    setLoadingRoster(true);
    setRosterError(null);
    try {
      const result = await fetchCombinedRoster(platformConfig.leagues);
      setPlayers(result.players);
      if (result.errors.length) {
        setRosterError(result.errors.map(e => `${e.platform}: ${e.error}`).join(' · '));
      }
    } catch (e) {
      setRosterError(e.message);
    } finally {
      setLoadingRoster(false);
    }
  }, [platformConfig.leagues]);

  useEffect(() => { loadRoster(); }, [loadRoster]);

  const handlePlatformSave = (config) => {
    const merged = { ...platformConfig, ...config };
    setPlatformConfig(merged);
    localStorage.setItem('ft_config', JSON.stringify(merged));
    loadRoster();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">⚾</div>
          <div className="app-title">Fantasy <span>Live</span></div>
        </div>
        <div className="header-right">
          {isPolling && <div className="polling-indicator" />}
          <div className="last-check">
            {lastCheck ? lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--'}
          </div>
          <button className="refresh-btn" onClick={checkNow}>↻</button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
            {t === 'Live' && activePlayers.length > 0 && (
              <span className="tab-badge">{activePlayers.length}</span>
            )}
          </button>
        ))}
      </nav>

      {rosterError && <div className="error-bar">⚠ {rosterError}</div>}

      <div className="alerts-container">
        {visibleAlerts.map((alert, i) => (
          <AlertBanner key={i} alert={alert}
            onDismiss={() => setDismissedAlerts(prev =>
              new Set([...prev, `${alert.player.name}_${alert.situation}_${alert.inning}`])
            )} />
        ))}
      </div>

      <main className="main">
        {tab === 'Roster' && <RosterTab players={allPlayers} activePlayers={activePlayers} loading={loadingRoster} />}
        {tab === 'Live' && <LiveTab activePlayers={activePlayers} />}
        {tab === 'Platforms' && <PlatformsTab config={platformConfig} onSave={handlePlatformSave} players={allPlayers} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} />}
        {tab === 'Settings' && <SettingsTab prefs={prefs} onPrefsChange={setPrefs} notifications={notifications} />}
      </main>
    </div>
  );
}
