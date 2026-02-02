import { Button, Modal, Row, Spacer, Text } from "@nextui-org/react";

const SubmitModal = ({ submitVisible, setSubmitVisible }) => {
  const closeHandler = () => {
    setSubmitVisible(false);
  };
  return (
    <div>
      <Modal aria-labelledby="modal-title" open={submitVisible} preventClose>
        <Modal.Body>
          <Row justify="center">
            <Text b h5>
              Order Placed, Please check order book
            </Text>
          </Row>
          <Row justify="center">
            <Button auto flat color="error" onPress={closeHandler}>
              Close
            </Button>
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SubmitModal;
