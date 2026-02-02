import React, { memo, useEffect, useState } from "react";
import { Button, Row, Col, Input, Modal, Text, Image } from "@nextui-org/react";
import { useGlobalContext } from "../../context/GlobalContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { tradeExcelUploadHandler } from "../../../services/transactions/transactions.service";
import { useRouter } from "next/router";
import { ipcRenderer } from "electron";

function UploadExcelSheetModal({ toggle, setToggle }) {
  const [uploadedFileName, setUploadedFileName] = useState("");
  const { tradeExcelFile, setTradeExcelFile, loginData, setExcelOrderItems, setEventId } = useGlobalContext();

  const router = useRouter();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (validateExcel(droppedFile)) {
      setUploadedFileName(droppedFile.name);
      setTradeExcelFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (validateExcel(selectedFile)) {
      setUploadedFileName(selectedFile.name);
      setTradeExcelFile(selectedFile);
    }
  };

  const validateExcel = (tradeExcelFile) => {
    return tradeExcelFile && tradeExcelFile.name.match(/\.(xls|xlsx)$/i);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleUpload = async () => {
    if (!tradeExcelFile) {
      toast.warn(`Please select an Excel file.`)
      return;
    }
    const formData = new FormData();
    formData.append("file", tradeExcelFile);
    formData.append("dealer_id", loginData.user_id);

    try {
      const res = await tradeExcelUploadHandler(formData);
      console.log("res upload", res);
      toast.success(res.message);
      setExcelOrderItems(res.data)
      setEventId(res.event_id)
      closeHandler();
      router.push({
        pathname: "/trade-excel",
        query: {
          orderItems: JSON.stringify(res.data) || [],
          eventId: res.event_id,
        },
      });
    } catch (error) {
      console.log("Uploading error", error);
    }
  };

  const closeHandler = (data) => {
    setToggle(false);
    setUploadedFileName("");
    setTradeExcelFile(null);
  };

  const handleDownloadSampleFile = async () => {
    // Triggering a file download for the sample file
    // const result = "trade-with-excel";
    // toast.success("File Download is complete , Check your download folder!");
    // await ipcRenderer.invoke("ipc-saveSampleCSV", result);
    handleDownload()  // download sample file

  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Sample_File_Trade_With_Excel.xlsx"; // path inside public/
    link.download = "Sample_File_Trade_With_Excel.xlsx"; // suggested filename
    link.click();
  };

  return (
    <div>
      <Modal
        scroll
        open={toggle}
        onClose={closeHandler}
        width="500px"
        css={{ height: "fit-content", padding: "30px" }}
        className={
          "membership-screen-moal border-radius-8 flex-col row-gap-10 justify-between"
        }
      // blur
      >
        <Modal.Header
          className={"flex-col align-center justify-center"}
          style={{
            margin: "0px",
            padding: "0px",
            borderRadius: "8px",
          }}
        >
          <Text
            h2
            css={{
              fontFamily: "inherit",
              fontSize: "20px",
              fontWeight: "700",
              margin: "0px",
              letterSpacing: "0.4px",
            }}
          >
            Upload
          </Text>
        </Modal.Header>
        <Modal.Body css={{ padding: "0px", marginTop: "20px" }}>
          <div
            className="drag-drop-wrapper flex-row align-center justify-center cursor-pointer"
            onDrop={handleDrop}
            style={{ marginBottom: "0px" }}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("excel-upload").click()}
          >
            <div
              className="flex-col align-center justify-center width-100"
              style={{ padding: "10px" }}
            >
              {uploadedFileName ? (
                <p
                  style={{ fontSize: "14px", color: "#3c57a2" }}
                  className="font-weight-600 text-underline"
                >
                  {uploadedFileName}
                </p>
              ) : (
                <>
                  <img
                    src="/images/excel-sheet-upload.jpg"
                    width={100}
                    height={100}
                    alt="upload"
                  />
                </>
              )}
              <p
                style={{
                  fontSize: "20px",
                  color: "#000000",
                  letterSpacing: 0.1,
                }}
                className="font-weight-600"
              >
                Drag & drop files or{" "}
                <span style={{ color: "#3c57a2" }} className="text-underline">
                  Browse
                </span>
              </p>
              <p
                style={{
                  color: "gray",
                  marginTop: "2px",
                  fontSize: "16px",
                  letterSpacing: 0.1,
                }}
              >
                Supported formats: Excel Only
              </p>
            </div>
            <input
              type="file"
              id="excel-upload"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div
            style={{
              display: "flex",
              marginLeft: "-1rem",
              alignItems: "center"
            }}
          >
            <div>
              <Image src="../images/Excelfiles.svg" width={50} />
            </div>
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "blue",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={handleDownloadSampleFile}
              >
                Download sample file
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="column-gap-10">
          <Button
            style={{
              margin: "0px",
              padding: "0px"
            }}
            auto
            flat
            className="primary-button border-radius-8 width-100"
            onClick={handleUpload}
          >
            <div className="flex-row align-center justify-center text-transform-uppercase width-100">
              Upload files
            </div>
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default memo(UploadExcelSheetModal);
