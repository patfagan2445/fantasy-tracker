const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'admin@example.com'}`,
    vapidPublicKey,
    vapidPrivateKey
  );
}

const subscriptions = new Map();

router.get('/vapid-public-key', (req, res) => {
  if (!vapidPublicKey) return res.status(500).json({ error: 'VAPID keys not configured' });
  res.json({ publicKey: vapidPublicKey });
});

router.post('/subscribe', (req, res) => {
  const { subscription, userId = 'default' } = req.body;
  if (!subscription) return res.status(400).json({ error: 'subscription required' });
  subscriptions.set(userId, subscription);
  console.log('Subscription saved for:', userId);
  res.json({ success: true });
});

router.post('/send', async (req, res) => {
  const { userId = 'default', title, body, gamePk, playerName } = req.body;
  const subscription = subscriptions.get(userId);
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
      subscriptions.delete(userId);
      return res.status(410).json({ error: 'Subscription expired' });
    }
    res.status(500).json({ error: 'Push failed', detail: err.message });
  }
});

router.get('/test', async (req, res) => {
  console.log('Test endpoint hit, subscriptions:', subscriptions.size);
  const subscription = subscriptions.get('default');
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
