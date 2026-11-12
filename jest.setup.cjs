const listeners = new Map();

global.window.history = {
  replaceState: (_state, _title, url) => {
    const hashIndex = String(url).indexOf('#');
    global.window.location.hash = hashIndex >= 0 ? String(url).slice(hashIndex) : '';
  },
};
global.window.location = { hash: '' };
global.window.addEventListener = (type, listener) => {
  const typeListeners = listeners.get(type) ?? new Set();
  typeListeners.add(listener);
  listeners.set(type, typeListeners);
};
global.window.removeEventListener = (type, listener) => {
  listeners.get(type)?.delete(listener);
};
global.window.dispatchEvent = (event) => {
  listeners.get(event.type)?.forEach((listener) => listener(event));
  return true;
};
