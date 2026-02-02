import {
  app,
  ipcMain,
  Notification,
  BrowserWindow,
  globalShortcut,
} from "electron";
import serve from "electron-serve";
//const pty = require("node-pty");
import { createWindow } from "./helpers";
const electron = require("electron");
import Store from "electron-store";
import { exec, execFile, spawn } from "child_process";
const path = require("path");
const os = require("os");
const fs = require("fs");
const logic = require("./logic/envLogic");
const clientApi = require("./logic/clientAPI");
const updateStore = require("./logic/store/updateStore");
const retrieveStore = require("./logic/store/retrieveStore");
const cronJob = require("./logic/schedulerJobs");
import { channel } from "../shared/constants";
import { autoUpdater } from "electron-updater";
import logger from "electron-log/main";
const find = require("find-process");
import moment from "moment";
const net = require("net");
require("dotenv").config();
const backendHost = "127.0.0.1";
const backendPort = 6001;
var appInitiated = false; // to check if the app is initiated first time
var backendProcess = null;
var backedPid = null;
//var ptyProcess = null;
let mainWindow;

//child process for websocket of live data
const isProd = process.env.NODE_ENV == "development" ? false : true;
// Store.initRenderer();
const store = new Store();

logger.initialize();
logger.transports.file.resolvePathFn = () =>
  path.join(`logs/applog_${moment().format("YYYYMMDD")}.log`);
const level = isProd ? "silly" : "debug";
logger.transports.console.format =
  "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
logger.transports.console.level = level;
logger.transports.file.level = level;

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = "info";

var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
//logger.info(`Main process going to start with  version ${app.getVersion()}`);
//this block of code used to fetch latest exe : v1.26
// let backendExeFileName = "backend.exe";
//to create child process when app starts to spwan local host for thick client
var backendProcess;
var cliProcessPid;
var cliProcessName;
var processName;
//function to execute backend exe once app is ready
const executeBackendApp = async (dirPath) => {
  logger.info(`Exe absolute path : ${dirPath}`);
  /*const batPath = path.join(dirPath, "runner.bat");
  console.log(`Backend BAT Path : ${batPath}`);
  backendProcess = spawn(batPath, [], {
    cwd: path.dirname(batPath),
    shell: true,
    windowsHide: false,
    detached: true,
  });*/

  const exePath = path.join(dirPath, "backend.exe");
  logger.info(`Backend EXE Path : ${exePath}`);
  backendProcess = spawn(
    "cmd.exe",
    ["/c", `"${exePath}" runserver 127.0.0.1:6001`],
    {
      cwd: dirPath,
      shell: true,
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: path.join(dirPath, "playwright-browsers"),
        TEMP: path.join(dirPath, "temp"),
        TMP: path.join(dirPath, "temp"),
      },
    }
  );

  logger.info(`Backend Process PID:`, backendProcess.pid);

  //To find out the process name with help of PID
  find("pid", backendProcess.pid).then(
    function (list) {
      if (Array.isArray(list) && list.length > 0) {
        var process = list[0];
        processName = process.name;
        //logger.info(`Running process name : ${processName}`);
      } else {
        logger.warn("No matching process found.");
      }
    },
    function (err) {
      logger.log(err.stack || err);
    }
  );
};

//to kill child process when app closes
var exitPyProc = () => {
  //logger.info(`The process name : ${processName} having PID : ${backendProcess.pid} successfully Closed.`);
  exec(`taskkill /f /t /im ${processName}`, (err, stdout, stderr) => {
    if (err) {
      return;
    }
  });
  // backendProcess.kill();
  // backendProcess = null;
  // ptyProcess.kill();
  // ptyProcess = null;
};

