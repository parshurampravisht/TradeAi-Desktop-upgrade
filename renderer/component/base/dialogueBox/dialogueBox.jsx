import { Button, Grid, Modal, Spacer, Text } from "@nextui-org/react";

const DialogueBox = ({ open, message, yesAction, noAction }) => {
  return (
    <div>
      <Modal style={{ padding: '10px' }} open={open} /* onClose={closeHandler} */ blur preventClose >
        <Text>{message}</Text>
        <Spacer y={1} />
        <Grid.Container justify="center" style={{ columnGap: '20px' }}>
          <Button className="secondary-button" color={'error'} auto flat onPress={yesAction}>Yes</Button>
          <Button className="primary-button" auto flat onPress={noAction}>No</Button>
        </Grid.Container>
      </Modal>
    </div>
  )
}

export default DialogueBox;