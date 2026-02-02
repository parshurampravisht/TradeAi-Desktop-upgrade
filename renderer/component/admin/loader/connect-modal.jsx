import { Button, Modal, Row, Spacer, Text, Loading } from "@nextui-org/react";
import { useState } from "react";

const ConnectModal = ({
  connectVisible,
  setConnectVisible,
  resStatus,
  setResStatus,
  validSheet,
  setValidSheet,
  loadError,
  setLoadError,
}) => {
  const closeHandler = () => {
    setConnectVisible(false);
    setLoadError(false);
    setResStatus(true);
    setValidSheet(true);
  };

  const displayStatus = () => {
    if (!validSheet) {
      return "Please upload a valid excel sheet.";
    } else {
      if (resStatus) {
        return "Loading Clients...";
      } else {
        if (loadError) {
          return "There's some problem..";
        } else {
          return "Loaded Successfully!";
        }
      }
    }
  };

  return (
    <div>
      <Modal aria-labelledby="modal-title" open={connectVisible} preventClose>
        <Modal.Body>
          <Row justify="center">
            {resStatus ? (
              <Loading size="lg" type="spinner" color="primary" />
            ) : (
              ""
            )}
            {displayStatus()}
          </Row>
          <Row justify="center">
            {!resStatus && (
              <Button
                className={`${
                  resStatus ? `disable-button` : `primary-button`
                } border-radius-8`}
                auto
                flat
                onPress={closeHandler}
                disabled={resStatus}
              >
                OK
              </Button>
            )}
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ConnectModal;
