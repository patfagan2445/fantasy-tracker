import { useState, useEffect, useRef, useCallback } from 'react';
import { checkRosterActive, getVapidKey, sendSubscription } from '../utils/api';

const POLL_INTERVAL = 30000;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export const useLiveTracker = (players, notificationsEnabled) => {
  const [activePlayers, setActivePlayers] = useState([]);
  const [lastCheck, setLastCheck] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);
  const alertedRef = useRef(new Set());
  const intervalRef = useRef(null);

  const checkPlayers = useCallback(async () => {
    if (!players.length) return;
    setIsPolling(true);
    setError(null);

    try {
      const result = await checkRosterActive(players);
      setActivePlayers(result.active || []);
      setLastCheck(new Date());

      if (notificationsEnabled) {
        (result.active || []).forEach(item => {
          const key = `${item.player.name}_${item.situation}_${item.inning}`;
          if (!alertedRef.current.has(key)) {
            alertedRef.current.add(key);
            triggerNotification(item);
          }
        });
      }

      const activeKeys = new Set(
        (result.active || []).map(i => `${i.player.name}_${i.situation}_${i.inning}`)
      );
      alertedRef.current = new Set([...alertedRef.current].filter(k => activeKeys.has(k)));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsPolling(false);
    }
  }, [players, notificationsEnabled]);

  useEffect(() => {
    if (!players.length) return;
    checkPlayers();
    intervalRef.current = setInterval(checkPlayers, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [checkPlayers, players.length]);

  return { activePlayers, lastCheck, isPolling, error, checkNow: checkPlayers };
};

export const useNotifications = () => {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [subscribed, setSubscribed] = useState(false);

  const setupPushSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        alert('Service workers not supported on this browser');
        return;
      }
      if (!('PushManager' in window)) {
        alert('Push notifications not supported on this browser');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      alert('Step 1 OK: Service worker ready');

      const { publicKey } = await getVapidKey();
      alert('Step 2 OK: Got VAPID key');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });
      alert('Step 3 OK: Push subscription created');

      await sendSubscription(subscription);
      alert('Step 4 OK: Subscription saved to backend!');

      setSubscribed(true);
    } catch (err) {
      alert('Push setup failed: ' + err.message);
      console.warn('Push setup failed:', err);
    }
  };

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') await setupPushSubscription();
    return result;
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => {
          console.log('SW registered:', reg.scope);
          navigator.serviceWorker.addEventListener('message', event => {
            if (event.data?.type === 'OPEN_GAME') {
              window.open(event.data.url, '_blank', 'noopener');
            }
          });
        })
        .catch(err => {
          alert('Service worker failed to register: ' + err.message);
        });
    }
  }, []);

  return { permission, subscribed, requestPermission, resubscribe: setupPushSubscription };
};

function triggerNotification({ player, situation, gamePk, inning, score }) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const emoji = situation === 'batting' ? '🏏' : '⚾';
  const title = `${emoji} ${player.name} is ${situation === 'batting' ? 'at bat' : 'pitching'}!`;
  const body = `${inning} · ${score} — Tap to watch on MLB.tv`;

  const notif = new Notification(title, {
    body,
    icon: '/icons/icon-192.png',
    tag: `${player.name}_${situation}`,
    renotify: false
  });

  notif.onclick = () => {
    window.open(`https://www.mlb.com/live-stream-games/${gamePk}`, '_blank', 'noopener');
    notif.close();
  };
}
