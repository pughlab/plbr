import React, { useState, useReducer, useMemo, useEffect } from 'react'
import { Message, Divider, List, Container, Input, Segment, Form, Button, Dropdown, Modal } from 'semantic-ui-react'
import SegmentPlaceholder from '../../common/SegmentPlaceholder';
import DataVariableTable from '../../visualizations/tables/DataVariableTable'
import InteractiveHeatmapVisualization from '../../visualizations/heatmap/plotly/InteractiveHeatmapVisualization';
import { CSVLink } from "react-csv";

import {useMachine} from '@xstate/react'
import {useStudiesDatasetsFilterMachine, FILTER_EVENTS, FILTER_STATES} from '../../../machines/studiesDatasetsFilterMachine'
import {useSnapshotMachine, SNAPSHOT_EVENTS} from '../../../machines/snapshotMachine'

import useCuratedDatasetsQueryMachine from '../../../hooks/pages/useCuratedDatasetsQueryMachine';
import * as R from 'remeda'

import ExploreFilterFormGroup from './ExploreFilterFormGroup';
import { QUERY_EVENTS } from '../../../machines/queryMachine';

import VirtualizedTable from '../../tables/VirtualizedTable'
import useDataVariablesQuery from '../../../hooks/pages/useDataVariablesQuery';

import Dropzone from './Dropzone';

function DownloadDataVariables({ data }) {
    console.log(data)
    // Can combine with react-table headers
    const headers = [
        { label: 'chromosome', key: 'chromosome' },
        { label: 'start', key: 'start' },
        { label: 'end', key: 'end' },
        { label: 'datavalue', key: 'datavalue' }
    ]
    return (
        <CSVLink data={data} headers={headers} filename={"pibu_export.csv"}>
            <Button fluid content={`Download ${data.length} variables`} />
        </CSVLink>
    )
}

function BinFilterForm({dispatch}) {
    const [filterState, setFilterState] = useState({
        chromosome: '',
        start: '',
        end: '',
        datavalue: ''
    })
    const setFilterValue = (prop: string, newValue: any) => setFilterState({...filterState, [prop]: newValue})
    return (
        <Form>
            <Form.Group widths={4}>
                <Form.Input label='chromosome' type='input'
                    value={filterState.chromosome}
                    onChange={(e, {value}) => setFilterValue('chromosome', value)}
                />
                <Form.Input label='start' type='number'
                    value={filterState.start}
                    onChange={(e, {value}) => setFilterValue('start', value)}
                />
                <Form.Input label='end' type='number'
                    value={filterState.end}
                    onChange={(e, {value}) => setFilterValue('end', value)}
                />
                <Form.Input label='datavalue' type='number'
                    value={filterState.datavalue}
                    onChange={(e, {value}) => setFilterValue('datavalue', value)}
                />
                {/* <Form.Field> */}
                {/* </Form.Field> */}
            </Form.Group>
            <Form.Button fluid content='Add filter' onClick={() => dispatch({type: 'addBinFilter', payload: filterState})}/>
            <Dropzone dispatch = {dispatch}/>

        </Form>
    )
}

