import { useState, useEffect, useRef } from "react";
import { Modal, Image, Text, Button, Row } from "@nextui-org/react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classes from "../../../component/options/BasketModel.module.css";
import { useGlobalContext } from "../../../context/GlobalContext";
import {
    brokerLogoFormatHandler,
    conversionProductType,
    ExchangeSquareOff2,
    orderTypeFormat,
    productType,
    shortProductType,
    variety_type,
} from "../../../constant/constant";
import {
    convertPositionHandler,
    modifyOrder,
} from "../../../../services/transactions/transactions.service";
import CustomToolTip from "../../../layout/CustomToolTip";

const conversionProductPayload = {
    exchange: "",
    symboltoken: "",
    oldproduct: "",
    newproduct: "",
    // "tradingsymbol": "",
    symbolname: "",
    // instrumenttype: "",
    // priceden: "1",
    // pricenum: "1",
    // genden: "1",
    // gennum: "1",
    // precision: "2",
    // multiplier: "-1",
    // boardlotsize: "1",
    buyqty: "",
    sellqty: "",
    buyamount: "",
    sellamount: "",
    transaction_type: "BUY",
    quantity: 1,
    // type: "DAY",
};

export default function ConversionOrderModal(props) {
    const { toggle, setToggle } = props;
    const [isConfirm, setIsConfirm] = useState(false);

    const {
        setModifyOrderData,
        setRefreshTokenTable,
        netPositionsBulkSquareOff,
    } = useGlobalContext();

    const [conversionProductData, setConversionProductData] = useState([...netPositionsBulkSquareOff])

    useEffect(() => {
        setConversionProductData(netPositionsBulkSquareOff)
    }, [netPositionsBulkSquareOff])

    const processRef = useRef(false);
    const conversionOrderHandler = async (items) => {
        let clientId = Object.keys(items)[0];
        const item = Object.values(items)[0];

        const updatedPayload = {
            ...conversionProductPayload,
            exchange: ExchangeSquareOff2[item.Exchange],
            symboltoken: item.Scripcode,
            oldproduct: shortProductType[item.ProductType] || item?.ProductType,
            newproduct: conversionProductType[item.ProductType] || item?.ProductType,
            tradingsymbol: `${item.Symbol}`,
            symbolname: item.Symbol,
            buyqty: item?.OpenBuyQuantity,
            buyqty: item?.OpenSellQuantity,
            boardlotsize: item.LotSize,
            buyamount: item.BuyAmount,
            sellamount: item.SellAmount,
            quantity: +item.Quantity,
            transaction_type: item.OrderSide === "SELL" ? "BUY" : "SELL" ///---- orderside already converted that's why added opp. condition ----- ///
        };

        const payload = { [clientId]: updatedPayload };

        try {
            await convertPositionHandler(payload);
        } catch (error) {
            console.log("error in convert position", error);
        }
    };

    const submitHandler = async () => {
        if (processRef.current) return;

        processRef.current = true;
        // TODO
        for (const items of conversionProductData) {
            await conversionOrderHandler(items);
        }
        // setModifyOrderData([]);
        // setCancelOrderData([]);
        // setModifyInputField(initialState);
        setRefreshTokenTable(Math.random());
        setIsConfirm(false);
        setToggle(false);
        processRef.current = false;
        toast.success(`Position Conversion Request Sent Successfully.`);
    };

    const closeHandler = () => {
        setToggle(false);
        setIsConfirm(false);
    };

    const onChangeHandler = (e, ind) => {
        const newQuantity = e.target.value; // or parseInt

        setConversionProductData((prevData) => {
            return prevData.map((item) => {
                if (item.rowIndex === ind) {
                    const key = Object.keys(item).find((k) => k !== "rowIndex");
                    if (key) {
                        return {
                            ...item,
                            [key]: {
                                ...item[key],
                                Quantity: newQuantity,
                            },
                        };
                    }
                }
                return item;
            });
        });
    };


    return (
        <>
            {isConfirm ? (
                <ConfirmModal
                    toggle={isConfirm}
                    closeHandler={closeHandler}
                    submitHandler={submitHandler}
                    processRef={processRef}
                />
            ) : (
                <Modal
                    style={{
                        padding: "20px",
                        zIndex: 99,
                    }}
                    className="modify-multiple-order-modal"
                    preventClose
                    open={toggle}
                    width="900px"
                    blur
                >
                    <Modal.Header
                        className="justify-start"
                        style={{
                            textAlign: "left",
                            fontSize: "24px",
                            padding: "0 0 10px 0",
                            fontWeight: 500,
                        }}
                    >
                        Order Change Position
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="" style={{ maxHeight: "500px", overflowY: "auto" }}>
                            <table
                                className={classes.table1}
                                style={{ color: "#838383", fontSize: "12px" }}
                            >
                                <thead
                                    className={"position-sticky top-0"}
                                    style={{ height: "40px", zIndex: 999 }}
                                >
                                    <tr>
                                        <th className={classes.th1}>Broker</th>
                                        <th className={classes.th1}>Client ID</th>
                                        <th className={classes.th1}>Order Side</th>
                                        <th className={classes.th1}>Product Type</th>
                                        <th className={classes.th1}>Lot Size</th>
                                        <th className={classes.th1}>Symbol Name</th>
                                        <th className={classes.th1}>Quantity</th>
                                        <th className={classes.th1}>Will convert to</th>
                                    </tr>
                                </thead>
                                <tbody className={`table-body`}>
                                    {conversionProductData.map((Obj, index) => {
                                        const clientId = Object.keys(Obj)[0];
                                        const item = Object.values(Obj)[0];

                                        const brokerLowerCase = item?.Broker?.toLowerCase();
                                        return (
                                            <tr key={index.toString()}>
                                                <td className={`broker-image-wrapper`}>
                                                    <Image
                                                        style={{ margin: "0px" }}
                                                        src={brokerLogoFormatHandler(brokerLowerCase)}
                                                        width={20}
                                                        height={20}
                                                        alt={brokerLowerCase}
                                                    />
                                                </td>
                                                <td>{clientId}</td>
                                                <td
                                                    style={{
                                                        color: item?.OrderSide === "BUY" ? "red" : "green",    // ---already converted order side that's why added wrong condition---- //
                                                    }}
                                                >
                                                    {item?.OrderSide === "SELL" ? "BUY" : "SELL"}
                                                </td>
                                                <td>
                                                    {shortProductType[item?.ProductType] ||
                                                        item?.ProductType}
                                                </td>
                                                <td>{item?.LotSize}</td>
                                                <td>{item?.Symbol}</td>
                                                <td>
                                                    {/* {item?.Quantity} */}
                                                    <input
                                                        type="number"
                                                        style={{
                                                            border: `0.5px solid #4680C2`,
                                                            borderRadius: "3px",
                                                            padding: "5px 25px 5px 5px",
                                                            width: "100px",
                                                        }}
                                                        value={item["Quantity"]}
                                                        name="Quantity"
                                                        onChange={(e) => onChangeHandler(e, Obj?.rowIndex)}
                                                        placeholder="Quantity"
                                                    />
                                                </td>

                                                <td className="primary-text-color">
                                                    {conversionProductType[item?.ProductType] ||
                                                        item?.ProductType}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer
                        css={{
                            justifyContent: "right",
                            width: "100%",
                            paddingTop: "$0",
                            paddingBottom: "$3",
                            marginBottom: "$5",
                        }}
                    >
                        <Button
                            className={`secondary-button border-radius-8`}
                            auto
                            flat
                            onClick={() => {
                                closeHandler();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={`primary-button border-radius-8`}
                            disabled={processRef.current}
                            type="submit"
                            auto
                            flat
                            onClick={() => setIsConfirm(true)}
                        >
                            Convert
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}

function ConfirmModal({ toggle, closeHandler, submitHandler, processRef }) {
    return (
        <Modal
            open={toggle}
            width="500px"
            preventClose
            blur
        >
            <Modal.Body>
                <h4>Convert Position</h4>
                <Text>Please confirm the order by clicking submit button.</Text>
            </Modal.Body>
            <Modal.Footer style={{ margin: "10px" }}>
                <Button
                    auto
                    bordered
                    flat
                    className="secondary-button border-radius-8"
                    onClick={closeHandler}
                >
                    Cancel
                </Button>
                <Button
                    className={`${processRef.current ? `` : `primary-button`
                        } border-radius-8`}
                    disabled={processRef.current}
                    auto
                    bordered
                    flat
                    onClick={submitHandler}
                >
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
