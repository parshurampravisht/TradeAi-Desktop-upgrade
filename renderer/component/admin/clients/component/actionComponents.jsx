import { Image, Row, Tooltip } from "@nextui-org/react";

const errorlog = (cellData) => {
  var errorString = "";
  const errorKeys = Object.keys(cellData.data);
  errorKeys.forEach((error) => {
    if (!cellData.data[error]) {
      errorString += "* " + error + " ";
    }
  });
  return errorString;
};
const statusComponent = (cellData) => {
  if (cellData.status) {
    return (
      <Row justify="center">
        <Image src={"images/user_connected.svg"} width={20} height={20}></Image>
      </Row>
    );
  } else {
    return (
      <Row justify="center">
        <Tooltip content={errorlog(cellData)} color="error">
          <Image
            src={"images/user_notConnected.svg"}
            width={20}
            height={20}
          ></Image>
        </Tooltip>
      </Row>
    );
  }
};
const ActionComponents = (props) => {
  const cellData = props.cell._cell.row.data.rowStatus;
  //   
  return <>{statusComponent(cellData)}</>;
};

export default ActionComponents;
