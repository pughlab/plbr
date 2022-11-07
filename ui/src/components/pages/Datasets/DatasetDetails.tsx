import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useState } from 'react'
import * as React from 'react'
import { Button, Form, Header, Label, Input, Segment, Container, Message, List, Divider, Modal, Grid, Dropdown } from 'semantic-ui-react'
import { Route, Routes, useParams } from 'react-router-dom'
import {MinioUploadModal} from '../../common/minio'
import SegmentPlaceholder from '../../common/SegmentPlaceholder'

import * as R from 'remeda'
// import DataVariableTable from '../../visualizations/tables/DataVariableTable'


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
  const minioUploadQuery = useQuery(gql`
    query MinioUploads($bucketName: ID!) {
        minioUploads(where: {bucketName: $bucketName}) {
            bucketName
            objectName
            filename
        }
    }`,
    { variables: { bucketName: `raw-dataset-${datasetID}` }, fetchPolicy: 'network-only' })

  const [minioObjectNames, setMinioObjectNames] = useState({raw: null, codebook: null})
  
  const {mutation, loading: mutationLoading} = useCreateCuratedDatasetMutation({})
  if (!data?.rawDatasets) {
    return null
  }
  if (!minioUploadQuery.data?.minioUploads) {
    return
  }
  const {minioUploads} = minioUploadQuery.data
  const [{ rawDatasetID, name, description, fromStudy, studySite }] = data.rawDatasets
  return (
    <>
      <Grid>
        <Grid.Column width={16}>
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
        </Grid.Column>
        <Grid.Row divided>
          <Grid.Column width={10}>
            <Divider horizontal content='Dataset Files' />
            {
              (() => {
                if (!minioUploadQuery.data) {return}
                const {minioUploads} = minioUploadQuery.data
                return (
                  <Segment>
                    <MinioUploadModal bucketName={`raw-dataset-${datasetID}`} />
                    <Divider horizontal />
                    {!minioUploads.length ? <SegmentPlaceholder text={'No uploads yet'} /> :
                        <List celled divided>
                            {minioUploads.map(minioUpload => (
                                <List.Item
                                    content={minioUpload.filename}
                                    description={minioUpload.objectName}
                                />
                            ))}
                        </List>
                    }
                </Segment>
                )
              })()
            }
          </Grid.Column>
          <Grid.Column width={6}>
            <Segment loading={mutationLoading}>
              <Divider horizontal content='Transformation Into Data Variables' />
              <Dropdown
                placeholder='Select transformation for the raw dataset minio bucket'
                fluid search selection
                options={[]}
              />
              <Message>
                Transformation
              </Message>
              <Form>
                <Form.Group widths={2}>
                  <Form.Field
                    control={Dropdown}
                    label='Raw CSV file'
                    selection
                    fluid
                    value={minioObjectNames.raw}
                    options={R.map(minioUploads, (minioUpload: any) => ({value: minioUpload.objectName, text: minioUpload.filename}))}
                    onChange={(e, {value}) => setMinioObjectNames({...minioObjectNames, raw: value})}
                  />
                  <Form.Field
                    control={Dropdown}
                    label='Codebook file'
                    selection
                    fluid
                    value={minioObjectNames.codebook}
                    options={R.map(minioUploads, (minioUpload: any) => ({value: minioUpload.objectName, text: minioUpload.filename}))}
                    onChange={(e, {value}) => setMinioObjectNames({...minioObjectNames, codebook: value})}
                  />
                </Form.Group>
                <Form.Button fluid content='Submit'
                  onClick={() => mutation({variables: {
                    rawDatasetID,
                    rawObjectName: minioObjectNames.raw,
                    codebookObjectName: minioObjectNames.codebook
                  }})}
                />

              </Form>

            </Segment>
          </Grid.Column>
        </Grid.Row>

        <Grid.Column width={16}>
          <Segment>
            <Divider horizontal content='If transformation is successful...' />
            <Segment>
              <>
                {/* <DownloadDataVariables data={data.dataVariables} /> */}
                {/* <DataVariableTable data={[]} /> */}
              </>
            </Segment>
          </Segment>
        </Grid.Column>
      </Grid>
    </>
  )
}