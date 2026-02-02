import { Button, Modal, Row, Spacer, Text } from "@nextui-org/react";

const SubmitModal = ({ submitVisible, setSubmitVisible, file, ipcReadCSV }) => {
  const closeHandlerSubmit = () => {
    ipcReadCSV();
    setSubmitVisible(false);
  };

  const closeHandler = () => {
    setSubmitVisible(false);
  };
  return (
    <div>
      <Modal aria-labelledby="modal-title" open={submitVisible} preventClose>
        <Modal.Body>
          <Row justify="center">
            <Text b h5>
              Would you like to submit {file.name}?
            </Text>
          </Row>
          <Row justify="flex-end">
            <Button
              className="secondary-button border-radius-8"
              auto
              flat
              onPress={closeHandler}
            >
              Cancel
            </Button>
            <Spacer x={0.5} />
            <Button
              className="primary-button border-radius-8"
              auto
              onPress={closeHandlerSubmit}
            >
              Submit
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SubmitModal;
