import React, { useState } from 'react'
import {Table, Segment, Button, Icon, Input, Dropdown, Divider, Label, Form} from 'semantic-ui-react'
import styled from 'styled-components'
import { 
    useTable, 
    useBlockLayout,
    usePagination,
    useSortBy,
    useFilters,
    useGroupBy,
    useExpanded,
    useRowSelect, 
    useMountedLayoutEffect
} from 'react-table'

import { FixedSizeList } from 'react-window'
import scrollbarWidth from './scrollbarWidth'
import { CSVLink } from 'react-csv';

import * as R from 'remeda'



// import makeData from './makeData'

const Styles = styled.div`
  padding: 1rem;

//   .table {
//     display: inline-block;
//     border-spacing: 0;
//     border: 1px solid black;

//     .tr {
//       :last-child {
//         .td {
//           border-bottom: 0;
//         }
//       }
//     }

//     .th,
//     .td {
//       margin: 0;
//       padding: 0.5rem;
//       border-bottom: 1px solid black;
//       border-right: 1px solid black;

//       :last-child {
//         border-right: 1px solid black;
//       }
//     }
//   }

.pagination {
    padding: 0.5rem;
  }
`

// Create an editable cell renderer
const EditableCell = ({
    value: initialValue,
    row: { index },
    column: { id },
    updateMyData, // This is a custom function that we supplied to our table instance
    editable,
  }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)
  
    const onChange = e => {
      setValue(e.target.value)
    }
  
    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      updateMyData(index, id, value)
    }
  
    // If the initialValue is changed externall, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])
  
    if (!editable) {
      return `${initialValue}`
    }
  
    return <input value={value} onChange={onChange} onBlur={onBlur} />
  }

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
  }) {
    const count = preFilteredRows.length
  
    return (
      <input
        value={filterValue || ''}
        onChange={e => {
          setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
        }}
        placeholder={`Search ${count} records...`}
      />
    )
  }

function MyTable({ columns, data, updateMyData, skipReset, selectedRows, onSelectedRowsChange }) {
  // Use the state and functions returned from useTable to build your UI

  const defaultColumn = React.useMemo(
    () => ({
        // Let's set up our default Filter UI
        Filter: DefaultColumnFilter,
        // And also our default editable cell
        Cell: EditableCell,
    }),
    []
  )

  const scrollBarSize = React.useMemo(() => scrollbarWidth(), [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    selectedFlatRows,
    //page, 
    // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    // canPreviousPage,
    // canNextPage,
    // pageOptions,
    // pageCount,
    // gotoPage,
    // nextPage,
    // previousPage,
    // setPageSize,
    state: {
        pageIndex,
        pageSize,
        sortBy,
        groupBy,
        expanded,
        filters,
        selectedRowIds,
      },
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        selectedRowIds: selectedRows
      },
      // updateMyData isn't part of the API, but
      // anything we put into these options will
      // automatically be available on the instance.
      // That way we can call this function from our
      // cell renderer!
      updateMyData,
      // We also need to pass this so the page doesn't change
      // when we edit the data.
      autoResetPage: !skipReset,
      autoResetSelectedRows: !skipReset,
      disableMultiSort: true,
    },
    useBlockLayout,
    useFilters,
    useGroupBy,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    // Here we will use a plugin to add our selection column
    hooks => {
        hooks.visibleColumns.push(columns => {
          return [
            {
              id: 'selection',
              // Make this column a groupByBoundary. This ensures that groupBy columns
              // are placed after it
              groupByBoundary: true,
              // The header can use the table's getToggleAllRowsSelectedProps method
              // to render a checkbox
              Header: ({ getToggleAllRowsSelectedProps }) => (
                <div>
                  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                </div>
              ),
              // The cell can use the individual row's getToggleRowSelectedProps method
              // to the render a checkbox
              Cell: ({ row }) => (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              ),
            },
            ...columns,
          ]
        })
      }
  )

  useMountedLayoutEffect(() =>{
    console.log("SELECTED ROWS CHANGED", selectedRowIds);
    onSelectedRowsChange && onSelectedRowsChange(selectedRowIds);
  }, [onSelectedRowsChange, selectedRowIds]);

  console.log(selectedFlatRows.map((d) => d.original))

  const RenderRow = React.useCallback(
    ({ index, isScrolling, style }) => {
      const row = rows[index]
      prepareRow(row)
      return (
        <Table.Row {...row.getRowProps({ style })}>
          {row.cells.map(cell => {
            return (
              <Table.Cell {...cell.getCellProps()}>
                  {cell.isGrouped ? (
                        // If it's a grouped cell, add an expander and row count
                        <>
                          <span {...row.getToggleRowExpandedProps()}>
                            {row.isExpanded ? '👇' : '👉'}
                          </span>{' '}
                          {cell.render('Cell', { editable: false })} (
                          {row.subRows.length})
                        </>
                      ) : cell.isAggregated ? (
                        // If the cell is aggregated, use the Aggregated
                        // renderer for cell
                        cell.render('Aggregated')
                      ) : cell.isPlaceholder ? null : ( // For cells with repeated values, render null
                        // Otherwise, just render the regular cell
                        isScrolling ? 'Loading...' : cell.render('Cell', { editable: true })
                      )}
              </Table.Cell>
            )
          })}
        </Table.Row>
      )
    },
    [prepareRow, rows, selectedRowIds]
  )

  // Render the UI for your table
  return (
    <>
    {/* displaying selected rows */}
    <code>
        {JSON.stringify(
          {
            selectedRowIds:selectedRowIds,
            "selectedFlatRows[].original": selectedFlatRows.map(
              (d) => d.original
            )
          }
        )}
      </code>
      {/* exporting selected rows */}
        <CSVLink data={selectedFlatRows.map((d) => d.original)} filename={"plbr_select_export.csv"}>
            <Button fluid content={`Export Selected Data Variables`} />
        </CSVLink>
    <Table {...getTableProps()} as={Segment} attached='bottom'>
        <Table.Header>
        {headerGroups.map(headerGroup => (
            <Table.Row {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
                <Table.HeaderCell {...column.getHeaderProps()}>
                    <div>
                    {column.canGroupBy ? (
                    // If the column can be grouped, let's add a toggle
                        <span {...column.getGroupByToggleProps()}>
                            {column.isGrouped ? '🛑 ' : <Icon disabled name='users' />}
                        </span>
                            ) : null}
                        <span {...column.getSortByToggleProps()}>
                            {column.render('Header')}
                            {/* Add a sort direction indicator */}
                            {column.isSorted ? column.isSortedDesc ? ' 🔽' : ' 🔼' : ''}
                        </span>
                    </div>
                    {/* Render the columns filter UI */}
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                </Table.HeaderCell>
            ))}
            </Table.Row>
        ))}
        </Table.Header>
        <Table.Body {...getTableBodyProps()}>
            <FixedSizeList useIsScrolling
            height={400}
            itemCount={rows.length}
            itemSize={50}
            width={totalColumnsWidth+scrollBarSize}
            >
          {RenderRow}
          </FixedSizeList>
        </Table.Body>
    </Table>
    </>
  )
}

