const createStore = (reducer) => {
  const store = {};
  const initialState = reducer(undefined, {});
  store.state = initialState;
  store.listeners = [];
  store.getState = () => store.state;
  store.subscribe = (listener) => {
    store.listeners.push(listener);
  };
  store.dispatch = (action) => {
    store.state = reducer(store.state, action);
    store.listeners.forEach((listener) => listener());
  };
  return store;
};

const combineReducers = (reducers) => {
  return (state = {}, action) => {
    const nextState = {};
    const keys = Object.keys(reducers);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
    }
    return nextState;
  };
};

const undoable = (reducer) => {
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: [],
  };
  return (state = initialState, action) => {
    const { past, present, future } = state;
    switch (action.type) {
      case 'UNDO':
        return {
          past: past.slice(0, past.length - 1),
          present: past[past.length - 1],
          future: [present, ...future],
        };
      case 'REDO':
        return {
          past: [...past, present],
          present: future[0],
          future: future.slice(1),
        };
      default:
        const newPresent = reducer(present, action);
        if (present === newPresent) {
          return state;
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
    }
  };
};