(async () => {
  await app.whenReady();
  /******To show main screen********************************* */
  const display = electron.screen.getPrimaryDisplay();
  const maxiSize = display.workAreaSize;
  mainWindow = createWindow("main", {
    width: maxiSize.width,
    height: maxiSize.height,
    autoHideMenuBar: true,
    icon: __dirname + "/images/logo.png",
  });

  /******To show splash screen********************************* */
  mainWindow.hide();
  const splash = createWindow("splash", {
    width: 511,
    height: 390,
    autoHideMenuBar: true,
    frame: false,
    icon: __dirname + "/images/logo.png",
  });
  let splashpath = path.join(app.getAppPath(), "splash/splash.html");
  splash.loadFile(splashpath);
  splash.center();

  /******This block of code written to check backend service is started or not*****/
  let retry = 0;
  const checkBackendServer = () => {
    // Start the timer
    const startTime = process.hrtime();
    const client = new net.Socket();
    client.on("error", (error) => {
      setTimeout(checkBackendServer, 100);
      //console.log("Backend server not yet started, retrying...", retry);
      retry++;
    });
    client.on("connect", () => {
      if (retry >= 0) {
        const endTime = process.hrtime(startTime);
        // Calculate time in milliseconds
        const timeInMilliseconds = endTime[0] * 1e3 + endTime[1] / 1e6;
        console.log(`Execution time: ${timeInMilliseconds}ms`);
        splash.close();
        mainWindow.show();
        mainWindow.maximize();
      }
      client.destroy();
    });
    client.connect(backendPort, backendHost);
  };

  checkBackendServer();

  logger.log("Is Production Evironment :", isProd);
  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    try {
      const port = process.argv[2];
      console.log(
        "Electron is trying to load:",
        `http://localhost:${port}/home`
      );
      await mainWindow.loadURL(`http://localhost:${port}/home`);
    } catch (error) {
      console.log("error mainWindow loadURL", error);
    }
  }
  let envInfo = isProd ? "prod" : "dev";
  store.set("environment", envInfo);

  // //command prompt backend
  // ptyProcess = pty.spawn(shell, [], {
  //   name: "xterm-color",
  //   cols: 1000,
  //   rows: 1000,
  //   cwd: isProd
  //     ? path.resolve(app.getAppPath(), "..", "cli")
  //     : path.join(app.getAppPath(), "cliProgram"),
  //   env: process.env,
  // });

  // /***To cli exe from command propt when app first time runs**** */
  // if (!appInitiated) {
  //   appInitiated = true;
  //   const cliInitiateCommand =
  //     os.platform() === "win32" ? ".\\cli.exe\r\n" : "start //b cli.exe\r\n";
  //   try {
  //     ptyProcess.write(cliInitiateCommand);
  //   } catch (e) {
  //     logger.error(e);
  //   }
  // }
  //outputs the data from cli backend to renderer UI CLI
  // ptyProcess.on("data", function (data) {
  //   mainWindow.webContents.send("terminal.incomingData", data);
  // });

  // // sending request from renderer to main when types on cli
  // ipcMain.on("terminal.keystroke", (event, key) => {
  //   ptyProcess.write(key);
  // });
  // ptyProcess.resize(100, 100);

  cronJob.scheduleLogout(mainWindow);
})();

function killProcess(pid) {
  // Use taskkill to close the cmd.exe process
  if (pid) {
    exec(`taskkill /f /t /pid ${pid}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error killing process ${pid}: ${stderr}`);
      } else {
        console.log(`Successfully killed process ${pid}: ${stdout}`);
      }
    });
  }
}

