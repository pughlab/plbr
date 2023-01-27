import React from 'react'
import * as R from 'remeda'

import SunburstVisualization from './sunburst/SunburstVisualization'
import TreemapVisualization from './treemap/TreemapVisualization'
import PieVisualization from './pie/PieVisualization'
import BarVisualization from './bar/BarVisualization'
import ViolinVisualization from './violin/ViolinVisualization'
import HeatmapVisualization from './heatmap/visx/HeatmapVisualization'
import { TextArea, Form, Grid } from 'semantic-ui-react'


const dv1Pie = [
    {letter: '2', frequency: 9}
]
const dv2Pie = [
    {letter: '0', frequency: 5},
    {letter: '1', frequency: 3},
    {letter: '2', frequency: 1},
]

export const VISUALIZATIONS = R.pipe(
    [
        {key: 'table', component: () => <>table coming soon</>},
        {key: 'bar', component: () => <BarVisualization />},
        {key: 'pie', component: () => <PieVisualization data={dv2Pie} />},
        {key: 'sunburst', component: () => <SunburstVisualization />},
        {key: 'treemap', component: () => <TreemapVisualization />},
        {key: 'heatmap', component: () => <HeatmapVisualization width={600} height={500} />},
        {key: 'violin', component: () => <ViolinVisualization width={600} height={500} />},
    ],
    R.map(({key, ...rest}) => ({key, ...rest, text: key, value: key}))
)

export function SnapshotVisualization ({snapshot}) {
    const {snapshotKey} = snapshot
    const VisComponent = R.pipe(
        VISUALIZATIONS,
        R.find(({key}) => R.equals(snapshotKey, key)),
        R.prop('component'),
    )
    return (
        <Grid>
            <Grid.Column width={4}>
            <Form>
                <TextArea />
            </Form>                
            </Grid.Column>
            <Grid.Column width={12}>
                <VisComponent key={snapshotKey} />
            </Grid.Column>
        </Grid>
    )
}