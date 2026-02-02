import { Modal, Text, Button, Table } from "@nextui-org/react";
import { getLTPService } from "../../../../services/transactions/transactions.service";
import { useState, useEffect, useCallback } from "react";
import { findIndex } from "lodash/fp";
import { useGlobalContext } from "../../../context/GlobalContext";

export default (props) => {
  const { symbolTableWithScripcode } = props;
  const { symbolDropdown } = useGlobalContext();
  const [symbolName, setSymbolName] = useState({});
  const [data, setData] = useState([]);

  const handleClose = useCallback(() => {
    props.setToggle(false);
  }, [props.setToggle]);

  const handleSubmit = useCallback(() => {
    props.executeData(data);
    props.setToggle(false);
  }, [data, props.setToggle, props.executeData]);

  const getLTP = async () => {
    const symbolData = symbolTableWithScripcode || [];
    // const symbolData = symbolDropdown.BSE;
    let scripcodes = [];
    const item = [];
    props.selectedSymbols?.forEach((symbol) => {
      for (let i = 0; i < symbolData.length; i++) {
        if (symbolData[i].label === symbol.label) {
          const exch =
            symbolData[i].Exch === "N"
              ? "NSE"
              : symbolData[i].Exch === "B"
              ? "BSE"
              : !symbolData[i].Exch
              ? "NSE"
              : "MCX";
          scripcodes.push({ [exch]: symbolData[i].Scripcode });
          setSymbolName({
            ...symbolName,
            [symbol.label]: symbolData[i].Scripcode,
          });
          item.push({
            Scripcode: symbolData[i]?.Scripcode,
            Symbol: symbol.label,
            exch,
          });
        }
      }
    });
    let ltp =
      (await getLTPService({
        scripcodes,
      })) || [];
    if (ltp.length) {
      ltp?.map(({ scripcode, ltp }) => {
        const index = findIndex({ Scripcode: scripcode }, item);
        item[index].LTP = ltp;
      });
    }
    setData(item);
  };

  useEffect(() => {
    getLTP();
  }, [props.selectedSymbols]);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      const name = e.target.getAttribute("name");
      const Scripcode = Number(
        e.currentTarget.parentElement.parentElement.getAttribute("data-key")
      );
      const index = findIndex({ Scripcode }, data);
      const tempData = [...data];
      tempData[index][name] =
        e.target.type === "number" ? Number(value) : value;
      setData([...tempData]);
      const lastElem = e.target.parentElement.parentElement.lastChild;
      const secondlastElem = lastElem.previousElementSibling;
      if (name === "OrderType") {
        switch (value) {
          case "SM":
            lastElem.firstChild.removeAttribute("disabled");
            secondlastElem.firstChild.setAttribute("disabled", true);
            break;
          case "SL":
            lastElem.firstChild.removeAttribute("disabled");
            secondlastElem.firstChild.removeAttribute("disabled");
            break;
          case "LIMIT":
            secondlastElem.firstChild.removeAttribute("disabled");
            lastElem.firstChild.setAttribute("disabled", true);
            break;
          default:
            lastElem.firstChild.setAttribute("disabled", true);
            secondlastElem.firstChild.setAttribute("disabled", true);
        }
      }
    },
    [data, setData]
  );
  return (
    <Modal open={props.toggle} onClose={handleClose} width="800px">
      <Modal.Body>
        <h4>Execute order</h4>
        <Text>Please confirm the order by clicking submit button.</Text>
        <Table
          aria-label="Example table with dynamic content"
          bordered
          containerCss={{
            overflow: "auto",
            minWidth: "100%",
          }}
          compact
          striped
          sticked
          hoverable
        >
          <Table.Header
            columns={[
              { key: "1", label: "Stocks" },
              { key: "2", label: "LTP" },
              { key: "3", label: "Exchange" },
              { key: "4", label: "Type" },
              { key: "5", label: "Product" },
              { key: "6", label: "Limit Price" },
              { key: "7", label: "Trigger Price" },
            ]}
          >
            {(column) => (
              <Table.Column
                // maxWidth={"2px"}
                key={column.key}
              >
                {column.label}
              </Table.Column>
            )}
          </Table.Header>

          <Table.Body items={data}>
            {(item) => (
              <Table.Row key={item?.Scripcode}>
                <Table.Cell>{item?.Symbol}</Table.Cell>
                <Table.Cell>{item?.LTP || "0.00"}</Table.Cell>
                <Table.Cell>{item?.exch}</Table.Cell>
                {/* <Table.Cell>
                  <select
                    name="Exchange"
                    value={item?.Exchange}
                    onChange={handleChange}
                  >
                    <option value={"NSE"}>NSE</option>
                    <option value={"BSE"}>BSE</option>
                  </select>
                </Table.Cell> */}
                <Table.Cell>
                  <select
                    name="OrderType"
                    value={item?.OrderType}
                    onChange={handleChange}
                  >
                    <option value="MKT">MKT</option>
                    <option value="LIMIT">LIMIT</option>
                    <option value="SM">SLM</option>
                    <option value="SL">SLL</option>
                  </select>
                </Table.Cell>
                <Table.Cell>
                  <select
                    name="ProductType"
                    value={item?.ProductType}
                    onChange={handleChange}
                  >
                    <option value={"NRML"}>DEL</option>
                    <option value={"MIS"}>INTRA</option>
                  </select>
                </Table.Cell>
                <Table.Cell>
                  <input
                    disabled
                    name="LimitPrice"
                    type="number"
                    placeholder="0.00"
                    style={{ width: "70px" }}
                    onChange={handleChange}
                  />
                </Table.Cell>
                <Table.Cell>
                  <input
                    disabled
                    name="SLTriggerPrice"
                    type="number"
                    placeholder="0.00"
                    style={{ width: "70px" }}
                    onChange={handleChange}
                  />
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button
          auto
          bordered
          flat
          className="secondary-button border-radius-8"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          className="primary-button border-radius-8"
          auto
          bordered
          flat
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
