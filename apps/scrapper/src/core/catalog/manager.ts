import ManagerUtils from "./utils.js";
import type {
  Category,
  SelectionResult,
  History,
  ScrapeTask,
} from "../../types/common.js";

class CatalogRotationManager {
  private config: Category[];
  private history: History;
  private managerUtils: ManagerUtils;

  constructor(configPath: string, historyPath: string) {
    this.managerUtils = new ManagerUtils(configPath, historyPath);

    // Loading product config and history path
    this.config = this.managerUtils.loadConfig();
    this.history = this.managerUtils.loadHistory();
  }

  run(): SelectionResult[] {
    console.log("Beginning catalog rotation...\n");

    const selections = this.selectCategories();

    console.log("Selected categories and subcategories:\n");
    selections.forEach((selection, index) => {
      const priorityLabel = selection.isLowPriority
        ? "LOW PRIORITY"
        : "REGULAR";

      console.log(`${index + 1}. ${selection.category} (${priorityLabel})`);
      selection.tasks.forEach((task) => {
        console.log(`   - ${task.name}`);
      });

      console.log();
    });

    // Mark as completed
    this.markAsCompleted(selections);

    console.log("History updated.\n");

    return selections;
  }

  private selectCategories(): SelectionResult[] {
    // Reset history if categories or lowPriority are all completed
    this.resetHistory();

    const results: SelectionResult[] = [];

    // Sort categories by completion score (ascending - least completed first)
    const [shouldUseLowPriority, sortedCategories] = this.getSortedCategories();

    for (const category of sortedCategories) {
      const totalTasks = results.reduce((acc, curr) => {
        return acc + curr.tasks.length;
      }, 0);
      if (totalTasks >= 4) break;

      const categoryName = category.category;
      this.initializeHistoryForCategory(categoryName);

      // Check if we should work on regular subcategories or low priority
      const sliceCount = totalTasks <= 2 ? 2 : totalTasks - 2;
      const unCompletedNames = shouldUseLowPriority
        ? this.getUncompletedLowPriority(category)
        : this.getUncompletedSubcategories(category);

      if (unCompletedNames.length === 0) continue;

      const slicedNames = unCompletedNames.slice(0, sliceCount);
      const tasks = this.buildTasks(category, slicedNames);

      results.push({
        category: categoryName,
        tasks,
        isLowPriority: shouldUseLowPriority,
      });
    }

    return results;
  }

  private markAsCompleted(selections: SelectionResult[]): void {
    for (const selection of selections) {
      this.initializeHistoryForCategory(selection.category);

      if (selection.isLowPriority) {
        // Add to low priority history
        for (const task of selection.tasks) {
          if (
            !this.history[selection.category]?.lowPriorityCategories.includes(
              task.name,
            )
          ) {
            this.history[selection.category]?.lowPriorityCategories.push(
              task.name,
            );
          }

          // Update last low priority run timestamp if all low priority completed
          const uncompletedLowPriority = this.getUncompletedLowPriority(
            this.config.find((cat) => cat.category === selection.category)!,
          );

          if (uncompletedLowPriority.length === 0) {
            this.history[selection.category]!.lastLowPriorityRun = Date.now();
          }
        }
      } else {
        // Add to regular subcategories history
        for (const task of selection.tasks) {
          if (
            !this.history[selection.category]?.subCategories.includes(task.name)
          ) {
            this.history[selection.category]?.subCategories.push(task.name);
          }
        }
      }

      // Update timestamp
      if (this.history[selection.category]) {
        this.history[selection.category]!.timeStamp = Date.now();
      }
    }

    // Saving the history
    this.managerUtils.saveHistory(this.history);
  }

  private initializeHistoryForCategory(categoryName: string): void {
    if (!this.history[categoryName]) {
      this.history[categoryName] = {
        subCategories: [],
        lowPriorityCategories: [],
        lastLowPriorityRun: null,
        timeStamp: null,
      };
    }

    if (!this.history[categoryName].timeStamp) {
      this.history[categoryName].timeStamp = Date.now();
    }

    if (!this.history[categoryName].lastLowPriorityRun) {
      this.history[categoryName].lastLowPriorityRun = Date.now();
    }
  }

  private getLowPriorityCompletionScore(category: Category): number {
    const categoryName = category.category;

    this.initializeHistoryForCategory(categoryName);

    const totalLowPriority = category.lowPriorityCategories
      ? Object.keys(category?.lowPriorityCategories ?? []).length
      : 0;
    const completedLowPriority =
      this.history[categoryName]?.lowPriorityCategories.length ?? 0;

    return totalLowPriority > 0 ? completedLowPriority / totalLowPriority : 0;
  }

