import { Button, Modal, Row, Spacer, Text, Loading } from "@nextui-org/react";
import { useGlobalContext } from "../../../../../context/GlobalContext";
import { useRouter } from "next/router";

const PlaceOrderModal = ({
  orderStat,
  orderStatVisible,
  setOrderStatVisible,
  successClient, //remove if orderReqStatusMessage works
  failClient, //remove if orderReqStatusMessage works
  orderReqStatusMessage,
}) => {
  const router = useRouter();
  const closeHandler = () => {
    router.push("/equity");
    setOrderStatVisible(false);
  };
  return (
    <div>
      <Modal aria-labelledby="modal-title" open={orderStatVisible} preventClose>
        <Modal.Body className="flex-col align-center justify-center" style={{ width: "400px", height: "160px" }}>
          {orderReqStatusMessage ?
            (
              <>
                <Row justify="center">
                  <Text>{orderReqStatusMessage}</Text>
                </Row>
                <Row justify="center">
                  <Button
                    className="primary-button border-radius-8"
                    auto
                    flat
                    onPress={closeHandler}
                  // disabled={orderStat}
                  >
                    OK
                  </Button>
                </Row>
              </>
            ) : (
              <Loading type="spinner" size="md" />
            )
          }
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PlaceOrderModal;