//events for child process:
app.on("ready", async () => {
  const dirPath = isProd
    ? path.join(app.getAppPath(), "..", "backend")
    : path.join(app.getAppPath(), "backend");
  await executeBackendApp(dirPath);
  //const result = await ensureBackendExeDownloaded(dirPath);
  // if (result.backendExeFilePath) {
  //   logger.info(`Backend extracted at path : ${result.backendExeFilePath}`);
  //   await executeBackendApp(dirPath);
  // }
  store.set("electronDir", app.getAppPath());

  // const mainWindow = new BrowserWindow({
  //   width: 800,
  //   height: 600,
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  // });

  // // Load the app's main content
  // mainWindow.loadURL("path/to/your/app");

  // Open DevTools in development mode
  if (process.env.NODE_ENV === "development") {
    // mainWindow.webContents.openDevTools();
  }

  /// uncomment for dependency, fix issue and dependency everywhere first before comment
  let csvPath = path.join(app.getAppPath(), "symbolList.csv");
  if (isProd) csvPath = path.resolve(csvPath, "..", "..", "symbolList.csv");
  logic.readCsvSymbolList(csvPath, store);

  //To check new update of application
  setTimeout(() => {
    logger.info(`Event to check any update`);
    autoUpdater.checkForUpdatesAndNotify();
  }, 10000);

  // To Register ALT+CTRL+I
  // globalShortcut.register("Alt+CommandOrControl+I", () => {
  //   mainWindow.webContents.send("shortcut_keys", "ALT+CTRL+I");
  // });
  // globalShortcut.register("CommandOrControl+F8", () => {
  //   mainWindow.webContents.send("shortcut_keys", "CTRL+F8");
  // });
  // globalShortcut.register("Shift+F8", () => {
  //   mainWindow.webContents.send("shortcut_keys", "Shift+F8");
  // });
  // globalShortcut.register("F1", () => {
  //   mainWindow.webContents.send("shortcut_keys", "F1");
  // });
  // globalShortcut.register("F2", () => {
  //   mainWindow.webContents.send("shortcut_keys", "F2");
  // });
  // globalShortcut.register("F3", () => {
  //   mainWindow.webContents.send("shortcut_keys", "F3");
  // });
  // globalShortcut.register("F6", () => {
  //   mainWindow.webContents.send("shortcut_keys", "F6");
  // });
});

app.on("will-quit", () => {
  // Example: Kill the process using the stored PID
  //logger.info(`The process name : ${processName} successfully Closed.`);
  if (cliProcessName) {
    exec(`taskkill /f /t /im ${cliProcessName}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error killing process ${cliProcessName}: ${stderr}`);
      } else {
        console.log(`Successfully killed process ${cliProcessName}: ${stdout}`);
      }
    });
  }

  exec(`taskkill /f /t /im ${processName}`, (err, stdout, stderr) => {
    if (err) {
      return;
    }
  });
});

app.on("window-all-closed", () => {
  app.quit();
  //backendProcess.kill();
  autoUpdater.quitAndInstall();
});

//to send message on view pages
const showMessage = (message) => {
  mainWindow.webContents.send("app-updates", message);
};

const showNotification = (NOTIFICATION_TITLE, NOTIFICATION_BODY) => {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
};

//ipc to convert excel sheet into request body format
// ipcMain.handle("parse-clientcreds-ipc", async (event, args) => {
//   //
//   try {
//     //converting excel into the json
//     //if invalid sheet, returns :> false , {}
//     //if valid sheet, returns :> true , {dataformed}
//     let [validUpload, credsResult] = logic.convertSheetJson(args.filePath); //uploaded
//     let returnData = {};
//     let clientExistingData = store.get("clientCreds");

//     console.log(
//       "clientExistingData",
//       clientExistingData,
//       "credsResult",
//       credsResult
//     );

//     if (
//       // (validUpload && typeof clientExistingData == "undefined") ||
//       validUpload
//     ) {
//       //
//       //if valid sheet is uploaded, storing the clients data into the electron store
//       returnData = credsResult;
//       // const combinedClients = clientExistingData
//       //   ? [...clientExistingData.rows, ...credsResult.rows]
//       //   : [...credsResult.rows];

//       // const uniqueClients = combinedClients.filter(
//       //   (client, index, self) =>
//       //     index === self.findIndex((c) => c.client_id === client.client_id) // Unique by client_id
//       // );