const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef
  
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])
  
      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      )
    }
  )

export default function VirtualizedTable({data}) {
  const columns = React.useMemo(
    () => [
        {
            // Header: 'Id',
            // accessor: 'id'
            Header: 'Chromosome',
            accessor: 'chromosome'
        },
        {
            // Header: 'First Name',
            // accessor: 'first_name'
            Header: 'Start',
            accessor: 'start'
    
        },
        {
            // Header: 'Last Name',
            // accessor: 'last_name'
            Header: 'End',
            accessor: 'end'
        },
        {
            // Header: 'Date of Birth',
            // accessor: 'date_of_birth'
            Header: 'DataValue',
            accessor: 'datavalue'

        },
    ],
    []
  )
  const skipResetRef = React.useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    // We also turn on the flag to not reset the page
    skipResetRef.current = true
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...row,
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  }

  // After data changes, we turn the flag back off
  // so that if data actually changes when we're not
  // editing it, the page is reset
  React.useEffect(() => {
    skipResetRef.current = false
  }, [data])

  // Let's add a data resetter/randomizer to help
  // illustrate that flow...
  const resetData = () => {
    // Don't reset the page when we do this
    skipResetRef.current = true
    // setData(originalData)
  }

   data = React.useMemo(() => data, [])
//    data = React.useMemo(() => MOCK_DATA, [])

// const [selectedRows, setSelectedRows] = useState({ "0": true, "9": true});
const [selectedRows, setSelectedRows] = useState({})

console.log(data)

const selectedRowKeys = Object.keys(selectedRows);

console.log(data.curatedDatasets[0].dataVariables)

  return (
    <Styles>
      <MyTable 
        columns={columns} 
        data={data.curatedDatasets[0].dataVariables}
        updateMyData={updateMyData}
        skipReset={skipResetRef.current}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
         />
         <code>
        {JSON.stringify(
          {
            selectedRowKeys
          },
          null,
          2
        )}
      </code>
    </Styles>
  )
}

