import { useSyncExternalStore } from "react";

type VoidFn = () => void;
type Fn = (...args: [unknown]) => unknown;
type Updater<V> = (val: V) => V;
type Selector<V> = (val: V) => V | null;

type KeyState<Val> = {
  subscribe: (listener: VoidFn) => VoidFn;
  getSnapshot: () => Val;
  useSnapshot: (selector?: Selector<Val>) => Val | null;
  setSnapshot: (val: Val) => void;
};
type State<T> = {
  [K in keyof T]: KeyState<T[K]>;
};

type Methods<T> = Record<keyof T, Fn>;
type Setter<T> = <K extends keyof T>(key: K, updater: Updater<T[K]>) => void;
export type Store<T> = {
  [K in keyof T]: T[K] extends Function
    ? T[K]
    : T[K] extends object
    ? Store<T[K]>
    : T[K];
} &
  Setter<T>;

type Empty = Record<string, unknown>;

const __DEV__ = process.env.NODE_ENV !== "production";
const __DEV_ERR__ = (msg: string) => {
  if (__DEV__) {
    throw new Error(msg);
  }
};

function isArrayLike(value: any) {
  return value != null && typeof value !== "function" && Array.isArray(value);
}

function isObject(value: any) {
  const type = typeof value;
  return value != null && type === "object" && !isArrayLike(value);
}

const createState = <T>(key: keyof T, listeners: Set<VoidFn>, data: T) => {
  const state: KeyState<T[typeof key]> = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => data[key],
    setSnapshot: (val) => {
      if (val !== data[key]) {
        data[key] = val;

        listeners.forEach((listener) => listener());
      }
    },
    useSnapshot: (selector) => {
      return useSyncExternalStore(
        state.subscribe,
        () => {
          return selector ? selector(state.getSnapshot()) : state.getSnapshot();
        },
        () => {
          return selector ? selector(state.getSnapshot()) : state.getSnapshot();
        }
      );
    }
  };
  return state;
};

const createStore = <T extends Empty>(data: T): Store<T> => {
  const state: State<T> = {} as State<T>;
  const methods: Methods<T> = {} as Methods<T>;
  const listeners = new Set<VoidFn>();
  if (Object.keys(data).length !== 0) {
    (Object.keys(data) as Array<keyof typeof data>).forEach((key: keyof T) => {
      const initVal = data[key];

      if (initVal instanceof Function) {
        methods[key] = (...args: unknown[]) => {
          const res = initVal(...args);
          return res;
        };
        return;
      }
      if (isObject(data[key] as T[keyof T])) {
        if (Object.keys(data[key] as Array<keyof typeof data>).length === 0)
          return;
        data[key] = createStore(data[key] as Empty) as T[keyof T];
        return;
      }
      state[key] = createState(key, listeners, data);
    });
  }

  const setState = (key: keyof T, val: T[keyof T] | Updater<T[keyof T]>) => {
    if (key in data) {
      if (key in state) {
        const newVal = val instanceof Function ? val(data[key]) : val;
        state[key].setSnapshot(newVal);
      }
    } else {
      data[key] = val as T[keyof T];
      if (val instanceof Function) {
        methods[key] = (...args: unknown[]) => {
          const res = val(data[key]);
          return res;
        };
        return;
      }
      state[key] = createState(key, listeners, data);
    }
  };

  return new Proxy(
    ((() => undefined) as unknown) as Store<T>,
    {
      get: (target, key: keyof T) => {
        if (key in methods) {
          return methods[key];
        }

        try {
          return state[key].useSnapshot();
        } catch (err) {
          return data[key];
        }
      },
      set: (_, key: keyof T, val: T[keyof T]) => {
        setState(key, val);
        return true;
      },
      apply: (_, __, [key, updater]: [keyof T, Updater<T[keyof T]>]) => {
        if (typeof updater === "function") {
          setState(key, updater);
        } else {
          __DEV_ERR__(`updater for \`${key as string}\` should be a function`);
        }
      }
    } as ProxyHandler<Store<T>>
  );
};

const store = <T extends Empty>(initialData: T): Store<T> => {
  if (
    __DEV__ &&
    Object.prototype.toString.call(initialData) !== "[object Object]"
  ) {
    throw new Error("object required");
  }

  const data = { ...initialData };

  return createStore(data);
};

export default store;
