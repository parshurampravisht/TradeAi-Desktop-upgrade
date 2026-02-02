import { Card } from "@nextui-org/react";

const InputParam = () => {
  return (
    <>
      <Card
        css={{
          "@sm": { maxWidth: "550px" },
          minHeight: "550px",
        }}
        //   previously 700
      >
        <Card.Body css={{ p: "$3" }}>
          {" "}
          <h1>Input parameters</h1>
        </Card.Body>
      </Card>
    </>
  );
};

export default InputParam;