  private getCategoryCompletionScore(category: Category): number {
    const categoryName = category.category;

    this.initializeHistoryForCategory(categoryName);

    const totalSubcats = Object.keys(category?.subCategories ?? []).length ?? 0;
    const completedSubcats =
      this.history[categoryName]?.subCategories.length ?? 0;

    return totalSubcats > 0 ? completedSubcats / totalSubcats : 0;
  }

  private getUncompletedSubcategories(category: Category): string[] {
    const categoryName = category.category;

    this.initializeHistoryForCategory(categoryName);

    const allSubcats = Object.keys(category?.subCategories ?? []);
    const completed = this.history[categoryName]?.subCategories;

    return allSubcats.filter((subcat) => !completed?.includes(subcat));
  }

  private getUncompletedLowPriority(category: Category): string[] {
    const categoryName = category.category;
    this.initializeHistoryForCategory(categoryName);

    if (!category.lowPriorityCategories) return [];

    const allLowPriority = Object.keys(category?.lowPriorityCategories ?? []);
    const completed = this?.history[categoryName]?.lowPriorityCategories;

    return allLowPriority.filter((subcat) => !completed?.includes(subcat));
  }

  private getEligibleLowPriorityCategories(): Category[] {
    return this.config.filter((category) => {
      const timeStamp = Number(
        this.history[category.category]?.lastLowPriorityRun,
      );
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      // Check whether a low priority exists or not.
      if (
        !category.lowPriorityCategories ||
        Object.keys(category.lowPriorityCategories).length === 0
      ) {
        return false;
      }

      return timeStamp && Date.now() - timeStamp > oneWeek;
    });
  }

  private shouldMoveToLowPriority(): boolean {
    const uncompleted = this.getEligibleLowPriorityCategories();
    return uncompleted.length > 0;
  }

  private checkIfAllCategoryCompleted(): boolean {
    return this.config.every((cat) => {
      const uncompletedSubcats = this.getUncompletedSubcategories(cat);
      return uncompletedSubcats.length === 0;
    });
  }

  private checkIfAllLowPriorityCompleted(): boolean {
    return this.config.every((category) => {
      const uncompletedLowPriority = this.getUncompletedLowPriority(category);

      return uncompletedLowPriority.length === 0;
    });
  }

  private resetCategoryHistory(): void {
    console.log("All categories completed. Resetting history...\n");

    this.history = Object.fromEntries(
      Object.entries(this.history).map(([key, value]) => {
        return [
          key,
          {
            subCategories: [],
            lowPriorityCategories: value.lowPriorityCategories || [],
            timeStamp: value.timeStamp || null,
            lastLowPriorityRun: value.lastLowPriorityRun || null,
          },
        ];
      }),
    );

    this.managerUtils.saveHistory(this.history);
  }

  private resetLowPriorityHistory(): void {
    console.log(
      "All low priority categories completed. Resetting low priority history...\n",
    );

    this.history = Object.fromEntries(
      Object.entries(this.history).map(([key, value]) => {
        return [
          key,
          {
            subCategories: value.subCategories || [],
            lowPriorityCategories: [],
            timeStamp: value.timeStamp || null,
            lastLowPriorityRun: value.lastLowPriorityRun || null,
          },
        ];
      }),
    );
  }

  private resetHistory(): void {
    const allCategoriesCompleted = this.checkIfAllCategoryCompleted();
    const allLowPriorityCompleted = this.checkIfAllLowPriorityCompleted();

    // Reset category history if all categories are completed
    if (allCategoriesCompleted) {
      this.resetCategoryHistory();
    }

    // Reset low priority history if all low priority categories are completed
    if (allLowPriorityCompleted) {
      this.resetLowPriorityHistory();
    }
  }

  private getSortedCategories(): [boolean, Category[]] {
    const shouldMoveToLowPriority = this.shouldMoveToLowPriority();
    const config = shouldMoveToLowPriority
      ? this.getEligibleLowPriorityCategories()
      : [...this.config];

    return [
      shouldMoveToLowPriority,
      config.sort((a, b) => {
        if (shouldMoveToLowPriority) {
          return (
            this.getLowPriorityCompletionScore(a) -
            this.getLowPriorityCompletionScore(b)
          );
        } else {
          return (
            this.getCategoryCompletionScore(a) -
            this.getCategoryCompletionScore(b)
          );
        }
      }),
    ];
  }

  private buildTasks(category: Category, subcategoryNames: string[]): ScrapeTask[] {
    return subcategoryNames.map((name) => {
      const details =
        category.subCategories[name] ||
        (category.lowPriorityCategories ? category.lowPriorityCategories[name] : undefined);

      if (!details) {
        throw new Error(`Subcategory details not found for ${name} in category ${category.category}`);
      }

      return {
        name,
        details,
      };
    });
  }
}

// Usage example
const manager = new CatalogRotationManager(
  "./data/catalog-config.json",
  "./data/catalog-history.json",
);

export default manager;
