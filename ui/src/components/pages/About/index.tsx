import * as React from 'react';
import { Container, Segment, Grid, Header, Divider, Icon } from 'semantic-ui-react'

import {AboutPortal} from '../../logos'

export default function About() {
  return (
    <Container as={Segment}>
      <Segment>
        <AboutPortal />
      </Segment>
    </Container>
  );
};
