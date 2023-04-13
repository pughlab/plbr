import { createMachine, ActionFunctionMap } from 'xstate';

interface ErrorContext {
  message: string;
}

type ErrorEvent = { type: 'ERROR'; message: string } | { type: 'CLEAR_ERROR' };

interface ErrorStateSchema {
  states: {
    idle: {};
    error: {};
  };
}

type ErrorState =
  | { value: 'idle'; context: ErrorContext }
  | { value: 'error'; context: ErrorContext };

const errorMachine = createMachine<ErrorContext, ErrorEvent, ErrorStateSchema>({
  id: 'error',
  initial: 'idle',
  context: {
    message: '',
  },
  states: {
    idle: {},
    error: {
      on: {
        ERROR: {
          target: 'error',
          actions: 'setMessage',
        },
        CLEAR_ERROR: 'idle',
      },
    },
  },
}, {
  actions: {
    setMessage: (context, event) => {
      return { ...context, message: event.message };
    },
  },
});

export type ErrorContextType = {
  current: ErrorState;
  send: (...args: any[]) => void;
};

export default errorMachine;
