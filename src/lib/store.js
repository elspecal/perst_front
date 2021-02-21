let events = {};
let state = {};

export function createStore(initialstate = {}) {
  state = initialstate;
}

export function on(eventName, callback) {
  if (!Object.prototype.hasOwnProperty.call(events, eventName)) {
    events[eventName] = [];
  }
  events[eventName].push(callback);

  return true;
}

export function emit(eventName, payload) {
  if ('function' === typeof payload) payload = payload(state);
  if ('[object Object]' !== Object.prototype.toString.call(payload)) {
    throw 'Payload should be or return an object!';
  }
  if (!Object.prototype.hasOwnProperty.call(events, eventName)) {
    throw `Event ${eventName} does not exist!`;
  }
  state = { ...state, ...payload };
  events[eventName].forEach(cb => cb(state));

  return true;
}
