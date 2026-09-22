import type {
  Locale,
  RuntimeAction,
  RuntimeState,
} from "./types";

export function createInitialRuntimeState(
  patternId: string,
  locale: Locale = "vi",
): RuntimeState {
  return {
    patternId,
    eventIndex: 0,
    locale,
    playing: false,
    predictionStatus: "idle",
    predictionAnswer: "",
    inputRevision: 0,
    inputValue: "",
  };
}

export function runtimeReducer(
  state: RuntimeState,
  action: RuntimeAction,
): RuntimeState {
  switch (action.type) {
    case "SELECT_PATTERN":
      if (!action.patternId || action.patternId === state.patternId) return state;
      return createInitialRuntimeState(action.patternId, state.locale);

    case "PREVIOUS":
      return {
        ...state,
        eventIndex: Math.max(0, state.eventIndex - 1),
        playing: false,
        predictionStatus: "idle",
        predictionAnswer: "",
      };

    case "NEXT": {
      const lastIndex = Math.max(0, action.eventCount - 1);
      const eventIndex = Math.min(lastIndex, state.eventIndex + 1);
      return {
        ...state,
        eventIndex,
        // Every event is a prediction checkpoint. PLAY advances exactly one
        // event, then pauses so the learner predicts before continuing.
        playing: false,
        predictionStatus: "idle",
        predictionAnswer: "",
      };
    }

    case "PLAY":
      return state.playing ? state : { ...state, playing: true };

    case "PAUSE":
      return state.playing ? { ...state, playing: false } : state;

    case "RESET":
      return createInitialRuntimeState(state.patternId, state.locale);

    case "SET_LOCALE":
      return action.locale === state.locale
        ? state
        : { ...state, locale: action.locale };

    case "SUBMIT_PREDICTION":
      return {
        ...state,
        playing: false,
        predictionStatus: action.status,
        predictionAnswer: action.answer,
      };

    case "CHANGE_INPUT":
      return {
        ...state,
        eventIndex: 0,
        playing: false,
        predictionStatus: "idle",
        predictionAnswer: "",
        inputRevision: state.inputRevision + 1,
        inputValue: action.value,
      };
  }
}
