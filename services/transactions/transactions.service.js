import {
  axiosAuthInstance,
  axiosAWSInstance,
  axiosInstance,
  fetchInstance,
} from "../axios.config";
import {
  transactions,
  client,
  order,
  basket,
  ltp,
  scripBook,
  FOBasket,
  Offline,
  brokerHealth,
  fnOTransaction,
  loginStatus,
  watchlist,
} from "../serviceEndpoints";

export const transactOrderBook = async (payload) => {
  try {
    const response = await axiosInstance.post(transactions.orderbook, payload);
    if (!response) {
      window.alert("Something went wrong");
    }
    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const transactTradeBook = async (payload) => {
  try {
    const response = await axiosInstance.post(transactions.tradebook, payload);
    if (!response) {
      window.alert("Something went wrong");
    }
    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const transactHoldings = async (payload) => {
  try {
    const response = await axiosInstance.post(transactions.holdings, payload);
    if (!response) {
      window.alert("Something went wrong");
    }

    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const transactMargin = async (payload) => {
  try {
    const response = await axiosInstance.post(client.margin, payload);
    if (!response) {
      window.alert("Something went wrong");
    }
    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const transactNetPosition = async (payload) => {
  try {
    const response = await axiosInstance.post(
      transactions.netPosition,
      payload
    );
    if (!response) {
      return response?.message;
    }

    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const placeOrder = async (payload) => {
  try {
    const response = await axiosInstance.post(order.order, payload);
    if (!response) {
      return response?.message;
    }

    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const squareOffOrder = async (payload) => {
  try {
    const response = await axiosInstance.post(order.squareOff, payload);
    if (!response) {
      return response?.message;
    }

    return response?.data;
  } catch (error) {
    window.alert("Something went wrong");
    return error;
  }
};

export const placeScripBook = async (payload) => {
  try {
    const response = await axiosInstance.post(scripBook.SymbolOrder, payload);
    if (!response) {
      return response?.message;
    }

    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const modifyOrder = async (payload) => {
  try {
    const response = await axiosInstance.put(order.order, payload);
    if (!response) {
      window.alert("Something went wrong");
    }
    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const cancelOrder = async (payload) => {
  try {
    const response = await axiosInstance.delete(order.order, { data: payload });
    if (!response) {
      window.alert("Something went wrong");
    }

    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const clientBrokerConnection = async (payload) => {
  //console.log("============payload", payload);
  try {
    const response = await axiosInstance.post(
      client?.connectClientsBrokers,
      payload
    );
    if (response?.data?.error === true) {
      window.alert(response?.data?.message);
    }

    return response?.data;
  } catch (error) {
    return "error";
  }
};

export const deleteAllOnlineClients = async () => {
  //console.log("============payload", payload);
  try {
    const response = await axiosInstance.delete(client?.connectClientsBrokers);
    if (response?.data?.error === true) {
      window.alert(response?.data?.message);
    }

    return response?.data;
  } catch (error) {
    return "error";
  }
};

export const singleClientConnection = async (payload) => {
  try {
    const response = await axiosInstance.patch(
      client?.connectClientsBrokers,
      payload
    );
    if (response?.data?.error === true) {
      window.alert(response?.data?.message);
    }

    return response?.data;
  } catch (error) {
    return "error";
  }
};

export const brokerHealthStatus = async () => {
  try {
    const response = await axiosInstance.get(client.health);
    if (!response) {
      window.alert("Something went wrong");
    }

    return response?.data;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};
export const getBaskets = async (type) => {
  try {
    const response = await axiosInstance.get(
      `${basket.getBasket}?type=${type}`
    );
    if (!response) {
      return response?.message;
    }

    return response?.data.data;
  } catch (error) {
    return error;
  }
};
export const OrderBasket = async (payload) => {
  try {
    const response = await axiosInstance.post(order.basketOrder, payload);
    if (!response.data) {
      return { err: response?.message };
    }
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getLTPService = async (payload) => {
  try {
    const response = await axiosInstance.post(ltp, payload);
    if (!response.data) {
      return { err: response?.message };
    }
    return response?.data?.data;
  } catch (error) {
    return error;
  }
};
export const getBasketDetails = async (payload) => {
  try {
    const response = await axiosInstance.get(basket.getBasket + payload);
    if (!response) {
      return response?.message;
    }

    return response;
  } catch (error) {
    return error;
  }
};

export const addBasket = async (payload) => {
  try {
    const response = await axiosInstance.post(basket.addBasket, payload);
    if (!response.data) {
      return { err: response?.message };
    }
    return response?.data;
  } catch (error) {
    return error;
  }
};
export const delBasket = async (payload) => {
  try {
    const response = await axiosInstance.delete(basket.delBasket, {
      data: { name: payload },
    });
    if (!response) {
      return response?.message;
    }
    return response;
  } catch (error) {
    return error;
  }
};

export const BasketFOOrder = async (payload) => {
  try {
    const response = await axiosInstance.post(FOBasket.basketFOData, payload);
    // if (!response) {
    //   window.alert("Something went wrong");
    // }
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const BasketDetail = async (payload) => {
  try {
    const response = await axiosInstance.post(FOBasket.basketDeatil, payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const MarginDetail = async (payload) => {
  try {
    const response = await axiosInstance.post(client.margin, payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const BasketInstance = async (payload) => {
  try {
    const response = await axiosInstance.post(FOBasket.basketInstance, payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getInstanceBasket = async () => {
  try {
    const response = await axiosInstance.get(FOBasket.basketInstance);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getInstanceBasketID = async (payload) => {
  try {
    const response = await axiosInstance.get(
      `${FOBasket.basketInstance}${payload}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getSquareOffInstane = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${FOBasket.sqaureOffInstance}${payload}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getSquareOffAllInstane = async (payload) => {
  try {
    const response = await axiosInstance.post(
      FOBasket.sqaureOffInstance,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getFOBasketID = async (payload) => {
  try {
    const response = await axiosInstance.get(
      `${FOBasket.FOBasketData}${payload}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const EditBasketData = async (id, basket) => {
  try {
    const response = await axiosInstance.patch(
      `${FOBasket.EditBasketDataset}${id}/`,
      basket
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const DeleteBasketData = async (id, basket) => {
  try {
    const response = await axiosInstance.delete(
      `${FOBasket.EditBasketDataset}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getWebhookData = async () => {
  try {
    const response = await axiosInstance.get(FOBasket.webHookdetails);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const CreateWebHookDetail = async (payload) => {
  try {
    const response = await axiosInstance.post(FOBasket.webHookdetails, payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const DeleteWebHookClientsDetail = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${FOBasket.webHookClientDetails}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const DeleteBasketHandler = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${FOBasket.webHookdetails}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const updateBasketIdHandler = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${FOBasket.webHookdetails}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const updateBasketDataHandler = async (id, payload) => {
  try {
    const response = await axiosInstance.put(
      `${FOBasket.webHookdetails}${id}/`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const CEBasketDraftHandler = async (id, payload) => {
  try {
    const response = await axiosInstance.post(
      `${basket.addBasket}${id}/`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const GetOfflineClient = async (id) => {
  try {
    const response = await axiosInstance.get(`${Offline.OfflineClient}${id}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const AllClientData = async (id) => {
  try {
    const response = await axiosInstance.get(`${client.allclient}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getClientData = async (id) => {
  try {
    const response = await axiosAuthInstance.get(`${client.getClient}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const uploadClients = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${client.upload_clients}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getUploadedAllClients = async () => {
  try {
    const response = await axiosInstance.get(`${client.get_uploaded_clients}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const reconnectAllClients = async () => {
  try {
    const response = await axiosInstance.get(`${client.reconnect_clients}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};
export const singleClientUpload = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${client.single_client_upload}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const deleteClientsbyId = async (clientId) => {
  try {
    const response = await axiosInstance.delete(
      `${client.delete_client_by_id}${clientId}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const updateClientsbyId = async (clientId, payload) => {
  try {
    const response = await axiosInstance.put(
      `${client.update_client_by_id}${clientId}/`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const deleteAllClients = async () => {
  try {
    const response = await axiosInstance.delete(`${client.delete_all_clients}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const GetOfflineClientBroker = async (id) => {
  const userId = localStorage.getItem("user_id");

  try {
    const response = await axiosInstance.get(
      `${Offline.OfflineClient}${userId}`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const GetOfflineClientAll = async (id) => {
  try {
    const response = await axiosInstance.get(
      `${Offline.OfflineClientAllExtra}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const GetOfflineClientData = async (id) => {
  try {
    const response = await axiosInstance.get(`${Offline.OfflineClient}${id}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const updateEditOfflineHandler = async (id, payload) => {
  try {
    const response = await axiosInstance.put(
      `${Offline.EditOfflineClient}${id}/`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const SingleClientOfflineHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${Offline.SingleClientOffline}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const updateEditHoldingHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${Offline.SingleHoldingOffline}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const SearchStocksHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(`${Offline.getStocks}`, payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const SearchStocksGroupByHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${Offline.getStocksGroupBy}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const SingleDeleteHoldingHandler = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${Offline.EditOfflineClient}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const MutlipleDeleteHoldingHandler = async (id) => {
  try {
    const response = await axiosInstance.delete(
      `${Offline.OfflineClient}${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getBrokerHealthStatus = async () => {
  try {
    const response = await fetchInstance(brokerHealth.getBrokerHealthStatus);
    return response;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};

export const getClientsLoginStatus = async () => {
  try {
    const response = await fetchInstance(loginStatus.getClientsLoginStatus);
    return response;
  } catch (error) {
    return error;
    window.alert("Something went wrong");
  }
};
export const getOptionChainData = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${fnOTransaction.optionChainData}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getOptionChainFullData = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${fnOTransaction.optionChainData}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getOptionChainExpiry = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${fnOTransaction.optionChainExpiry}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const deleteSingleClient = async (payload) => {
  try {
    const response = await axiosInstance.delete(
      `${client.deleteSingleClient}${payload}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const clientInvestedMarginData = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${client.invested_margin}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

///---- watchlist ------////
export const createWatchlist = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${watchlist.watchlist_master}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const deleteWatchlist = async (watchlistId) => {
  try {
    const response = await axiosInstance.delete(
      `${watchlist.watchlist_master}${watchlistId}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getAllWatchlist = async () => {
  try {
    const response = await axiosInstance.get(`${watchlist.watchlist_master}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getAllWatchlistByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(
      `${watchlist.watchlist_by_user}${userId}`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const addWatchlistDetails = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${watchlist.watchlist_details}`,
      payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getWatchistDetailsByID = async (watchlistId) => {
  try {
    const response = await axiosInstance.get(
      `${watchlist.watchlist_details_by_watchlistId}${watchlistId}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const deleteWatchlistDetails = async (watchlistSymbolId) => {
  try {
    const response = await axiosInstance.delete(
      `${watchlist.watchlist_details}${watchlistSymbolId}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const convertPositionHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${order.order}${order.convert_position}/`, payload
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const tradeExcelUploadHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${order.order}${order.trade_excel_upload}/`, payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const excelFilePlaceOrderHandler = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `${order.order}${order.place_orders_from_file}/`, payload,
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const getBrokerMarginHandler = async (symbolName, broker) => {
  try {
    const response = await axiosAWSInstance.get(`${client.get_broker_margin}?symbol=${symbolName}`);
    return response?.data;
  } catch (error) {
    return error;
  }
};
