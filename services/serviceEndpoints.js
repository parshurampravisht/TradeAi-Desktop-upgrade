const apiAuth = "/api/prod/client/login/";
const apiDev = "/api/dev";
export const ltp = "/ltp/";
const apiClient = "/client";
const clients = "/clients";
const authClient = "/auth";
const apiTransactions = "/transactions";
const apiOrder = "/order/";
const basketData = "/basket/data/";
const basketOrder = "/basket/order/";
const SymbolOrder = "/scripBook/";
const basketFOData = "/basket/data/";
const basketDeatil = "/basket/basket-item-detail/";
const basketInstance = "/basket/basket-instance/";
const sqaureOffInstance = "/basket/basket-instance-squareof/";
const FOBasketData = "/basket/data/";
const EditBasketDataset = "basket/basket-item-detail/";
const webHookdetails = "websocket/webhook_detail/";
const webHookClientDetails = "websocket/client_detail/";
const WebhookMaster = "websoket/webhookMaster-data/";
const webhookSubscribe = "websocket/subscribe/";
const setupEmailSMTP = "/offline/smtp-credentials/";
const getEmailSMTP = "/offline/smtp-credentials/";
const setupEmailTemplate = "/offline/email-template/";
const getEmailTemplate = "/offline/email-template/";
const OfflineClient = "offline/all-clients/";
const EditOfflineClient = "offline/single-client/";
const SingleHoldingOffline = "offline/single-holdings-create/";
const getStocks = "client/get-stock/";
const getStocksGroupBy = "client/get-stock-groupBy/";
const singleDeleteOffline = "/offline/single-client/";
const SingleClientOffline = "offline/single-client-create/";
const OfflineClientAllExtra = "offline/all-clients-extra/";
const brokerHealtStatus = "/client/health/";
const clientLoginStatus = "/client/get-login-users/";
const allclient = "/client/get-login-users/";
const optionChainData = "/client/opt-chain/full-data/";
const optionChainFullData = "/client/opt-chain/full-data-new/";
const optionChainExpiry = "/client/fno-expiry-list/";
const broker_margin = "/upload-broker-margin";
const get_broker_margin = "/mtf/"

export const auth = {
  signup: "/auth",
  login: "/auth/login",
  resend_email: "/auth/resend_email",
  forgot_password: "auth/resetpassword",
  dealers: "/auth/dealers",
  delete_dealer: "/auth/delete-dealer",
  update_dealer: "/auth/update-dealer",
  validate_user_session: "/auth/validateUserSession",
};

export const client = {
  connectClientsBrokers: apiClient + "/login/",
  margin: apiClient + "/margin/",
  health: apiClient + "/health/",
  allclient: allclient,
  getClient: authClient + "/get-login-user",
  invested_margin: apiClient + "/invested_margin/",
  deleteSingleClient: apiClient + "/delete-single-client/",
  upload_clients: apiClient + "/upload/login/",
  reconnect_clients: apiClient + "/reconnect/",
  get_uploaded_clients: apiClient + "/all/",
  delete_all_clients: apiClient + "/delete/all/",
  delete_client_by_id: apiClient + "/delete/",
  update_client_by_id: apiClient + "/update/",
  single_client_upload: apiClient + "/single-client-login/",
  upload_broker_margin: broker_margin,
  get_broker_margin: get_broker_margin,
  sample_file_download: "/sample-file-download"
};

export const watchlist = {
  watchlist_master: apiClient + "/watchlist-master/",
  watchlist_by_user: apiClient + "/watchlist_by_user/",
  watchlist_details: apiClient + "/watchlist-details/",
  watchlist_details_by_watchlistId:
    apiClient + "/watchlist-details-by-watchlistId/",
};

export const transactions = {
  orderbook: apiTransactions + "/orderbook/",
  holdings: apiTransactions + "/holdings/",
  tradebook: apiTransactions + "/tradebook/",
  netPosition: apiTransactions + "/positions/net/",
};

export const order = {
  order: apiOrder,
  basketOrder: basketOrder,
  squareOff: apiOrder + `square-off/`,
  convert_position: `convert-position`,
  trade_excel_upload: `upload-orders`,
  place_orders_from_file: `place-orders-from-file`
};

export const basket = {
  getBasket: basketData,
  updateBasket: basketData,
  addBasket: basketData,
  delBasket: basketData,
};

export const scripBook = {
  SymbolOrder: SymbolOrder,
};

export const FOBasket = {
  basketFOData: basketFOData,
  basketDeatil: basketDeatil,
  basketInstance: basketInstance,
  sqaureOffInstance: sqaureOffInstance,
  FOBasketData: FOBasketData,
  EditBasketDataset: EditBasketDataset,
  webHookdetails: webHookdetails,
  webHookClientDetails: webHookClientDetails,
  WebhookMaster: WebhookMaster,
  webhookSubscribe: webhookSubscribe,
};

export const Offline = {
  OfflineClient: OfflineClient,
  EditOfflineClient: EditOfflineClient,
  SingleHoldingOffline: SingleHoldingOffline,
  singleDeleteOffline: singleDeleteOffline,
  SingleClientOffline: SingleClientOffline,
  OfflineClientAllExtra: OfflineClientAllExtra,
  getStocks: getStocks,
  getStocksGroupBy: getStocksGroupBy,
};

export const EmailConfig = {
  setupEmailSMTP: setupEmailSMTP,
  getEmailSMTP: getEmailSMTP,
  setupEmailTemplate: setupEmailTemplate,
  getEmailTemplate: getEmailTemplate,
};

export const brokerHealth = {
  getBrokerHealthStatus: brokerHealtStatus,
};

export const loginStatus = {
  getClientsLoginStatus: clientLoginStatus,
};

export const fnOTransaction = {
  optionChainData: optionChainData,
  optionChainFullData: optionChainFullData,
  optionChainExpiry: optionChainExpiry,
};
