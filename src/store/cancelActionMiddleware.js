const actions = {};

const setAction = (action) => {
  actions[action.type] = {
    phase: action.meta["redux-pack/LIFECYCLE"],
    transactionId: action.meta["redux-pack/TANSACTION"],
  };
};

const getAction = (action) => actions[action.type];

const isStartAction = (action) => {
  return action.meta["redux-pack/LIFECYCLE"] === "start";
};

const isSuccessAction = (action) => {
  return action.meta["redux-pack/LIFECYCLE"] === "success";
};

const isStaleAction = (newAction) => {
  const oldAction = getAction(newAction);
  return (
    oldAction &&
    oldAction.transactionId !== newAction.meta["redux-pack/TRANSACTION"]
  );
};

const isActionPresentInStartPhase = (newAction) => {
  const oldAction = getAction(newAction);
  return oldAction && oldAction.phase === "start";
};

const isReduxPackAction = (action) => {
  return action && Object.keys(action).includes("meta");
};

const cancelAction = (store) => (next) => (action) => {
  if (isReduxPackAction(action)) {
    if (isStartAction(action)) {
      if (isStaleAction(action)) delete actions[action.type];
      setAction(action);
      next(action);
    } else if (isSuccessAction(action)) {
      if (isActionPresentInStartPhase(action)) {
        if (isStaleAction(action)) {
          next({
            ...action,
            payload: null,
          });
        } else {
          delete actions[action.type];
          next(action);
        }
      } else {
        next(action);
      }
    }
  } else {
    next(action);
  }
};

export default cancelAction;