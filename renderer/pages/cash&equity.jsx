import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/GlobalContext";
import PlaceOrder from "../component/dashboard/watchlist/order/orderComponents/placeOrderModal";
import PlaceOrderModal from "../component/dashboard/watchlist/order/orderComponents/orderStatusModal";
import StepOrderPlaceModal from "../component/dashboard/watchlist/order/orderComponents/stepOrderPlaceModal";
import { useRouter } from "next/router";

export default function CashEquity() {
  const {
    apiBody,
    placeOrderVisible,
    setPlaceOrderVisible,
    setSelectedGroup,
    setGroupInputList,
  } = useGlobalContext();

  const router = useRouter();
  const { state } = router?.query;

  const [buySell, setBuySell] = useState(
    state && state === "false" ? false : true
  );
  const [orderStatVisible, setOrderStatVisible] = useState(false); //modal for showing order status after placing the order
  const [orderStat, setOrderStat] = useState(false); //shows order status of place order api
  const [successClient, setSuccessClients] = useState([]); //array of clients whose order was requested successfully from place Order screen
  const [failClient, setFailClients] = useState([]); //array of clients whose order request was unsuccessful
  const [orderReqStatusMessage, setOrderReqStatusMessage] = useState("");

  useEffect(() => {
    setPlaceOrderVisible(true);
    return () => {
      setPlaceOrderVisible(false);
      setSelectedGroup(new Set(["Groups"]));
      setGroupInputList([]);
    };
  }, []);

  return (
    <>
      <PlaceOrder
        placeOrderVisible={placeOrderVisible}
        setPlaceOrderVisible={setPlaceOrderVisible}
        buySell={buySell}
        setBuySell={setBuySell}
        apiBody={apiBody}
        state={state}
        setOrderStatVisible={setOrderStatVisible}
        setOrderStat={setOrderStat}
        setSuccessClients={setSuccessClients}
        setFailClients={setFailClients}
        setOrderReqStatusMessage={setOrderReqStatusMessage}
      />
      <PlaceOrderModal
        orderStat={orderStat}
        orderStatVisible={orderStatVisible}
        setOrderStatVisible={setOrderStatVisible}
        successClient={successClient}
        failClient={failClient}
        orderReqStatusMessage={orderReqStatusMessage}
      />
      <StepOrderPlaceModal
        setPlaceOrderVisible={setPlaceOrderVisible}
        apiBody={apiBody}
      />
    </>
  );
}
