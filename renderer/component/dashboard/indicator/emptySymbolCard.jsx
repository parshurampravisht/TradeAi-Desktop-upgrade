import { Card, Col, Row, Spacer, Text } from "@nextui-org/react";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";

const EmptySymbolCard = ({ buySell }) => {
  const Colorgrid = buySell ? "#E9FFDB" : "#FDEEEF";
  return (
    <>
      <Card
        // isHoverable
        variant="bordered"
        css={{
          mt:"$6",
          bgColor: Colorgrid,
          width: "14rem",
          height: "6.5rem",
        }}
      >
        <Spacer y={0.6} />
        <Row justify="center" css={{ lineHeight: "$xs", mt: "$10" }}>
          <Text h4>No Symbol</Text>
        </Row>
      </Card>
    </>
  );
};

export default EmptySymbolCard;
