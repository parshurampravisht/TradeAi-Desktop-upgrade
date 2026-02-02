import {
  Container,
  Card,
  Row,
  Text,
  Col,
  Spacer,
  Table,
  Button,
  Box,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Navbar,
  Grid,
} from "@nextui-org/react";
import { useAsyncList } from "@nextui-org/react";
import { React, useState, useEffect } from "react";
import Link from "next/link";

const DashboardTable = ({ tableColumns, filteredbody }) => {
  

  //when no data received from the table api
  // if (tableColumns.length == 0 || filteredbody.length == 0) {
  //   return (
  //     <>
  //       <Container xl>
  //         <Card css={{ $$cardColor: "$colors$primary", height: "67vh" }}>
  //           <Card.Body>
  //             <Row justify="center" align="center">
  //               <Spacer y={20} />
  //               <Text h2 color="white" css={{ m: 0 }}>
  //                 Empty data!
  //               </Text>
  //             </Row>
  //           </Card.Body>
  //         </Card>
  //       </Container>
  //     </>
  //   );
  // }

  //when data is received from the table api
  return (
    <>
      {/* <Card css={{ width: "100%" }}>
        <Card.Body css={{ p: "$3" }}> */}
      <Row justify="flex-start" align="center" css={{ width: "100%", p: "$5" }}>
        <Table
          aria-label="Example table with dynamic content"
          bordered
          containerCss={{
            overflow: "auto", //changes height for dashboard
            height: "32.5vw",
            maxWidth: "40vw",
            minWidth: "100%",
          }}
          compact
          striped
          sticked
          hoverable
        >
          <Table.Header columns={tableColumns}>
            {(column) => (
              <Table.Column
                // maxWidth={"2px"}
                align="center"
                key={column.key}
              >
                {column.label}
              </Table.Column>
            )}
          </Table.Header>

          <Table.Body items={filteredbody}>
            {(item) => (
              <Table.Row key={item.key}>
                {(columnKey) => (
                  <Table.Cell
                    css={{
                      borderStyle: "solid",
                      borderWidth: "1px",
                      borderColor: "$gray200",
                      padding: "$5",
                    }}
                  >
                    {item[columnKey]}
                  </Table.Cell>
                )}
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Row>
      {/* </Card.Body>
      </Card> */}
    </>
  );
};

export default DashboardTable;
