import { createMachine, assign } from 'xstate'
import {useMachine} from '@xstate/react'
import { useMemo } from 'react'
import { gql } from '@apollo/client'
import apolloClient from '../apolloClient'
import * as R from 'remeda'

interface SnapshotMachineContext {
    snapshotType: any,
    dataVariableIDs: any
}
interface SnapshotMachineEvent {
    type: string,
    payload: any
}

export const SNAPSHOT_STATES = {
    IDLE: 'idle',
    // UPDATING: 'updating'
}

export const SNAPSHOT_EVENTS = {
    CHANGE_TYPE: 'change_type',
    ADD_DATA_VARIABLES: 'add_data_variables',
    REMOVE_DATA_VARIABLES: 'remove_data_variables',
    CLEAR_DATA_VARIABLES: 'clear_data_variables',
    TOGGLE_DATA_VARIABLE: 'toggle_data_variable'
}

export const createSnapshotMachine = () => {
    const machine = createMachine({
        id: 'snapshot',
        initial: SNAPSHOT_STATES.IDLE,
        schema: {
            context: {} as SnapshotMachineContext,
            events: {} as SnapshotMachineEvent
        },
        context: {snapshotType: null, dataVariableIDs: {}},
        // @ts-ignore
        states: {
            [SNAPSHOT_STATES.IDLE]: {
                on: {
                    [SNAPSHOT_EVENTS.CHANGE_TYPE]: {
                        target: SNAPSHOT_STATES.IDLE,
                        actions: assign({
                            snapshotType: (context, event: any) => {
                                const {payload: {snapshotType}} = event
                                return snapshotType
                            }
                        })
                    },

                    // [SNAPSHOT_EVENTS.ADD_DATA_VARIABLES]: {
                    //     target: SNAPSHOT_STATES.IDLE,
                    //     actions: assign({
                    //         dataVariableIDs: (context: any, event: any) => {
                    //             return R.uniq([... context.dataVariableIDs, ... event.payload.dataVariableIDs])
                    //         }
                    //     })
                    // },
                    // [SNAPSHOT_EVENTS.REMOVE_DATA_VARIABLES]: {
                    //     target: SNAPSHOT_STATES.IDLE,
                    //     actions: assign({
                    //         dataVariableIDs: (context: any, event: any) => {
                    //             return R.difference(context.dataVariableIDs, event.payload.dataVariableIDs)
                    //         }
                    //     })
                    // },
                    [SNAPSHOT_EVENTS.CLEAR_DATA_VARIABLES]: {
                        target: SNAPSHOT_STATES.IDLE,
                        actions: assign({
                            dataVariableIDs: (context: any, event: any) => {return {}}
                        })
                    },
                    [SNAPSHOT_EVENTS.TOGGLE_DATA_VARIABLE]: {
                        target: SNAPSHOT_STATES.IDLE,
                        actions: assign({
                            dataVariableIDs: (context: any, event: any) => {
                                const dataVariableID = event.payload.dataVariableID
                                if (!context.dataVariableIDs[dataVariableID]) {
                                    return context.dataVariableIDs[dataVariableID] = true
                                } else {
                                    return context.dataVariableIDs[dataVariableID] = false
                                }
                            }
                        })
                    },
                }
            },
        },

    })

    return machine
}

export function useSnapshotMachine () {
    const snapshotMachine = useMemo(() => createSnapshotMachine(), [])
    const [currentSnapshot, sendSnapshot] = useMachine(snapshotMachine)
    return {snapshot: {state: currentSnapshot, send: sendSnapshot}}
}