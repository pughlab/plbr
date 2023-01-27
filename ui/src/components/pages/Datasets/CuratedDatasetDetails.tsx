import { gql, useMutation, useQuery } from '@apollo/client'
import { useCallback, useState } from 'react'
import * as React from 'react'
import { Button, Form, Header, Label, Input, Segment, Container, Message, List, Divider, Modal, Grid, Dropdown, Step } from 'semantic-ui-react'
import { Route, Routes, useParams } from 'react-router-dom'
import SegmentPlaceholder from '../../common/SegmentPlaceholder'

import * as R from 'remeda'

export default function CuratedDatasetDetails() {
  const { datasetID } = useParams()
  return (
    <>
      <Grid>
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