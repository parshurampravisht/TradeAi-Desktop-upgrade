const { parseSharesKeys } = require("./Helpers");
import electron from "electron";
const ipcRenderer = electron.ipcRenderer || false;
const { transformTableBook } = require("./transformResponse");
import {
  transactOrderBook,
  transactMargin,
  transactTradeBook,
  transactHoldings,
  transactNetPosition,
  GetOfflineClient,
} from "../../services/transactions/transactions.service";
import { getTableColumn } from "./columnConstants";
const base_url_prod =
  "https://rfln4cfdzahy3yb2h5h5ocepzy0seyan.lambda-url.ap-south-1.on.aws"; //process.env.API_BASE_URL_PROD;
const base_url_dev =
  "https://qiffd24anzdiovz6377mli3qqa0ikrru.lambda-url.ap-south-1.on.aws"; //process.env.API_BASE_URL_DEV;

const base_url_table =
  "https://tmjzkcmbhq42epijtw7yvbowmi0auqug.lambda-url.ap-south-1.on.aws/api/dev/transactions";
//getting ltps

const getShares = async (symbols) => {
  try {
    var res = await fetch(`${base_url_dev}/ltp`, {
      method: "POST",
      body: JSON.stringify({ symbols }),
    });
    var data = await res.json();
    data = parseSharesKeys(data);
    return data;
  } catch (error) {
    //error is coming from server to fix
    return parseSharesKeys({
      NIFTY: {
        Change_PCT: -15.24,
        Lower_circuit: 1677.53,
        Change_PNT: -319.57,
        Price: 1777.34,
        Volume: 87960,
        LTQ: 390,
        Upper_circuit: 2516.29,
        Time: "2023-08-07 05:37:11.821880",
        Prev_Close: 2096.91,
      },
    });
  }
};

const getClientStatus = async () => {
  const clientStatus = await ipcRenderer.invoke(
    "readMemory-ipc",
    "clientStatus"
  );
  const clientIds = clientStatus.map((cl) => cl.name);
  return clientIds;
};

const getOfflineClientItem = async () => {
  const userId = localStorage.getItem("user_id");
  const itemdata = await GetOfflineClient(userId);
  const offline_Data =
    itemdata?.clients.length > 0
      ? itemdata.clients.map((element) => element.clientCode)
      : "";
  return offline_Data;
};

//new table api call to get table data
const getTabledata = async (tableName, tableDataItem) => {
  // Await client status to ensure it is retrieved before using it
  const clientIds = tableDataItem;
  const offlineRaw = localStorage.getItem("offlineClient");
  const offlineData = offlineRaw ? JSON?.parse(offlineRaw) : [];

  const offline_Data =
    offlineData?.length > 0
      ? offlineData?.map((element) => element.clientCode)
      : "";

  try {

    const transactions = {
      orderbook: () => transactOrderBook({ client_ids: [] }),
      margin: () => transactMargin({ client_ids: [] }),
      tradebook: () => transactTradeBook({ client_ids: [] }),
      holdings: () =>
        transactHoldings({
          client_ids: [],
          offline_client_ids: offline_Data,
        }),
      netpositions: () => transactNetPosition({ client_ids: [] }),
    };

    let res = transactions[tableName]
      ? await transactions[tableName]()
      : { data: [] };

    res.data = Array.isArray(res.data) ? res.data : [];

    if (tableName === "orderbook" || tableName === "tradebook") {
      res = {
        ...res,
        data: [...res?.data].sort((a, b) => {
          const dateA = new Date(
            a.LastUpdateDateTime?.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
          );
          const dateB = new Date(
            b.LastUpdateDateTime?.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3")
          );

          return dateB - dateA; // Sort in descending order
        }),
      };
    }

    let tableBody = res.data || []; // Required in prod

    if (tableBody?.length === 0) {
      tableBody = [];
    } else {
      tableBody = await transformTableBook(tableBody, tableName);
    }

    const columns = getTableColumn(tableName);
    return [columns, tableBody];
  } catch (error) {
    console.log("error to get dashboard table data", error);
    console.error(error);
    return [[], []];
  }
};

//calling api to get broker health
const getBrokerHealth = async () => {
  var res = await fetch(`${base_url_prod}/health`, {
    method: "POST",
    body: JSON.stringify({}),
  });

  var health = await res.json();

  return health;
};

export { getShares, getTabledata, getBrokerHealth };