//       // returnData = { rows: logic.orderClientIDs(uniqueClients) };
//       returnData = logic.orderClientIDs(returnData);
//       store.set("clientCreds", credsResult);
//     }
//     return [validUpload, returnData];
//   } catch (e) {
//     return [false, []];
//   }
// });

ipcMain.handle("parse-clientcreds-ipc", async (event, args) => {
  try {
    //converting excel into the json
    //if invalid sheet, returns :> false , {}
    //if valid sheet, returns :> true , {dataformed}
    let [validUpload, newCreds] = logic.convertSheetJson(args.filePath); //uploaded
    let returnData = {};
    let clientExistingData = store.get("clientCreds");

    if (validUpload) {
      //if valid sheet is uploaded, storing the clients data into the electron store
      const combinedRows = clientExistingData
        ? [...newCreds?.rows, ...clientExistingData?.rows]
        : [...newCreds?.rows];

      const uniqueRows = combinedRows.filter(
        (client, index, self) =>
          index ===
          self.findIndex((c) => c["Client ID"] === client["Client ID"]) // Unique by client_id
      );

      // Merge `apiBody` ensuring unique client IDs
      const combinedApiBody = { ...clientExistingData?.apiBody };

      for (const broker in newCreds.apiBody) {
        if (combinedApiBody[broker]) {
          // If broker exists in the existing data, filter out duplicates
          const existingClients = combinedApiBody[broker];
          const newClients = newCreds.apiBody[broker];

          // Merge clients for this broker, replacing existing clients with the same "Client ID"
          newClients.forEach((newClient) => {
            const existingIndex = existingClients.findIndex(
              (client) => client["client_code"] === newClient["client_code"]
            );

            if (existingIndex !== -1) {
              // Replace the existing client with the new one
              existingClients[existingIndex] = newClient;
            } else {
              // Append the new client if it does not already exist
              existingClients.push(newClient);
            }
          });
        } else {
          // If broker does not exist, add it along with its clients
          combinedApiBody[broker] = [...newCreds.apiBody[broker]];
        }
      }

      // Update returnData with merged rows and apiBody
      returnData = {
        columns: newCreds.columns,
        rows: uniqueRows,
        apiBody: combinedApiBody,
      };

      returnData = logic.orderClientIDs(returnData);

      if (combinedRows.length > args.allowed_clients) {
        return [validUpload, returnData, true];
      }

      store.set("clientCreds", returnData);
    }
    return [validUpload, returnData];
  } catch (e) {
    return [false, []];
  }
});

ipcMain.handle("ipc-saveSampleCSV", async (event, args) => {
  logic.createExcelFile(args);
});

ipcMain.handle(
  "ipc-saveUploadedClientsCSV",
  async (event, resultType, clientCreds) => {
    logic.createExcelFile(resultType, clientCreds);
  }
);

//ipc to save excel sheet for cli exe in clients app data
ipcMain.handle("ipc-saveSheetToCliDir", async (event, args) => {
  let saveCsvPath = isProd
    ? path.resolve(app.getAppPath(), "..", "cli")
    : path.join(app.getAppPath(), "cliProgram");
  let rows = args.rows;
  logic.saveCliExeSheet(saveCsvPath, rows);
});
//test ip for deleting the store data
ipcMain.handle("deleteStore-ipc", async (event, args) => {
  try {
    store.delete("clientStatus");
    store.delete("watchlist");
    store.delete("groupClients");
    store.delete("clientCreds");
    store.delete("group");
    store.delete("symbolDropdown");
    return "store deleted!!";
  } catch (e) {
    return "error";
  }
});

//ipc for updating client status from electron store for left sider
ipcMain.handle("set-clientStatus", async (event, args) => {
  try {
    var data = store.get("clientStatus");
    const idx = args.idx;
    data[idx]["actions"] = !data[idx]["actions"];
    store.set("clientStatus", data);
    return data;
  } catch (e) {
    return "error";
  }
});

