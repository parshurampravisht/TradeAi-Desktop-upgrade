import { Row, Spacer, Text, Divider, Image } from "@nextui-org/react";
import classes from "./BasketModel.module.css";
import { useGlobalContext } from "../../context/GlobalContext";
const GroupBasket = () => {
  const { groupInputList } = useGlobalContext();
  return (
    <div>
      <Spacer x={0.5} />
      <Divider></Divider>
      <Row>
        <table
          aria-label="Example static collection table"
          className={classes.table1}
        >
          <thead>
            <tr>
              <th className={classes.th1}>S. No.</th>
              <th className={classes.th1}>Broker</th>
              <th className={classes.th1}>Client Id</th>
              <th className={classes.th1}>Multiple</th>
              <th className={classes.th1}>Available Margin</th>
              <th className={classes.th1}>Action</th>
            </tr>
          </thead>
          <tbody className={classes.tbody1}>
            {groupInputList?.length > 0
              ? groupInputList?.map((element, index) => {
                  return (
                    <tr key={element.id} className={classes.tr1}>
                      <td className={classes.td1}>{index + 1}</td>
                      <td className={classes.td1}>
                        {
                          <Image
                            src={`images/brokers/${element[
                              "Broker"
                            ].toLowerCase()}.png`}
                            width={20}
                          />
                        }
                      </td>
                      <td className={classes.td1}>{element?.ClientId}</td>

                      <td className={classes.td1}>
                        <input
                          type="text"
                          style={{ width: "30%" }}
                          onChange={(e) => handlerInput(e)}
                        />
                      </td>
                      <td className={classes.td1}>
                        <Text h6>{element?.CashMargin}</Text>
                      </td>
                      <td className={classes.td1}>
                        <img
                          src="images/iconsdelete.png"
                          width={30}
                          style={{
                            cursor: "pointer",
                            color: "red",
                            marginLeft: "10px",
                            width: "20px",
                          }}
                          // onClick={() => handlerDelete(element?.value)}
                        />
                      </td>
                    </tr>
                  );
                })
              : ""}
          </tbody>
        </table>
      </Row>
    </div>
  );
};

export default GroupBasket;
