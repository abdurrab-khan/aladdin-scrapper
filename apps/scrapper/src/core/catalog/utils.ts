import * as fs from "fs";
import type { History } from "../../types/common.js";

class ManagerUtils {
  historyPath: string;

  constructor(historyPath: string) {
    this.historyPath = historyPath;
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
