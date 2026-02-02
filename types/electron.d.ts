interface Window {
  electronAPI: {
    getStore: (key: string) => Promise<any>;
    setStore: (key: string, value: any) => Promise<boolean>;
    deleteStore: (key: string) => Promise<boolean>;
    readMemory: (key: string) => Promise<any>;
    updateMemory: (data: any) => Promise<any>;
    registerLog: (log: { filename?: string; message: string }) => Promise<{ success: boolean; error?: string }>;
    setClientStatusApiRes: (data: { apiStatus: any[] }) => Promise<{ success: boolean; error?: string }>;
    parseClientOrders: (data: { filename: string; filePath: string }) => Promise<any>;
    store: {
      read: (key: string) => Promise<any>;
      write: (key: string, value: any) => Promise<boolean>;
      delete: (key: string) => Promise<boolean>;
    };
  };
  ipc: {
    send: (channel: string, value: any) => void;
    on: (channel: string, callback: (...args: any[]) => void) => () => void;
    invoke: (channel: string, value?: any) => Promise<any>;
  };
}