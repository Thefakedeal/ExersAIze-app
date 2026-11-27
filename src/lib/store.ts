export type Store<T> = {
  getSnapshot: () => T;
  get: () => T;
  subscribe: (listener: () => void) => () => void;
  refresh: () => Promise<T>;
  ensureLoaded: () => Promise<T>;
  setValue: (newValue: T) => void;
};

export function createStore<T>(load: () => Promise<T>, initialValue: T): Store<T> {
  let value = initialValue;
  let loadPromise: Promise<T> | null = null;
  const listeners = new Set<() => void>();

  function notifyListeners() {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error notifying store listener:', e);
      }
    });
  }

  function ensureLoaded(): Promise<T> {
    if (!loadPromise) {
      loadPromise = load()
        .then((loaded) => {
          value = loaded;
          notifyListeners();
          return value;
        })
        .catch((error) => {
          loadPromise = null;
          throw error;
        });
    }
    return loadPromise;
  }

  return {
    getSnapshot: () => value,
    get: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      void ensureLoaded();
      return () => {
        listeners.delete(listener);
      };
    },
    refresh: async () => {
      loadPromise = load().then((loaded) => {
        value = loaded;
        notifyListeners();
        return value;
      });
      return loadPromise;
    },
    ensureLoaded,
    setValue: (newValue) => {
      value = newValue;
      notifyListeners();
    },
  };
}
