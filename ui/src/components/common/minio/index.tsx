import React, { useCallback, useMemo, useState } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { Message, Divider, Container, Header, Icon, List, Input, Segment, Form, Button, Modal } from 'semantic-ui-react'
import SegmentPlaceholder from '../SegmentPlaceholder'
import { useDropzone, FileWithPath } from 'react-dropzone'
import { gql, useQuery } from '@apollo/client'
import useMinioUploadMutation from '../../../hooks/useMinioUploadMutation'


function MinioUploadModal({ bucketName }) {
    const { state: uploadState, dispatch: uploadDispatch, mutation: uploadMutation } = useMinioUploadMutation()

    const [testing, setTesting] = useState({})

    const onDrop = useCallback((files: FileWithPath[]) => {

        uploadMutation({
            variables: {
                bucketName: bucketName,
                file: files[0]
            }
        })
    }, [])


    const { getRootProps, getInputProps, isDragActive, isDragAccept,isDragReject,} = useDropzone({ onDrop })

    //styling
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

    const style = useMemo(
        () => ({
          ...baseStyle,
          ...(isDragActive ? activeStyle : {}),
          ...(isDragAccept ? acceptStyle : {}),
          ...(isDragReject ? rejectStyle : {})
        }),
        [isDragActive, isDragReject, isDragAccept]
      );
    return (
        <section className="container">
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
    
            {/* Dropzone Text*/}
            <Header
              content={"Drag 'n' drop some files here, or click to select files" }
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

export default function MinioBucket({ bucketName }) {
    const { data, loading, error } = useQuery(gql`
        query MinioUploads($bucketName: ID!) {
            minioUploads(where: {bucketName: $bucketName}) {
                bucketName
                objectName
                filename
            }
        }`,
        { variables: { bucketName }, fetchPolicy: 'network-only' })
    if (!data?.minioUploads) {
        return null
    }
    const { minioUploads } = data
    return (
        <Segment>
            <MinioUploadModal bucketName={bucketName} />
            <Divider horizontal />
            {!minioUploads.length ? <SegmentPlaceholder text={'No uploads yet'} /> :
                <List loading={loading} celled divided>
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
}