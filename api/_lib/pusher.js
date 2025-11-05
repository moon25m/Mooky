const Pusher = require('pusher');

function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} missing`);
  return v;
}

const appId = process.env.PUSHER_APP_ID || '';
const key = process.env.PUSHER_KEY || '';
const secret = process.env.PUSHER_SECRET || '';
const cluster = process.env.PUSHER_CLUSTER || '';

let pusher = null;
if (appId && key && secret && cluster) {
  pusher = new Pusher({ appId, key, secret, cluster, useTLS: true });
}

const CHANNEL = 'wishes';
const PRESENCE_CHANNEL = 'presence-wishes';
const EVENTS = {
  NEW: 'wish:new',
  TYPING_START: 'wish:typing_start',
  TYPING_STOP: 'wish:typing_stop',
};

module.exports = { pusher, CHANNEL, EVENTS, PRESENCE_CHANNEL };
