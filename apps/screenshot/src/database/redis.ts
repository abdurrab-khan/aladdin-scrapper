import { Redis } from "ioredis";

const redis = new Redis({
  port: 6379,
  host: "localhost",
  password: "",
  maxRetriesPerRequest: null,
});

export default redis;
