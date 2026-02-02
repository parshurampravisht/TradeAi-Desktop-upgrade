import { currencyFormatter } from "../../../helpers";
import { Image } from "@nextui-org/react";
export const columns = [
  {
    headerName: "Broker",
    field: "broker",
    width: "70",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
    cellRenderer: (params) => {
      return (
        <span className="broker-image-equity-basket-table">
          <Image
            src={`images/brokers/${params?.data?.broker?.toLowerCase()}.png`}
            alt={params?.data?.broker}
            width={20}
            css={{ margin: "$0" }}
          ></Image>
        </span>
      );
    },
  },
  {
    headerName: "Client",
    field: "client",
    width: "100",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
  },
  // { headerName: "Group", field: "group", width: "130" },
  {
    headerName: "Net Margin",
    field: "cashAvailable",
    width: "130",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
  },
  {
    headerName: "Holdings",
    field: "investedMargin",
    width: "130",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
  },
  {
    headerName: "Allocated Margin",
    field: "margin",
    width: "130",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params) => {
      const margin = params?.data?.margin;
      return <>{currencyFormatter(margin, 2) || 0}</>;
    },
  },
];

export const addClientColumns = [
  {
    headerName: "Broker",
    field: "broker",
    width: "70",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
    cellRenderer: (params) => {
      return (
        <span className="broker-image-equity-basket-table">
          <Image
            src={`images/brokers/${params?.data?.broker?.toLowerCase()}.png`}
            alt={params?.data?.broker}
            width={20}
            css={{ margin: "$0" }}
          ></Image>
        </span>
      );
    },
  },
  {
    headerName: "Client",
    field: "client",
    width: "100",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
  },
  // { headerName: "Group", field: "group", width: "180" },
  {
    headerName: "Net Margin",
    field: "cashAvailable",
    width: "130",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
  },
  {
    headerName: "Holdings",
    field: "investedMargin",
    width: "130",
    cellStyle: {
      display: "flex",
      alignItems: "center",
    },
  },
  {
    headerName: "Allocated Margin",
    field: "margin",
    width: "130",
    cellStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellRenderer: (params) => {
      const margin = params?.data?.margin;
      return <>{currencyFormatter(margin, 2) || 0}</>;
    },
  },
];
