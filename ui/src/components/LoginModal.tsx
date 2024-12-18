import React, {useState, useEffect} from 'react';

import {Embed, Header, Segment, Button, Grid, Modal, Label, Divider, Icon, Image, Popup, Message, Menu} from 'semantic-ui-react'

import { useKeycloak } from '@react-keycloak/web'
import { useAppSelector } from '../state/hooks';
import { currentAppContextKeycloakMe } from '../state/appContext';
import { shallowEqual } from 'react-redux';
import Logo from '../imic_logo.png'

const LoginModal = () => {
  console.log('test')
  // const {keycloakUser} = state
  // const {name, email} = keycloakUser
  const [open, setOpen] = useState(false)
  const { keycloak, initialized } = useKeycloak()
  const keycloakMe = useAppSelector(currentAppContextKeycloakMe, shallowEqual)
  // console.log(keycloakMe)
  if (!keycloakMe) {return null}
  // console.log(context)
  // return null
  const {name, email} = keycloakMe
  return (
    <>
    <Popup size='large' flowing wide='very'
      trigger={
        <Menu.Item
          header
          icon='user'
          onClick={() => setOpen(!open)}
        />
      }
    >
      {`Logged in as  `}<Label basic content={name} detail={email} />
    </Popup>
    
    <Modal
      {...{open}}
      closeIcon
      onClose={() => setOpen(!open)}
      closeOnDimmerClick={true}
    >
      <Modal.Content>
      {/* put logout here */}
        <Segment.Group>
          <Segment>
            <Image centered size='small' src={Logo}/>
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

export default LoginModal