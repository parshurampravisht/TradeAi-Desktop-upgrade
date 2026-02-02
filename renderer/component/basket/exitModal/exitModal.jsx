import { Modal, Image, Text, Button } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
export default function ExitModal(props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const handleClose = () => {
    props.setToggle(false);
    props.setCurrentState("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (props.basketType === "draft") {
      setMessage("Your Order is saved in draft , please check dashboard");
    } else {
      setMessage("Your Order is placed , please check dashboard");
    }
  }, [props]);

  return (
    <Modal open={props.toggle} onClose={handleClose} blur>
      <Modal.Header>
        <Image src="../images/greentick.svg" width={40} />
      </Modal.Header>
      <Modal.Body>
        <Text>{message}</Text>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="primary-button border-radius-8"
          auto
          bordered
          flat
          onClick={handleClose}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
