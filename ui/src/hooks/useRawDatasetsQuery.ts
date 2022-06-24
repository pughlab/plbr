import { gql, useMutation, useQuery } from "@apollo/client";
import { useReducer, useCallback, useState, useEffect } from "react"
import { useAppDispatch } from "../state/hooks";
import { setKeycloakMe } from "../state/appContext";

export default function useRawDatasetsQuery(): [any, boolean] {
    const [rawDatasets, setRawDatsets] = useState()
    const {loading, data, error} = useQuery(gql`
        query RawDatasetsList {
            rawDatasets {
                rawDatasetID
                name   
                description
            }
        }
    `, {
        onCompleted: (data) => {
            if (!!data) {
                setRawDatsets(data?.rawDatasets)
            }
        }
    })
    console.log(rawDatasets)
    return [rawDatasets, loading]
}
  
  