//ipc to read data from excel sheet for orders of clients
ipcMain.handle("parse-clientOrders-ipc", async (event, args) => {
  try {
    const orderResult = logic.convertClientOrdersJson(args.filePath);
    return orderResult;
  } catch (e) {
    //
    return "error";
  }
});

//ipc to get app data from electron for watchlist
ipcMain.handle("readMemory-ipc", async (event, args) => {
  try {
    const memoryData = retrieveStore.readMemory(store, args);
    return memoryData;
  } catch (e) {
    return "error";
  }
});

//ipc to set app data from electron for watchlist
ipcMain.handle("updateMemory-ipc", async (event, args) => {
  try {
    updateStore.updateMemory(store, args.field, args.subField, args.data);
    return "test";
  } catch (e) {
    return "error";
  }
});

//ipc for Login of user-------------------------------------------
ipcMain.handle("logginUser", async (event, args) => {
  try {
    const resData = await clientApi.login_api(args);
    return resData;
  } catch (e) {
    return "error";
  }
});
//ipc for signup for users

ipcMain.handle("SignUpUser", async (event, args) => {
  try {
    const SignData = await clientApi.SignUp_api(args);
    SignUpData = SignData;
    return SignData;
  } catch (e) {
    return "error in SignUP ";
  }
});

//ipc for getting client status from electron store for left sider dashboard
ipcMain.handle("set-clientStatusApiRes", async (event, args) => {
  try {
    const stateResult = args.apiStatus;

    //calling the service layer for loggin in clients to their respective brokers
    // var res = await clientBrokerConnection(body);

    // if (res == "error") {
    //   return res;
    // }

    // var stateResult = logic.clientsState(res.data);

    store.set("clientStatus", stateResult);
    return stateResult;
  } catch (e) {
    return "error";
  }
});

ipcMain.handle("ipc-placeOrder", async (event, args) => {
  try {
    const body = args.body;
    const res = await clientApi.placeOrder_api(body, "apiToken");
    return res;
  } catch (e) {
    return "error";
  }
});

ipcMain.handle("ipc-OfflineClient", async (event, userId) => {
  store.set("userId", userId);
  const userIdData = store.get("userId");
  try {
    const res = await clientApi.GetOfflineClient1(userIdData);
    return res;
  } catch (e) {
    return "error";
  }
});

//ipc for sending env variables
ipcMain.handle("get-env", async (event, args) => {
  try {
    const base_url_prod = process.env.API_BASE_URL_PROD;
    const base_url_dev = process.env.API_BASE_URL_DEV;
    const app_copyright = "Wealthwisers Technologies Pvt. Ltd";
    const app_version = app.getVersion();

    const envVariables = {
      base_url_prod,
      base_url_dev,
      app_copyright,
      app_version,
    };
    event.sender.send("env-variables", envVariables);
    //to run backend python exe
    return {
      base_url_prod: base_url_prod,
      base_url_dev: base_url_dev,
    };
  } catch (e) {
    return "error";
  }
});

//ipc for last live data
ipcMain.handle("set-liveData-props", async (event, args) => {
  try {
    let liveData = args;
    store.set("liveData", liveData);
    return liveData;
  } catch (e) {
    return "error";
  }
});

// ...existing code...

// Store handlers
ipcMain.handle("get-store", async (event, key) => {
  try {
    return store.get(key);
  } catch (error) {
    logger.error(`Error getting store key: ${key}`, error);
    return null;
  }
});

ipcMain.handle("set-store", async (event, key, value) => {
  try {
    store.set(key, value);
    return true;
  } catch (error) {
    logger.error(`Error setting store key: ${key}`, error);
    return false;
  }
});

ipcMain.handle("delete-store", async (event, key) => {
  try {
    store.delete(key);
    return true;
  } catch (error) {
    logger.error(`Error deleting store key: ${key}`, error);
    return false;
  }
});

