import { formatNumber } from "../../dashboard/dashboardTables/helpers";

export const columnPNL = [
  {
    headerName: "S.no",
    field: "sno",
    maxWidth: 50,
    flex: 0.5,
  },
  // {
  //   headerName: "Broker",
  //   field: "broker",
  //   width: 100,
  // },
  {
    headerName: "Client Id",
    field: "clientId",
    width: 100,
    flex: 0.5,
  },
  // {
  //   headerName: "Product Type",
  //   field: "productType",
  //   width: 100,
  //   flex: 0.5,
  // },
  {
    headerName: "Total Invested Amount",
    field: "investedAmount",
    width: 180,
    flex: 0.5,
  },
];

export const TotalPNLAmount = [
  {
    headerName: "Total P & L",
    field: "pnl",
    width: 180,
    flex: 0.5,
    cellStyle: params => {
      if (params.value < 0) {
        return { color: "red", textAlign: "center" };
      } else if (params.value > 0) {
        return { color: "green", textAlign: "center" };
      } else {
        return { color: "black", textAlign: "center" };
      }
    },
    valueFormatter: params => {
      const totalPNL = params.value || 0;
      return `${totalPNL !== "-" ? `\u20B9 ${formatNumber(totalPNL)}` : "-"}`;
    }
  }
]