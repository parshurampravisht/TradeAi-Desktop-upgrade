import { Button, Card, Image, Row, Text } from "@nextui-org/react";
import { useRouter } from "next/router";

const EmptyStatus = (props) => {
  const router = useRouter();

  const handlerClickFOBasket = () => {
    router.push("/BasketOptions");
  };

  const handleWebHook = () => {
    router.push("/Webhook");
  };
  
  return (
    <>
      <Card variant="bordered" css={{ width: "100%", height: "70vh" }}>
        <Card.Body>
          <Row justify="center" css={{ mt: "$20" }}>
            <Image src="../images/basket-fill.png" width={100} />
          </Row>
          <Row justify="center" css={{ mb: "$10" }}>
            <Text
              h4
              css={{
                color: "$gray600",
                width: "max-content",
              }}
            >
              You have not created any basket{" "}
            </Text>
          </Row>
          <Row justify="center">
            <Button
              className={"primary-button border-radius-8"}
              auto
              flat
              onPress={props.addToggle}
              css={{ width: "10rem" }}
            >
              + Equity Basket
            </Button>

            <Button
              className={"primary-button border-radius-8"}
              auto
              flat
              css={{
                width: "10rem",
                marginLeft: "15px",
              }}
              onPress={handlerClickFOBasket}
            >
              + F&O Basket
            </Button>
          </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default EmptyStatus;