ipcMain.handle(channel.APP_INFO, async () => {
  let appInfo = {
    appName: app.getName(),
    appVersion: app.getVersion(),
  };
  return appInfo;
});

/*To set credentials for github*/
autoUpdater.setFeedURL({
  provider: "github",
  owner: "admin-wealthwisers",
  repo: "tradeai1",
  private: true,
});

/*To show message in case of new update available to user*/
autoUpdater.on("update-available", (data) => {
  let pth = autoUpdater.downloadUpdate();
  mainWindow.webContents.send("update_available");
  logger.info(`update available and path and path : ${pth}`);
});

autoUpdater.on("update-not-available", (data) => {
  logger.info(`update not available, data : ${data}`);
});

/*Download Completion Message*/
autoUpdater.on("update-downloaded", (data) => {
  mainWindow.webContents.send("update_downloaded");
  logger.info(`update downloaded, data : ${data}`);
});

ipcMain.on("restart_app", async () => {
  logger.info(`App quit & executed to re-install.`);
  autoUpdater.quitAndInstall();
});

// Capture logs from the frontend
ipcMain.handle("register_log", async (event, logMessage) => {
  logger.info(`Frontend log: ${logMessage}`);
});

// // IPC to execute cli.exe
// Line 717 - Replace entire handler:

ipcMain.handle("runCli-ipc", async (event) => {
  return new Promise((resolve, reject) => {
    let cliExeFileName = "cli.exe";
    if (cliProcessPid) killProcess(cliProcessPid);

    let appRootPath = isProd
      ? path.resolve(app.getAppPath(), "..", "cli")
      : path.join(app.getAppPath(), "cliProgram");
    let cliExePath = path.join(appRootPath, cliExeFileName);

    const credsFilePath = isProd
      ? path.resolve(app.getAppPath(), "..", "cli")
      : path.join(appRootPath, "creds_merged.xlsx");
    const tradesFilePath = isProd
      ? path.resolve(app.getAppPath(), "..", "cli")
      : path.join(appRootPath, "trades_to_make.xlsx");

    // Check files exist
    if (
      !fs.existsSync(cliExePath) ||
      !fs.existsSync(credsFilePath) ||
      !fs.existsSync(tradesFilePath)
    ) {
      const missingFiles = [];
      if (!fs.existsSync(cliExePath)) missingFiles.push("cli.exe");
      if (!fs.existsSync(credsFilePath)) missingFiles.push("creds_merged.xlsx");
      if (!fs.existsSync(tradesFilePath)) missingFiles.push("trades_to_make.xlsx");

      return reject({
        success: false,
        error: `Missing required files: ${missingFiles.join(", ")}`,
      });
    }

    // Spawn the CLI process
    const cliProcess = spawn("cmd.exe", ["/c", cliExePath], {
      cwd: appRootPath,
      detached: false,
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    cliProcessPid = cliProcess.pid;

    cliProcess.stdout.on("data", (data) => {
      console.log(`CLI Output: ${data}`);
    });

    cliProcess.stderr.on("data", (data) => {
      console.error(`CLI Error: ${data}`);
    });

    cliProcess.on("error", (error) => {
      logger.error("CLI Process error:", error);
      reject({ success: false, error: error.message });
    });

    cliProcess.on("close", (code) => {
      logger.info(`CLI Process exited with code ${code}`);
      cliProcessPid = null;

      if (code === 0) {
        resolve({
          success: true,
          message: "CLI executed successfully",
          pid: cliProcess.pid,
        });
      } else {
        reject({
          success: false,
          error: `CLI exited with code ${code}`,
        });
      }
    });

    // Get process name
    find("pid", cliProcess.pid)
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          cliProcessName = list[0].name;
          logger.info(`CLI Process name: ${cliProcessName}`);
        }
      })
      .catch((err) => logger.error("Error finding process:", err));
  });
});