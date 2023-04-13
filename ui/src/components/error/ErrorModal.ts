import React from 'react';
import { Menu, Message } from 'semantic-ui-react';
import { useMachine } from '@xstate/react';
import { errorMachine } from '../../machines/errorMachine';
import { ErrorContext } from '../..contexts/ErrorContext';

function ErrorMenuItem() {
  const { current } = React.useContext(ErrorContext);

  return (
    <Menu.Item>
      {current.matches('error') && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{current.context.message}</p>
        </Message>
      )}
    </Menu.Item>
  );
}
