import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useState } from 'react'
import * as React from 'react'
import { Button, Form, Header, Label, Input, Segment, Container, Message, List, Divider, Modal, Grid, Dropdown, Step } from 'semantic-ui-react'
import { Route, Routes, useParams } from 'react-router-dom'
import {MinioUploadModal} from '../../common/minio'
import SegmentPlaceholder from '../../common/SegmentPlaceholder'

import * as R from 'remeda'
import RawDatasetDetails from './RawDatasetDetails'


function useCreateCuratedDatasetMutation({}) {
  const [mutation, {data, loading, error}] = useMutation(gql`
    mutation CreateCuratedDataset(
      $rawDatasetID: ID!,
      $rawObjectName: ID!, $codebookObjectName: ID!
    ) {
      createCuratedDatasetFromRawDataset(
        rawDatasetID: $rawDatasetID,
        rawObjectName: $rawObjectName, codebookObjectName: $codebookObjectName
      ) {
        name
      }
    }
  `)
  return {data, loading, error, mutation}
}

export default function DatasetDetails() {
  const { datasetID } = useParams()
  const { data, loading, error } = useQuery(gql`
		query RawDatasetDetails($rawDatasetID: ID!) {
			rawDatasets (where: {rawDatasetID: $rawDatasetID}) {
				rawDatasetID
				name
				description
        fromStudy {
          studyID
          shortName
        }
        studySite {
          city
          country
        }
			}
		}`,
    { variables: { rawDatasetID: datasetID } })

  const DATASET_TYPES = [{key: 'raw', label: 'Raw'}, {key: 'harmonized', label: 'Harmonized'}, {key: 'curated', label: 'Curated'}]
  const [datasetType, setDatasetType] = useState(DATASET_TYPES[0]['key'])
  const currentDatasetTypeEquals = R.equals(datasetType)

  if (!data?.rawDatasets) {
    return null
  }
  const [{ rawDatasetID, name, description, fromStudy, studySite }] = data.rawDatasets
  return (
    <>
      <Message>
        <Divider horizontal content='Dataset Details' />
        <Header content={name} subheader={description} />
        <Divider horizontal />
        <Label>
          Study
          <Label.Detail content={fromStudy.shortName} />
          {/* TODO: every raw dataset can be assumed to have study site, remove this check? */}
          {!!studySite && <Label.Detail content={`${studySite.city} (${studySite.country})`} />}
        </Label>
      </Message>
      <Segment attached='top'>
        <Step.Group fluid>
        {R.map(DATASET_TYPES, ({key, label}) => (<Step key={key} active={currentDatasetTypeEquals(key)} content={label} onClick={() => setDatasetType(key)} />))}
        </Step.Group>
      </Segment>
      <Segment attached='bottom'>
        {
          currentDatasetTypeEquals('raw') ? <RawDatasetDetails />
          : currentDatasetTypeEquals('harmonized') ? <>
            <List selection relaxed celled>
              <List.Item>
                <List.Content>
                <List.Header>
                  StudyCenter
                </List.Header>
                </List.Content>
                <List.Content>
                  <Dropdown fluid selection search options={[
                    {description: "Country", label: "COUNTRY", value: "COUNTRY"},
                    {description: "Study ID", label: "STUDYID", value: "STUDYID"},
                    {description: "Site ID", label: "SITEID", value: "SITEID"},
                    {description: "City, town or village", label: "CITYTOWN", value: "CITYTOWN"},
                    {description: "Subject ID", label: "SUBJID", value: "SUBJID"},
                    {description: "Subject ID Original", label: "SUBJIDO", value: "SUBJIDO"},
                    {description: "Study Type", label: "STUDYTYP", value: "STUDYTYP"},
                    {description: "Intervention description  ", label: "ARM", value: "ARM"},
                    {description: "Intervention Code", label: "ARMCD", value: "ARMCD"},
                    {description: "Gestational age at birth (days)", label: "GAGEBRTH", value: "GAGEBRTH"},
                    {description: "Gestational Age Method", label: "GAGECM", value: "GAGECM"},
                  ]} />
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                <List.Header>
                  HENV18WKQ2a
                </List.Header>
                </List.Content>
                <List.Content>
                  <Dropdown selection options={[
                    {description: "Country", label: "COUNTRY", value: "COUNTRY"},
                    {description: "Study ID", label: "STUDYID", value: "STUDYID"},
                    {description: "Site ID", label: "SITEID", value: "SITEID"},
                    {description: "City, town or village", label: "CITYTOWN", value: "CITYTOWN"},
                    {description: "Subject ID", label: "SUBJID", value: "SUBJID"},
                    {description: "Subject ID Original", label: "SUBJIDO", value: "SUBJIDO"},
                    {description: "Study Type", label: "STUDYTYP", value: "STUDYTYP"},
                    {description: "Intervention description  ", label: "ARM", value: "ARM"},
                    {description: "Intervention Code", label: "ARMCD", value: "ARMCD"},
                    {description: "Gestational age at birth (days)", label: "GAGEBRTH", value: "GAGEBRTH"},
                    {description: "Gestational Age Method", label: "GAGECM", value: "GAGECM"},
                  ]} />
                </List.Content>
              </List.Item>
              <List.Item>
                <List.Content>
                <List.Header>
                  HENV18WKQ2b
                </List.Header>
                </List.Content>
                <List.Content>
                  <Dropdown selection options={[
                    {description: "Country", label: "COUNTRY", value: "COUNTRY"},
                    {description: "Study ID", label: "STUDYID", value: "STUDYID"},
                    {description: "Site ID", label: "SITEID", value: "SITEID"},
                    {description: "City, town or village", label: "CITYTOWN", value: "CITYTOWN"},
                    {description: "Subject ID", label: "SUBJID", value: "SUBJID"},
                    {description: "Subject ID Original", label: "SUBJIDO", value: "SUBJIDO"},
                    {description: "Study Type", label: "STUDYTYP", value: "STUDYTYP"},
                    {description: "Intervention description  ", label: "ARM", value: "ARM"},
                    {description: "Intervention Code", label: "ARMCD", value: "ARMCD"},
                    {description: "Gestational age at birth (days)", label: "GAGEBRTH", value: "GAGEBRTH"},
                    {description: "Gestational Age Method", label: "GAGECM", value: "GAGECM"},
                  ]} />
                </List.Content>
              </List.Item>
            </List>
          </>
          : currentDatasetTypeEquals('curated') ? <>
            Curated dataset (making sure codebook matches raw data, time versioned graphs)
          </>
          : null
        }
        
      </Segment>
      
    </>
  )
}