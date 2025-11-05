import PusherClient from 'pusher-js';

const key = process.env.REACT_APP_PUSHER_KEY;
const cluster = process.env.REACT_APP_PUSHER_CLUSTER;

if (!key || !cluster) {
  // In production, we expect these to be present. In dev, allow missing.
  // eslint-disable-next-line no-console
  console.warn('[pusher] REACT_APP_PUSHER_* not configured: realtime disabled');
}

export const pusherClient = key && cluster
  ? new PusherClient(key, {
      cluster,
      forceTLS: true,
      // v8 API: configure server auth endpoint for private/presence channels
  channelAuthorization: { endpoint: '/api/pusher/auth', transport: 'ajax' }
    })
  : null;

export const CHANNEL = 'wishes';
export const EVENTS = {
  NEW: 'wish:new',
  TYPING_START: 'wish:typing_start',
  TYPING_STOP: 'wish:typing_stop',
} as const;
export const PRESENCE = 'presence-wishes';
