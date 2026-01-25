import * as fs from "fs";
import type { Category, History } from "../../types/index.js";

class ManagerUtils {
  configPath: string;
  historyPath: string;

  constructor(configPath: string, historyPath: string) {
    this.configPath = configPath;
    this.historyPath = historyPath;
  }

  loadConfig(): Category[] {
    const data = fs.readFileSync(this.configPath, "utf-8");
    return JSON.parse(data);
  }

  loadHistory(): History {
    try {
      const data = fs.readFileSync(this.historyPath, "utf-8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  saveHistory(history: History): void {
    fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
  }
}

export default ManagerUtils;
