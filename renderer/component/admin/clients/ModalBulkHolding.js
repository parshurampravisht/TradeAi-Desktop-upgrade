import React, { useEffect, useState, useCallback } from "react";
import {
  Button,
  Col,
  Modal,
  Row,
  Spacer,
  Text,
  Image,
} from "@nextui-org/react";
import Dropzone from "react-dropzone";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModalBulkHolding = ({
  BulkHolding,
  setBulkHolding,
  BulkMOdalScreen,
  handleDownloadOfflineSampleFile,
  handleOfflineData,
}) => {
  const [selectedFiles, setSelectedFiles] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [fileInfos, setFileInfos] = useState([]);

  useEffect(() => {}, []);

  const onDrop = useCallback((files) => {
    if (files.length > 0) {
      setSelectedFiles(files);
      setProgress(0);
      setMessage("");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");

    const formData = new FormData();
    formData.append("file", selectedFiles && selectedFiles[0]); // Append the actual file object
    formData.append("user_id", userId);
    if (BulkMOdalScreen === "holding") {
      try {
        const res = await axios.post(
          "http://127.0.0.1:6001/api/prod/offline/holdings-upload/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (event) => {
              setProgress(Math.round((100 * event.loaded) / event.total));
            },
          }
        );
        setMessage(res.data.name);
        toast.success("Holding uploaded");
        setBulkHolding(false);
        setSelectedFiles("");
      } catch (error) {
        toast.error("Error uploading file.");
      }
    } else if (BulkMOdalScreen === "Client") {
      try {
        const res = await axios.post(
          "http://127.0.0.1:6001/api/prod/offline/client-upload/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (event) => {
              setProgress(Math.round((100 * event.loaded) / event.total));
            },
          }
        );
        setMessage(res.data.name);
        toast.success("Login Offline Clients Upload Successfully");
        setBulkHolding(false);
        setSelectedFiles("");
        handleOfflineData();
      } catch (error) {
        toast.error("Error uploading file.");
      }
    }
  };

  return (
    <>
      <Modal
        scroll
        open={BulkHolding}
        preventClose
        width="650px"
        css={{ height: "auto" }}
      >
        <Modal.Header>
          <Text h4 size={"$lg"} css={{ fontFamily: "$sans" }}>
            {BulkMOdalScreen === "holding"
              ? "Add Bulk holdings"
              : "Add Bulk Client"}
          </Text>
        </Modal.Header>
        <Modal.Body css={{ border: "$accents2" }}>
          <Spacer y={-1.7} />

          <Modal.Body>
            <Row>
              <Col md={12}>
                <div>
                  <Dropzone onDrop={onDrop} multiple={false}>
                    {({ getRootProps, getInputProps }) => (
                      <section>
                        <div {...getRootProps({ className: "dropzone" })}>
                          <input {...getInputProps()} />
                          {selectedFiles && selectedFiles[0]?.name ? (
                            <div className="selected-file">
                              {selectedFiles && selectedFiles[0]?.name}
                            </div>
                          ) : (
                            <>
                              <Image
                                src="../images/Uploadicon.svg"
                                width={50}
                              />
                              <p>Drag & drop files or Browse</p>
                              <p style={{ fontSize: "12px" }}>
                                Supported formats: xlsx and CSV file
                              </p>
                            </>
                          )}
                        </div>
                      </section>
                    )}
                  </Dropzone>

                  <div
                    style={{
                      display: "flex",
                      marginLeft: "-1rem",
                    }}
                  >
                    <div>
                      <Image src="../images/Excelfiles.svg" width={50} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "12px",
                          marginTop: "15px",
                          color: "blue",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                        onClick={handleDownloadOfflineSampleFile}
                      >
                        Download sample file
                      </p>
                    </div>
                  </div>
                  <div className="alert alert-light" role="alert">
                    {message}
                  </div>

                  {fileInfos.length > 0 && (
                    <div className="card">
                      <div className="card-header">List of Files</div>
                      <ul className="list-group list-group-flush">
                        {fileInfos.map((file, index) => (
                          <li className="list-group-item" key={index}>
                            <a href={file.url}>{file.name}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Modal.Body>
          {/* {selectedFiles && (
                    <div className="progress mb-3">
                      <Progress
                        color="primary"
                        value={progress}
                        max={100}
                        striped
                        animated
                      >
                        {progress}%
                      </Progress>
                    </div>
                  )} */}
        </Modal.Body>
        <Modal.Footer>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              position: "relative",
              left: "-6%",
              marginBottom: "12px",
            }}
          >
            <Button
              className={`border-radius-8 secondary-button`}
              auto
              flat
              onClick={() => {
                setBulkHolding(false);
                setSelectedFiles("");
              }}
            >
              Cancel
            </Button>

            <form onSubmit={handleSubmit}>
              <Button
                className={`border-radius-8 ${
                  !selectedFiles ? `disable-button` : `primary-button`
                }`}
                auto
                flat
                type="submit"
                css={{ background: "$blue600", color: "white" }}
                disabled={!selectedFiles}
              >
                Upload
              </Button>
            </form>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalBulkHolding;
