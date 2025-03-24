import { CloseEvent, ErrorEvent, MessageEvent, WebSocket } from "ws";

export interface SocketDetails {
  url: string;
  opts: {
    headers: {
      cookie: string;
    };
  };
}

interface PromiseDetails {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: any) => void;
}

// assumes that websocket happens in request to response format sequentially
export class SocketPromiseWrapper {
  socket: WebSocket;
  promise: PromiseDetails | null = null;
  timeoutId: Timer | null = null;
  isReady = false;

  constructor(s: SocketDetails) {
    this.socket = new WebSocket(s.url, s.opts);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onopen = () => {
      this.isReady = true;
    };
    this.socket.onerror = this.handleError.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
  }

  ready() {
    return new Promise<void>((resolve, reject) => {
      let t = setTimeout(() => {
        clearTimeout(t);
        reject("socket ready timed out");
      }, 5000);

      let i = setInterval(() => {
        if (this.isReady) {
          clearInterval(i);
          clearTimeout(t);
          resolve();
        }
      }, 50);
    });
  }

  send(m: string, timeout: number = 5000) {
    if (this.promise) {
      throw new Error("socket in use");
    }

    return new Promise<string>((resolve, reject) => {
      this.promise = {
        resolve: resolve,
        reject: reject,
      };

      this.timeoutId = setTimeout(() => {
        this.cleanup();
        reject("timed out");
      }, timeout);

      try {
        this.socket.send(m);
      } catch (e) {
        this.cleanup();
        reject(e);
      }
    });
  }

  cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      this.promise = null;
    }
  }

  handleMessage(e: MessageEvent) {
    if (this.promise) {
      this.promise.resolve(e.data.toString());
      this.cleanup();
    }
  }

  handleError(e: ErrorEvent) {
    if (this.promise) {
      this.cleanup();
      this.promise.reject("websocket error");
    }
  }

  handleClose(e: CloseEvent) {
    if (this.promise) {
      this.cleanup();
      this.promise.reject("websocket closed");
    }
  }
}
