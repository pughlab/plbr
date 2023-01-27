import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message, Menu} from 'semantic-ui-react'

import { useKeycloak } from '@react-keycloak/web'
import { useAppSelector } from '../../state/hooks';
import { currentAppContextKeycloakMe } from '../../state/appContext';
import { shallowEqual } from 'react-redux';
import {Logo} from '../logos'
import {LOGIN_MENU_ELEMENT_ID} from '../intros/PortalNavBarIntro'

export default function LogoutModal ({}) {
  const { keycloak, initialized } = useKeycloak()
  const keycloakMe = useAppSelector(currentAppContextKeycloakMe, shallowEqual)
  if (!keycloakMe) {
    return (<></>)
  }
  const {name, email} = keycloakMe
  return (
    <>
    <Modal
      trigger={<Button fluid content='Logout' />}
    >
      <Modal.Content>
      {/* put logout here */}
        <Segment.Group>
          <Segment>
            <Logo />
          </Segment>
          <Segment>
          {
            <Header textAlign='center'>
              {name}
              <Header.Subheader content={email} />
            </Header>
          }
          </Segment>
          <Segment>
            <Button
              fluid color='grey' size='massive'
              content='Logout'
              onClick={() => keycloak.logout()}
            />
          </Segment>
        </Segment.Group>
     </Modal.Content>
    </Modal>
    </>
  )
}