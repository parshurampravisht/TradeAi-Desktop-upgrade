import { Modal, Button, Text, Grid, Row, Spacer, Input, Col } from "@nextui-org/react";

const BasketOrderBase = ({showBasket,setShowBasket}) => {
    return (
      <Modal
        fullScreen
        open={showBasket}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Modal.Header>
          <Text id="modal-title" size={18}>
            Basket Order
          </Text>
        </Modal.Header>
        <Modal.Body>
            <Grid.Container justify="flex-start" style={{ flexWrap: "nowrap" }} >
            <Row>
                <Col>
                <Row justify="left" css={{ pl: "$6" }}>
                    <Text color="#2C2C2C" font-family="Poppins" h4>
                            Basket Name
                    </Text>
                    <Spacer x={6.5} />
                    <Input
                    bordered
                            css={{ pl: "$27" }}
                            placeholder="Basket Name"
                            onChange={({ target: { value } }) => {
                            
                            }}
                        />
                </Row>
                <Spacer y={.5} />

                <Row justify="left" css={{ pl: "$6" }}>
                    <Text color="#2C2C2C" font-family="Poppins" h4>
                            Basket Size
                    </Text>
                    <Spacer x={7.2} />
                    <Input
                    bordered
                            css={{ pl: "$27" }}
                            placeholder="Basket Size"
                            onChange={({ target: { value } }) => {
                            
                            }}
                        />
                </Row>
                <Spacer y={.5} />

                <Row justify="left" css={{ pl: "$6" }}>
                    <Text color="#2C2C2C" font-family="Poppins" h4>
                            Weight (%)
                    </Text>
                    <Spacer x={7.1} />
                    <Input
                    bordered
                            css={{ pl: "$27" }}
                            placeholder="Weight"
                            onChange={({ target: { value } }) => {
                            
                            }}
                        />
                </Row>
                <Spacer y={.5} />

                <Row justify="left" css={{ pl: "$6" }}>
                    <Text color="#2C2C2C" font-family="Poppins" h4>
                           Margin %
                    </Text>
                    <Spacer x={7.5} />
                    <Input
                    bordered
                            css={{ pl: "$27" }}
                            placeholder="Margin %"
                            onChange={({ target: { value } }) => {
                            
                            }}
                        />
                </Row>
                </Col>
                </Row>
            </Grid.Container>
        </Modal.Body>
        <Modal.Footer>
          <Button flat auto color="error" onPress={() => setShowBasket(false)}>
            Close
          </Button>
          <Button flat auto onPress={() => setShowBasket(false)}>Agree</Button>
        </Modal.Footer>
      </Modal>
     );
}
 
export default BasketOrderBase;


