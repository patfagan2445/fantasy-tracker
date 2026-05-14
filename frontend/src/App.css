@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;500;600;700&family=Barlow:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #1a5c3a;
  --green-mid: #2d7a52;
  --green-light: #e8f5ee;
  --amber: #d4870a;
  --amber-light: #fff3dc;
  --red: #c0392b;
  --red-light: #fdecea;
  --blue: #1a4a7a;
  --blue-light: #e8f0fa;
  --bg: #f4f2ed;
  --surface: #ffffff;
  --border: rgba(0,0,0,0.08);
  --text: #1a1a1a;
  --muted: #6b6b6b;
}

html, body, #root { height: 100%; }

body {
  font-family: 'Barlow', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app { display: flex; flex-direction: column; min-height: 100vh; }

.app-header {
  background: var(--green);
  padding: 12px 16px;
  padding-top: max(12px, env(safe-area-inset-top));
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 3px solid var(--amber);
  position: sticky; top: 0; z-index: 100;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.app-logo { font-size: 20px; }
.app-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 1px; }
.app-title span { color: var(--amber); }
.header-right { display: flex; align-items: center; gap: 8px; }
.last-check { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.7); }
.polling-indicator { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 1s infinite; }
.refresh-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 6px; color: #fff; padding: 4px 10px; font-size: 16px; cursor: pointer; }

.tabs { display: flex; background: var(--surface); border-bottom: 1px solid var(--border); }
.tab { flex: 1; padding: 10px 4px; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 0.3px; text-transform: uppercase; cursor: pointer; border: none; background: none; color: var(--muted); border-bottom: 2px solid transparent; transition: all 0.15s; }
.tab.active { color: var(--green); border-bottom-color: var(--green); }
.tab-badge { background: var(--red); color: #fff; font-size: 10px; border-radius: 8px; padding: 1px 5px; margin-left: 4px; font-family: 'IBM Plex Mono', monospace; }

.alerts-container { padding: 0 12px; padding-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.alert-banner { background: var(--amber); color: #fff; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; animation: slideIn 0.3s ease; }
@keyframes slideIn { from{transform:translateY(-6px);opacity:0} to{transform:translateY(0);opacity:1} }
.alert-banner strong { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; }
.watch-btn { background: #fff; color: var(--amber); border: none; border-radius: 6px; padding: 6px 12px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; cursor: pointer; white-space: nowrap; }
.dismiss-btn { background: rgba(255,255,255,0.2); border: none; color: #fff; width: 24px; height: 24px; border-radius: 50%; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.error-bar { background: var(--red-light); color: var(--red); padding: 8px 16px; font-size: 12px; }

.main { padding: 12px 12px 32px; flex: 1; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 12px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 8px; text-align: center; }
.stat-val { font-family: 'Barlow Condensed', sans-serif; font-size: 24px; font-weight: 700; color: var(--green); line-height: 1; }
.stat-val.amber { color: var(--amber); }
.stat-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.search-row { display: flex; gap: 8px; margin-bottom: 10px; }
.search-input { flex: 1; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; background: var(--surface); outline: none; min-width: 0; }
.search-input:focus { border-color: var(--green); }
.filter-select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; background: var(--surface); outline: none; cursor: pointer; }

.player-table { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.player-row { display: grid; grid-template-columns: 34px 1fr 52px 56px 70px 44px; align-items: center; padding: 9px 12px; border-bottom: 1px solid var(--border); gap: 6px; }
.player-row:last-child { border-bottom: none; }
.player-row.header { background: #f9f8f5; font-family: 'Barlow Condensed', sans-serif; font-weight: 600; font-size: 11px; text-transform: uppercase; color: var(--muted); border-bottom: 2px solid var(--border); }
.player-row.active-row { background: var(--amber-light); border-left: 3px solid var(--amber); padding-left: 9px; }
.player-name { font-weight: 500; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.player-meta { font-size: 11px; color: var(--muted); }

.source-pill { font-size: 10px; padding: 1px 5px; border-radius: 6px; font-family: 'IBM Plex Mono', monospace; font-weight: 500; white-space: nowrap; }
.src-ESPN { background: #ffeae8; color: #c0392b; }
.src-Yahoo { background: #e8eeff; color: #4040cc; }
.src-Fantrax { background: #f0e8ff; color: #6a20b0; }

.badge-amber { background: var(--amber-light); color: var(--amber); font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.badge-red { background: var(--red-light); color: var(--red); font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.badge-green { background: var(--green-light); color: var(--green); font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.badge-amber.large, .badge-red.large { font-size: 13px; padding: 4px 10px; }

.watch-mini { background: var(--green); color: #fff; border: none; border-radius: 5px; padding: 4px 6px; font-size: 11px; font-weight: 700; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; cursor: pointer; white-space: nowrap; }
.watch-mini:disabled { background: #e0e0e0; color: #aaa; cursor: not-allowed; }
.watch-mini.watch-active { background: var(--amber); }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
.live-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px; margin-bottom: 10px; border-left: 4px solid var(--amber); }
.live-card-top { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.live-player-name { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; }
.live-meta { font-size: 13px; color: var(--muted); }
.live-count { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: var(--green); margin-top: 4px; }
.watch-full-btn { width: 100%; background: var(--green); color: #fff; border: none; border-radius: 8px; padding: 12px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }

.empty-state { text-align: center; padding: 40px 20px; color: var(--muted); font-size: 14px; }
.loading-state { text-align: center; padding: 40px 20px; color: var(--muted); }

.platform-section { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
.platform-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.platform-header.espn { background: #fff3f3; }
.platform-header.yahoo { background: #f0f0ff; }
.platform-header.fantrax { background: #f5f0ff; }
.platform-name { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 17px; text-transform: uppercase; }
.field-group { padding: 10px 16px; border-bottom: 1px solid var(--border); }
.field-group label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin-bottom: 4px; }
.field-group input { width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; font-family: 'IBM Plex Mono', monospace; background: var(--bg); outline: none; }
.field-group input:focus { border-color: var(--green); background: #fff; }
.field-hint { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.5; }
.oauth-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.connect-btn { padding: 8px 16px; border-radius: 6px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 14px; text-transform: uppercase; cursor: pointer; border: 1.5px solid var(--green); background: var(--green); color: #fff; white-space: nowrap; }
.connect-btn.yahoo { border-color: #4040cc; background: #4040cc; }
.save-btn { width: 100%; padding: 14px; background: var(--green); color: #fff; border: none; border-radius: 8px; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }

.settings-section { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
.settings-title { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); padding: 10px 16px; border-bottom: 1px solid var(--border); background: #f9f8f5; }
.setting-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); gap: 12px; }
.setting-row:last-child { border-bottom: none; }
.setting-label { font-weight: 500; font-size: 14px; }
.setting-desc { font-size: 12px; color: var(--muted); }

.toggle { width: 44px; height: 24px; border-radius: 12px; background: #ddd; position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0; }
.toggle.on { background: var(--green); }
.toggle-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 3px; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
.toggle.on .toggle-thumb { transform: translateX(20px); }

@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
.main { padding-bottom: max(32px, env(safe-area-inset-bottom)); }
