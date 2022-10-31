import { createMachine, assign } from 'xstate'
import { gql } from '@apollo/client'
import apolloClient from '../apolloClient'
import * as R from 'remeda'

import {faker} from '@faker-js/faker'

export const SNAPSHOT_STATES = {
    IDLE: 'idle',
    // UPDATING: 'updating'
}

export const SNAPSHOT_EVENTS = {
    CHANGE_TYPE: 'change_type',
    CHANGE_DATA_VARIABLES: 'change_data_variables'
}

export const createSnapshotMachine = () => {
    const machine = createMachine({
        id: 'snapshot',
        initial: SNAPSHOT_STATES.IDLE,
        context: {
            // snapshotType, dataVariableIDs
        },
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
                    [SNAPSHOT_EVENTS.CHANGE_DATA_VARIABLES]: {
                        target: SNAPSHOT_STATES.IDLE,
                        actions: assign({
                            dataVariableIDs: (context, event: any) => {
                                const {payload: {dataVariableIDs}} = event
                                return dataVariableIDs
                            }
                        })
                    },
                }
            },
        },

    })

    return machine
}