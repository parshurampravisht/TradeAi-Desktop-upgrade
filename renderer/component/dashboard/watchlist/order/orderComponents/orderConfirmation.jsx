import { Button, Modal, Text } from "@nextui-org/react";

export default function Confirmation(props) {

  const closeHandlerConfirmation = (action) => {
    // this toggle will close the model , you can bind it to cancel button as well
    props.setConfirmationToggle(false);
    //for main place order screen
    if (action == "placeOrder") {
      props.closeHandler();
    }
  };
  return (
    <div>
      <Modal
        open={props.confirmationToggle}
        onClose={closeHandlerConfirmation}
        blur
      >
        <Modal.Header> Order Confirmation </Modal.Header>
        <Modal.Body>
          {" "}
          <Text> Please confirm the order by clicking submit button </Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="secondary-button border-radius-8"
            auto
            flat
            onPress={() => closeHandlerConfirmation("cancel")}
          >
            {" "}
            Cancel
          </Button>{" "}
          {/* link it close handler here  */}
          <Button
            auto
            className="primary-button border-radius-8"
            flat
            onPress={() => {
              props.placeOrder();
              closeHandlerConfirmation("placeOrder");
            }}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
