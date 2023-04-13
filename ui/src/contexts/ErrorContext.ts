import React, {useContext} from 'react';
import { useMachine } from '@xstate/react';
import errorMachine, { ErrorContextType } from '../machines/errorMachine';

export const ErrorContext = React.createContext<ErrorContextType>({
  current: errorMachine.initialState,
  send: () => {},
});

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider = ({ children }: ErrorProviderProps) => {
  const [current, send] = useMachine(errorMachine);
  const value = { current, send };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const { current, send } = useContext(ErrorContext);

  const setError = (message: string) => {
    send({ type: 'ERROR', message });
  };

  const clearError = () => {
    send({ type: 'CLEAR_ERROR' });
  };

  return { current, setError, clearError };
};
