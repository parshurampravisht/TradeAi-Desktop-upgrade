import { Card, Input, Text, Textarea, Grid, Modal } from "@nextui-org/react";
import TerminalWindow from "../dashboard/terminal/terminal";
// import { Modal, Button, Text, Input, Row, Checkbox } from "@nextui-org/react";

const CmdCli = (props) => {
  console.log("showCmdCli",props);
  return (
    <>
      {/* <Card
        css={{
          "@sm": { maxWidth: "550px" },
          "@lg": { maxWidth: "calc(95%)" },
          "@xl": { maxWidth: "calc(75%)" },
          minWidth: "100%",
          minHeight: "550px",
          overflowY: "hidden",
          background: "#000",
        }}
        //   previously 700
      >
        <Card.Body>
          {" "}
        </Card.Body>
      </Card> */}

      <Modal
        closeButton
        open={props?.showCmdCli}
        css={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 9999, // Adjust this value as needed
          // overflow: "auto",
          background: "#000",
          padding: 0,
          margin: 0,
        }}
      >
        <Modal.Body>
          <TerminalWindow></TerminalWindow>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CmdCli;
