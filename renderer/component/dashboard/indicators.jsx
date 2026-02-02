import { Grid, Row, Container } from "@nextui-org/react";
import SymbolIndicator from "./indicator/symbolIndicator";
import TopRightNavigationButton from "../common/TopRightNavigationButton";

function Indicators() {
  return (
    <>
      <Container
        css={{
          width: "100%",
          backgroundColor: "#E9E9E9",
          margin: "0px",
          paddingLeft: "0px",
          paddingRight: "1%",
          maxWidth: "100%"
        }}
      >
        <Grid.Container justify="space-between">
          <Grid>
            <SymbolIndicator />
          </Grid>
          <div style={{ height: "auto" }}>
            <Row justify="center" align="center" style={{ height: "100%" }}>
              <TopRightNavigationButton />
            </Row>
          </div>
        </Grid.Container>
      </Container>
    </>
  );
};

export default Indicators;
