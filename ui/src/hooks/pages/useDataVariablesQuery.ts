import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'



export default function useDataVariablesQuery({ }) {

    const [state, dispatch] = useReducer((state: any, action: any) => {
        console.log(action)
        const {type: actionType, payload} = action
        const {binFilters} = state
        if (actionType === 'addBinFilter') {
            console.log(payload)
            const newBinFilters = [... binFilters, payload]
            return {... state, binFilters: newBinFilters}
        } else if (actionType === 'removeBinFilter') {
            const newBinFilters = binFilters
            newBinFilters.splice(payload, 1)
            return {... state, binFilters: newBinFilters}
        } else if (actionType === 'setCuratedDatasetIDs') {
            return {... state, curatedDatasetIDs: payload}
        } else if (actionType === 'bulkUpdateBinFilter') {
            return {... state, binFilters: payload}
        }
        return state
    }, {curatedDatasetIDs: [], binFilters: []})

    const {curatedDatasetIDs, binFilters} = state
    const dataVariableWhere = useMemo(() => {
        console.log('where memo', state.binFilters)
        // return binFilters
        return {
            OR: state.binFilters.map((binFilter: any) => {
                const {chromosome, start, end, datavalue} = binFilter
                return {
                    chromosome,
                    start_GTE: Number(start),
                    end_LTE: Number(end),
                    datavalue_GTE: Number(datavalue),
                }
            })
        }
    }, [state]);
    console.log(dataVariableWhere)


  const [loadQuery, { data, loading, error, called }] = useLazyQuery(gql`
        query DataVariables($curatedDatasetIDs: [ID!]!, $dataVariableWhere: DataVariableWhere) {
            curatedDatasets(
                where: {OR: [{curatedDatasetID_IN: $curatedDatasetIDs}]}, 
            ) {
                curatedDatasetID
                name
                dataVariables(
                    where: $dataVariableWhere
                    # where: {OR: [{chromosome:"chr1",start_GTE:10000,end_LTE: 50000, datavalue_GTE: 0.1},
                    # {chromosome:"chr2",start_GTE:50000,end_LTE: 500000, datavalue_GTE: 0.2},
                    # {chromosome:"chr2",start_GTE:500000,end_LTE: 5000000, datavalue_GTE: 0.2},
                    # {chromosome:"chr3",start_GTE:5000000,end_LTE: 50000000, datavalue_GTE: 0.3}]}
                    # options:{limit:10000, sort: [{ chromosome: ASC },{ start: ASC }]}
                    options:{limit:50000}
                ) {
                    dataVariableID
                    chromosome
                    start
                    end
                    datavalue
                }  
            }
        }
  `, { variables: { curatedDatasetIDs, dataVariableWhere }, fetchPolicy: 'network-only' })

  return {state, dispatch, data, loading, error, called, loadQuery}
}