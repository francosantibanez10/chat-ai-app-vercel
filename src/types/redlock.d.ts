declare module "redlock" {
  import { Redis } from "ioredis";

  interface RedlockOptions {
    retryCount?: number;
    retryDelay?: number;
    retryJitter?: number;
    automaticExtensionThreshold?: number;
  }

  interface Lock {
    release(): Promise<void>;
    extend(ttl: number): Promise<Lock>;
  }

  class Redlock {
    constructor(clients: Redis[], options?: RedlockOptions);

    acquire(resources: string[], ttl: number): Promise<Lock>;
    quit(): Promise<void>;

    on(event: string, listener: (error: Error) => void): void;
  }

  export = Redlock;
}