export default function Explore() {

    // const {query: queryMachine} = useCuratedDatasetsQueryMachine()
    const {state, dispatch, data, loading, loadQuery} = useDataVariablesQuery({})
    // const {snapshot: snapshotMachine} = useSnapshotMachine()
    const {filter: filterMachine} = useStudiesDatasetsFilterMachine()
    console.log(filterMachine.state)

    // const {snapshotType} = snapshotMachine.state.context
    // const snapshotIs = R.equals(snapshotType)

    // Should move these as accessors for machine
    const selectedDatasets = useMemo(() => R.pipe(
        R.mapValues(filterMachine.state.context.studiesWithDatasets, (datasets, studyID) => R.pickBy(datasets, (datasetSelected, datasetID) => datasetSelected)),
        R.values,
        R.map(R.keys),
        R.flatten()
    ), [filterMachine.state.context])
    useEffect(() => {
        console.log('changing selected curated datasets', selectedDatasets)
        dispatch({type: 'setCuratedDatasetIDs', payload: selectedDatasets})
        // queryMachine.send({type: QUERY_EVENTS.UPDATE_VARIABLES, variables: {curatedDatasetIDs: selectedDatasets}})
    }, [selectedDatasets])


    // const [start, setStart] = useState(0)
    // const [end, setEnd] = useState(1000)
    // // const { data, loading, error } = useQuery(gql`
    // //     query DataVariablesSearch($searchText: String!, $start: Int!, $end: Int!) {
    // //         dataVariables {
    // //             dataVariableID
    // //         }
    // //     }`,
    // //     { variables: { searchText, start, end } })
    // // console.log(data)
    
    // console.log(queryMachine)
    


    // if (!queryMachine.state.matches('loaded')) {return}

    return (
        <>        
            <Message>
                Data variable explore
                <Divider horizontal />
                {/* <Button.Group>
                    <Button content='List' onClick={() => snapshotMachine.send({type: SNAPSHOT_EVENTS.CHANGE_TYPE, payload: {snapshotType: 'list'}})} />
                    <Button content='Table' onClick={() => snapshotMachine.send({type: SNAPSHOT_EVENTS.CHANGE_TYPE, payload: {snapshotType: 'table'}})} />
                    <Button content='Heatmap' onClick={() => snapshotMachine.send({type: SNAPSHOT_EVENTS.CHANGE_TYPE, payload: {snapshotType: 'heatmap'}})} />
                </Button.Group> */}
            </Message>

            <Segment attached='top'>
                <ExploreFilterFormGroup {...{filterMachine}} />
                            <Segment>
                                                            {/* {JSON.stringify(state.binFilters)} */}
                            <BinFilterForm dispatch={dispatch} />

                            {/* ternary checking if there are any uploaded filters */}
                            {state.binFilters.length == 0 ? <SegmentPlaceholder text={'No uploads yet'} /> :
                            <Segment style={{overflowY:'auto',height:'300px'}} >
                            <List divided relaxed selection>
                            {
                                state.binFilters.map((binFilter, index) => (
                                    <List.Item key={index}>
                                    <Button inverted fluid color='red' onClick={() => dispatch({type: 'removeBinFilter', payload: index})}>
                                    {JSON.stringify(binFilter)}
                                    </Button>
                                    </List.Item>
                                ))
                            }
                            </List>
                            </Segment>
                            }

                            </Segment>
                {
                    (() => {
                        if (!filterMachine.state.matches(FILTER_STATES.READY)) {return }
                        return (
                            <Button fluid content='Search' onClick={() => loadQuery()} loading={loading} />
                            // <Button fluid content='Search' onClick={() => queryMachine.send({type: QUERY_EVENTS.REFRESH})}/>
                        )
                    })()
                }
                {/* {JSON.stringify(filterMachine.state.context)} */}

                {/* {JSON.stringify(queryMachine.state.context.variables)} */}
                
            </Segment>

            {/* <Segment attached >
                <Modal
                    trigger={<Button fluid content='Create data export' />}
                    content={
                        <>
                        <Modal.Header>
                        Create a data export from the selected data variables?
                        </Modal.Header>
                        <Modal.Content>
                        <Form>
                            <Form.Field
                                control={Input}
                                type='text'
                                label='Data export name'
                                placeholder='Enter a name'
                            />
                        </Form>
                        </Modal.Content>
                        </>

                    }
                    actions={[
                        <Button content='Cancel' />,
                        <Button content='Submit' />
                    ]}
                />
            </Segment> */}

            <Segment attached='bottom'
                // loading={loading}
            >
                {
                    (() => {
                        // if (!queryMachine.state.matches('loaded')) {return}
                        // const {curatedDatasets} = queryMachine.state.context.data
                        // console.log(selectedDatasets, curatedDatasets)
                        // const data = {curatedDatasets: R.filter(curatedDatasets, ({curatedDatasetID}) => selectedDatasets.includes(curatedDatasetID))}
                        return (
                            <>
                            {/* {JSON.stringify({state, data})} */}
                            {/* {snapshotIs('list') && <></>} */}
                            {/* {snapshotIs('table') && <DataVariableTable data={data} />} */}
                            {/* {snapshotIs('table') && } */}
                            {!!data && <VirtualizedTable data={data} />}
                            
                            {/* {snapshotIs('heatmap') && <InteractiveHeatmapVisualization data={data} />} */}
                            </>
                        )
                    })()
                }
            </Segment>
        </>
    )
}