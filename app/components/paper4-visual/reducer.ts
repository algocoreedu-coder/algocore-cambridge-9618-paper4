import type { Locale, RuntimeAction, RuntimeState } from "./types";

export function createInitialRuntimeState(patternId: string, locale: Locale = "vi"): RuntimeState {
  return { patternId, scenarioId: "", eventIndex: 0, eventId: "", locale, playing: false, predictionStatus: "idle", predictionAnswer: "", inputRevision: 0, stepPhase: "predict" };
}

function resetStepState(state: RuntimeState) {
  return { ...state, eventIndex: 0, playing: false, predictionStatus: "idle" as const, predictionAnswer: "", stepPhase: "predict" as const };
}

export function runtimeReducer(state: RuntimeState, action: RuntimeAction): RuntimeState {
  switch (action.type) {
    case "SELECT_PATTERN":
      return !action.patternId || action.patternId === state.patternId ? state : createInitialRuntimeState(action.patternId, state.locale);
    case "TRACE_READY":
      return action.patternId !== state.patternId ? state : { ...resetStepState(state), scenarioId: action.scenarioId, eventId: action.firstEventId };
    case "RESTORE_PROGRESS":
      return action.patternId !== state.patternId ? state : { ...state, scenarioId: action.scenarioId, eventIndex: action.eventIndex, eventId: action.eventId, playing: false, stepPhase: action.stepPhase, predictionStatus: action.predictionStatus, predictionAnswer: action.predictionAnswer };
    case "PREVIOUS":
      return { ...state, eventIndex: Math.max(0, state.eventIndex - 1), eventId: action.eventId, playing: false, predictionStatus: "idle", predictionAnswer: "", stepPhase: "revealed" };
    case "NEXT":
      return { ...state, eventIndex: state.eventIndex + 1, eventId: action.eventId, playing: action.keepPlaying ?? false, predictionStatus: "idle", predictionAnswer: "", stepPhase: "predict" };
    case "PLAY":
      return state.playing ? state : { ...state, playing: true };
    case "PAUSE":
      return state.playing ? { ...state, playing: false } : state;
    case "RESET":
      return { ...resetStepState(state), eventId: action.firstEventId };
    case "SET_LOCALE":
      return action.locale === state.locale ? state : { ...state, locale: action.locale };
    case "SUBMIT_PREDICTION":
      return { ...state, playing: false, predictionStatus: action.status, predictionAnswer: action.answer, stepPhase: "revealed" };
    case "CHANGE_INPUT":
      return { ...resetStepState(state), scenarioId: action.scenarioId, eventId: action.firstEventId, inputRevision: state.inputRevision + 1 };
  }
}
