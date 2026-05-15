const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const SUBS_FILE = path.join('/tmp', 'subscriptions.json');

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
    vapidPublicKey,
    vapidPrivateKey
  );
}

function loadSubs() {
  try {
    if (fs.existsSync(SUBS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveSubs(subs) {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subs));
  } catch (e) {
    console.error('Failed to save subscriptions:', e);
  }
}

router.get('/vapid-public-key', (req, res) => {
  if (!vapidPublicKey) return res.status(500).json({ error: 'VAPID keys not configured' });
  res.json({ publicKey: vapidPublicKey });
});

router.post('/subscribe', (req, res) => {
  const { subscription, userId = 'default' } = req.body;
  if (!subscription) return res.status(400).json({ error: 'subscription required' });
  const subs = loadSubs();
  subs[userId] = subscription;
  saveSubs(subs);
  console.log('Subscription saved for:', userId);
  res.json({ success: true });
});

router.post('/send', async (req, res) => {
  const { userId = 'default', title, body, gamePk, playerName } = req.body;
  const subs = loadSubs();
  const subscription = subs[userId];
  if (!subscription) return res.status(404).json({ error: 'No subscription found' });

  const payload = JSON.stringify({
    title: title || `⚾ ${playerName} is up!`,
    body: body || 'Tap to watch on MLB.tv',
    icon: '/icons/icon-192.png',
    data: { gamePk, url: `https://www.mlb.com/live-stream-games/${gamePk}` },
    actions: [{ action: 'watch', title: '▶ Watch on MLB.tv' }]
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.json({ success: true });
  } catch (err) {
    if (err.statusCode === 410) {
      const subs = loadSubs();
      delete subs[userId];
      saveSubs(subs);
      return res.status(410).json({ error: 'Subscription expired' });
    }
    res.status(500).json({ error: 'Push failed', detail: err.message });
  }
});

router.get('/test', async (req, res) => {
  const subs = loadSubs();
  console.log('Test hit, subscriptions:', Object.keys(subs));
  const subscription = subs['default'];
  if (!subscription) {
    return res.status(404).json({
      error: 'No subscription found',
      help: 'Open the app, go to Settings, and tap Enable notifications first'
    });
  }

  const payload = JSON.stringify({
    title: '🏏 Test Player is at bat!',
    body: 'Top 5 · LAD 3 - SD 1 — Tap to watch on MLB.tv',
    icon: '/icons/icon-192.png',
    data: {
      gamePk: '748430',
      url: 'https://www.mlb.com/live-stream-games/748430'
    },
    actions: [
      { action: 'watch', title: '▶ Watch on MLB.tv' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });

  try {
    await webpush.sendNotification(subscription, payload);
    res.json({ success: true, message: 'Test notification sent!' });
  } catch (err) {
    res.status(500).json({ error: 'Push failed', detail: err.message });
  }
});

module.exports = router;
