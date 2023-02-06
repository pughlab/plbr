import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import papa from 'papaparse'
import { Message, Divider, List, Container, Header, Input, Segment, Form, Button, Dropdown, Modal } from 'semantic-ui-react'
import * as R from 'ramda'



const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 20,
  borderColor: "#26C2E7",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#c4c4c4",
  outline: "none",
  transition: "border .24s ease-in-out"
};

const activeStyle = {
  borderColor: "#f2f"
};

const acceptStyle = {
  borderColor: "#00ff00"
};

const rejectStyle = {
  borderColor: "#fe0100"
};
function Dropzone({dispatch}) {
  // const [filterState, setFilterState] = useState({chromosome: '', start_GTE: '', end_LTE: '', datavalue_GTE: ''})

  // const setFilterValue = (prop: string, newValue: any) => setFilterState({...filterState, [prop]: newValue})

  let whereArray : any = []


  const [files, setFiles] = useState({});
  const {
    fileRejections,
    isDragActive,
    isDragAccept,
    isDragReject,
    getRootProps,
    getInputProps
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) =>
        acceptedFiles.reduce(
          (acc, file) => ({
            ...acc,
            [file.name]: {
              file,
              fileType: ""
            }
          }),
          prevFiles
        )
      );
      //parsing of uploaded bed file 
      papa.parse(acceptedFiles[0],{
        dynamicTyping:true,
        worker: true,
        delimiter: " ",
        // delimiter: "\t",
        // download: true,
        step: function(row){
            let objArray = {"chromosome": row.data[0], "start": row.data[1], "end": row.data[2], "datavalue": row.data[3]}
            console.log(objArray)

            whereArray.push(objArray)

            console.log("Row:", row.data);
        },
        complete: function(file) {
            // console.log("All done!");
            console.log(file)
            dispatch({type: 'bulkUpdateBinFilter', payload: whereArray})
        }
      });
    },
    accept: ".bed, .tsv"
  });
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {})
    }),
    [isDragActive, isDragReject, isDragAccept]
  );
  const acceptedFileItems = Object.keys(files).map((fileName) => {
    const currentFile = files[fileName].file;

    // console.log(filterState)
    // console.log(setFilterState)

    return (
        <div style={{ display: "flex" }}>
          <span>
            {currentFile.path} - {currentFile.size} bytes
          </span>
        </div>
    );
  });


  return (
    <section className="container">
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />

        {/* Text once file has been 'dropped' */}
        <Header
          content={(acceptedFileItems.length===0) ? "Drag 'n' drop some files here, or click to select files (Only .bed or .tsv files will be accepted)" : 
          acceptedFileItems}
          textAlign="center"
        />

      </div>
      <aside>
        {/* <h4>Accepted files</h4>
        <ol>{acceptedFileItems}</ol> */}
      </aside>
    </section>
  );
}

export default Dropzone;
