import {
  Col,
  Container,
  Grid,
  Image,
  Input,
  Row,
  Table,
  Text,
} from "@nextui-org/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { currencyFormatter } from "../../../../../helpers";
const groupColumnHeaders = [
  {
    id: 1,
    headerName: "BRKR",
  },
  {
    id: 2,
    headerName: "Client Id",
  },
  {
    id: 3,
    headerName: "Client Name",
  },
  {
    id: 4,
    headerName: "Cash Available",
  },
  {
    id: 5,
    headerName: "Invested Amount",
  },
  {
    id: 6,
    headerName: "Qty of Shares",
  },
];
const OrderInputGroups = ({ groupData = [], setGroupInputList }) => {
  return (
    <>
      <Grid>
        <Table compact striped sticked hoverable>
          <Table.Header>
            {groupColumnHeaders.map(({ headerName, id }) => {
              return (
                <Table.Column key={id.toString()} css={{ textAlign: "center" }}>
                  {headerName}
                </Table.Column>
              );
            })}
          </Table.Header>
          <Table.Body>
            {!!groupData.length &&
              groupData.map((item, index) => {
                const shareAvailable = item["available_balance"] / item["ltp"];

                return (
                  <Table.Row key={index}>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Image
                        src={`images/brokers/${item[
                          "broker"
                        ]?.toLowerCase()}.png`}
                        width={20}
                      />
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      {item["client_code"]}
                    </Table.Cell>

                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text h6>{item["client_formal_name"]}</Text>
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text h6>
                        {currencyFormatter(item["available_balance"])}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                      }}
                    >
                      <Text h6>
                        {currencyFormatter(item["invested_price_sum"])}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      css={{
                        borderStyle: "solid",
                        borderWidth: "1px",
                        borderColor: "$gray200",
                        padding: "$5",
                        width: "100px",
                      }}
                    >
                      <Input
                        className={
                          item["shares_qty_with_invested"] > shareAvailable
                            ? "errorBorder"
                            : ""
                        }
                        name="shares_qty_with_invested"
                        onChange={(e) => {
                          if (e.target.value > shareAvailable) {
                            toast.error(
                              "Margin shortage hence trade can't be placed."
                            );
                          }
                          const data = [...groupData];
                          data[index]["shares_qty_with_invested"] =
                            e.target.value;
                          setGroupInputList(data || []);
                        }}
                        value={
                          item["shares_qty_with_invested"] === "NA"
                            ? "-"
                            : item["shares_qty_with_invested"]
                        }
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table>
      </Grid>
    </>
  );
};

export default OrderInputGroups;
