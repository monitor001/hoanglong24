declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      disconnect(): void;
      connect(options?: any): any;
    };
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
}

export {};
