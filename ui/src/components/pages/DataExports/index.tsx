import React, {useState, useReducer} from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { Message, Divider, Label, Container, Header, List, Dropdown, Input, Segment, Form, Button, Grid, Checkbox, Menu, Popup } from 'semantic-ui-react'
import useRouter from '../../../hooks/useRouter'

import { SnapshotVisualization, VISUALIZATIONS } from '../../visualizations'


import * as R from 'remeda'
import { current } from '@reduxjs/toolkit'


const harddata = [
{refID: 0, dv1: 2, dv2: 2},
{refID: 1, dv1: 2, dv2: 0},
{refID: 2, dv1: 2, dv2: 1},
{refID: 3, dv1: 2, dv2: 0},
{refID: 4, dv1: 2, dv2: 1},
{refID: 5, dv1: 2, dv2: 1},
{refID: 6, dv1: 2, dv2: 0},
{refID: 7, dv1: 2, dv2: 0},
{refID: 8, dv1: 2, dv2: 0},
]
const columns = [
  {
    Header: 'Reference ID',
    accessor: 'refID',
  },
  {
    Header: 'HENV18WKQ2a',
    accessor: 'dv1',
  },
  {
    Header: 'HENV18WKQ2b',
    accessor: 'dv2',
  },
]




function useSelectDataVariablesState({}) {

    const [state, dispatch] = useReducer((state, action) => {
        const {type, payload} = action
        console.log(state, action)
        switch (type) {
            case 'toggleDataVariable':
                const {dataVariableID} = payload
                if (state.selected.has(dataVariableID)) {
                    state.selected.delete(dataVariableID)
                } else {
                    state.selected.add(dataVariableID)
                }
                // Instantiate new set to trigger reference change for react render
                return {... state, selected: new Set(state.selected)}
            case 'saveSnapshot':
                const snapshot = {
                    snapshotKey: state.snapshotKey,
                    dataVariables: [... state.selected]
                }
                state.snapshots.add(snapshot)
                state.selected.clear()
                state.snapshotKey = null
                return {... state, selected: new Set(state.selected), snapshots: new Set(state.snapshots)}
            case 'setSnapshotKey':
                const {snapshotKey} = payload
                return {... state, snapshotKey}
            default: 
                return state
        }
    }, {selected: new Set(), snapshots: new Set(), snapshotKey: null})

    return {state, dispatch}
}

function DataExportDetails () {
    const {exportID} = useParams()
    const {state, dispatch} = useSelectDataVariablesState({})
    const [currentSnapshot, setSnapshot] = useState(null)
    return (
        <>
        <Message>
            Some details (or notes, rich text?) about {exportID}
            <Divider horizontal />
            <Button content='Download data export' />
        </Message>
        <Segment>
            <Grid>
                <Grid.Column width={10}>
                    <Segment basic>
                        <Input fluid placeholder='Search export data variables' />
                    </Segment>
                <List celled selection divided>
                {
                    R.map(columns, ({Header, accessor}) => {
                        const active = state.selected.has(accessor)
                        return (
                            <List.Item key={`${accessor}`}
                                onClick={() => dispatch({type: 'toggleDataVariable', payload: {dataVariableID: accessor}})}
                                active={active}
                            >
                                <List.Icon>
                                <Checkbox checked={active} readOnly />
                                </List.Icon>
                                
                                {Header}
                            </List.Item>
                        )
                    })
                }
                </List>
                </Grid.Column>
                <Divider vertical />
                <Grid.Column width={6}>
                    <Segment>
                        <Form>
                        <Divider horizontal content='Snapshots' />
                        <Label>
                            Data variables
                            <Label.Detail content={`${state.selected.size} categorical`} />
                            <Label.Detail content={`${state.selected.size} continuous`} />
                            <Label.Detail content={`${state.selected.size} total`} />
                        </Label>
                        <Divider horizontal />
                        <Form.Field>
                        <Dropdown
                            fluid
                            selection
                            placeholder='Select a snapshot type'
                            options={VISUALIZATIONS}
                            value={state.snapshotKey}
                            onChange={(e, {value}) => dispatch({type: 'setSnapshotKey', payload: {snapshotKey: value}})}
                        />
                        </Form.Field>
                        <Form.Field>
                        {
                            (() => {
                                const disabled = R.equals(0, state.selected.size) || R.isNil(state.snapshotKey)
                                const content = disabled ? 'Select variables and visualization' : 'Save visualization'
                                return (
                                    <>
                                    <Button fluid content={content}
                                        disabled={disabled}
                                        onClick={() => dispatch({type: 'saveSnapshot', payload: {}})}
                                    />
                                    </>
                                )
                            })()
                        }
                        </Form.Field>

                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        </Segment>
        <Divider horizontal />
        <Segment>
            <Divider horizontal content='Visualizations and Snapshots' />
            <Menu fluid horizontal>
            {
                R.map.indexed([... state.snapshots], (snapshot, i) => {
                    return (
                        <Popup
                            trigger={
                                <Menu.Item key={i}
                                    active={R.equals(i, current)}
                                    onClick={() => setSnapshot(i)}
                                >
                                    {i}
                                </Menu.Item>    
                            }
                        >
                        {JSON.stringify(snapshot)}
                        </Popup>
                    )
                })
            }
            </Menu>
            {
                (() => {
                    if (R.isNil(currentSnapshot)) {return}
                    const snapshot = [... state.snapshots][currentSnapshot]
                    return (
                        <SnapshotVisualization {... {snapshot}} />
                    )
                })()
            }
        </Segment>
        </>
    )
}

export default function DataExports () {
    const {navigate} = useRouter()
    return (
        <Routes>
            {/* Default /datasets path goes to export search */}
            <Route index element={(
            <>
            <Container>
                    <Message content='Explore variables' >
                    Exports are groups of data variables tagged together

                    <Divider horizontal />
                </Message>
                
                    <Form as={Segment}>
                        <Form.Field
                            control={Input}
                            label='Search data variable definition description'
                            placeholder='Enter some terms of interest'
                        />
                    </Form>

                <List relaxed='very' selection size='large'>
                    <List.Item content='data export' onClick={(e, d) => navigate('someDataExportID')}/>
                </List>
            </Container>
            </>
            )} />
    
            <Route path=':exportID' element={<DataExportDetails />} />
        </Routes>
    )
}