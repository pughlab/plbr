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
                    options:{limit:10000, sort: [{ chromosome: ASC },{ start: ASC }]}
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