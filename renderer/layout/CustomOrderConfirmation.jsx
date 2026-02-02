import { Button, Modal, Text } from "@nextui-org/react";

export default function CustomOrderConfirmation({
  toggle,
  setToggle,
  closeHandler,
  submitHandler,
  headerText = `Order Confirmation`,
  subHeaderText = `Please confirm the order by clicking submit button`,
  submitBtnText = `Submit`,
  cancelBtnText = `Cancel`,
  isDisabledConfirm = false,
}) {
  return (
    <>
      <Modal open={toggle} onClose={closeHandler} blur>
        <Modal.Header> {headerText} </Modal.Header>
        <Modal.Body>
          <Text>{subHeaderText} </Text>
        </Modal.Body>
        <Modal.Footer style={{ margin: "0.5rem" }}>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            onPress={setToggle}
          >
            {cancelBtnText}
          </Button>
          <Button
            auto
            className="primary-button border-radius-8"
            flat
            disabled={isDisabledConfirm}
            onPress={submitHandler}
          >
            {submitBtnText}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
