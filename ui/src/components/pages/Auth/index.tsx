import React, {useState, useReducer} from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { Message, Divider, Label, Container, Header, List, Dropdown, Input, Segment, Form, Button, Grid, Checkbox, Menu, Modal } from 'semantic-ui-react'
import useRouter from '../../../hooks/useRouter'
import { useAppSelector } from '../../../state/hooks'
import { currentAppContextKeycloakMe } from '../../../state/appContext'
import { shallowEqual } from 'react-redux'
import * as R from 'remeda'

import CalendarHeatmapVisualization from '../../visualizations/heatmap/calendar/CalendarHeatmapVisualization'
import LogoutModal from '../../authentication/LogoutModal'

function AuthMeDetails () {
    const keycloakMe = useAppSelector(currentAppContextKeycloakMe, shallowEqual)
    if (!keycloakMe) {return <></>}
    const {name, email} = keycloakMe
    return (
        <>
        <Segment>
            <Header content={name} subheader={email} />
        </Segment>
        </>
    )
}
function AuthUsersList () {
    return (
        <>
        <Segment>
            <List celled selection relaxed>
                <Modal
                    trigger={<List.Item content='a@a.a' />}
                >
                    <Modal.Header content={'Admin actions for user'} />
                </Modal>
            </List>
        </Segment>
        </>
    )
}

function AuthStatistics () {
    return (
        <>
        <Segment>
        <Message>
            <Message.Header>
                {/* Matomo link here */}
                <Button fluid size='large' content='Click the button above to go to the advanced user statistics dashboard' />
            </Message.Header>
        </Message>
        <Divider horizontal />
        <CalendarHeatmapVisualization />
        </Segment>
        </>
    )
}

export default function AuthPage () {
    const {navigate} = useRouter()
    const [currentPath, setPath] = useState('me')
    const MENU_ITEMS = [
        {path: 'me', label: 'My User', component: <AuthMeDetails/>},
        {path: 'users', label: 'Portal Users', component: <AuthUsersList />},
        {path: 'usage', label: 'Portal Statistics', component: <AuthStatistics />}
    ]
    return (
        <Routes>
            {/* Default /datasets path goes to export search */}
            <Route index element={(
            <>
            <Grid as={Container}>
                <Grid.Column width={4}>
                    <Segment>
                    <Button.Group vertical fluid>
                    {
                        MENU_ITEMS.map(({path, label}) => (
                            <Button key={path} content={label} active={R.equals(path, currentPath)} basic
                                onClick={() => setPath(path)}
                            />
                        ))
                    }
                    </Button.Group>
                    <Divider horizontal />
                    <LogoutModal />
                    </Segment>
                </Grid.Column>
                <Grid.Column width={12}>
                    {
                        R.pipe(
                            MENU_ITEMS,
                            R.find(({path}) => R.equals(path, currentPath)),
                            R.prop('component')
                        )
                    }
                </Grid.Column>
            </Grid>
            </>
            )} />
        </Routes>
    )
}