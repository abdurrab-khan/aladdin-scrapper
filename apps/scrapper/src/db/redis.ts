import { createClient } from "redis";

class RedisDB {
  private host: string;
  private port: number;
  private password: string;
  private username: string;
  private db: number;
  private client: any | null;

  constructor() {
    this.host = process.env["REDIS_HOST"] || "localhost";
    this.port = parseInt(process.env["REDIS_PORT"] || "6379");
    this.password = process.env["REDIS_PASSWORD"] || "";
    this.username = "default";
    this.db = 0;
    this.client = null;
  }

  async connect(): Promise<boolean> {
    try {
      this.client = createClient({
        socket: {
          host: this.host,
          port: this.port,
          connectTimeout: 2000,
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              return new Error("Max retries reached");
            }
            return Math.min(retries * 100, 3000);
          },
        },
        password: this.password,
        username: this.username,
        database: this.db,
      });

      this.client.on("error", (err) => {
        console.error("⛔ Redis error:", err);
      });

      await this.client.connect();
      await this.client.ping();
      console.log("🔗 Redis connected successfully.");
      return true;
    } catch (error: any) {
      if (error.code === "ECONNREFUSED") {
        console.error("⛔ Redis connection error:", error.message);
      } else if (error.message?.includes("max")) {
        console.warn("⚠️ Max connection hit error:", error.message);
      } else {
        console.error("⛔ Unexpected error:", error.message);
      }
      return false;
    }
  }

  async disconnect(): Promise<boolean> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        console.log("🔒 Redis disconnected successfully.");
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("⛔ Error during Redis disconnect:", error.message);
      return false;
    }
  }

  async isUrlCached(
    url: string,
    pattern: string = "url_cache_*"
  ): Promise<boolean> {
    if (!this.client) {
      console.warn("⚠️ Redis client is not connected.");
      return false;
    }

    try {
      let cursor = "0";

      do {
        const result = await this.client.scan(cursor, {
          MATCH: pattern,
          COUNT: 100,
        });

        cursor = result.cursor.toString();
        const keys = result.keys;

        if (keys.length === 0) {
          if (cursor === "0") {
            break;
          }
          continue;
        }

        for (const key of keys) {
          const exists = await this.client.sIsMember(key, url);
          if (exists) {
            return true;
          }
        }
      } while (cursor !== "0");

      return false;
    } catch (error: any) {
      console.error("⛔ Error checking URL cache:", error.message);
      return false;
    }
  }
}

export default RedisDB;
