import * as fs from "fs";
import type {
  Category,
  SelectionResult,
  History,
  SubCategoryDetails,
} from "../types/index.js";

// Types
class CatalogRotationManager {
  private config: Category[];
  private history: History;
  private configPath: string;
  private historyPath: string;

  constructor(configPath: string, historyPath: string) {
    this.configPath = configPath;
    this.historyPath = historyPath;
    this.config = this.loadConfig();
    this.history = this.loadHistory();
  }

  private loadConfig(): Category[] {
    const data = fs.readFileSync(this.configPath, "utf-8");
    return JSON.parse(data);
  }

  private loadHistory(): History {
    try {
      const data = fs.readFileSync(this.historyPath, "utf-8");
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private saveHistory(): void {
    fs.writeFileSync(this.historyPath, JSON.stringify(this.history, null, 2));
  }

  private initializeHistoryForCategory(categoryName: string): void {
    if (!this.history[categoryName]) {
      this.history[categoryName] = {
        subCategories: [],
        lowPriorityCategories: [],
      };
    }
  }

  private getCategoryCompletionScore(category: Category): number {
    const categoryName = category.category;
    this.initializeHistoryForCategory(categoryName);

    const totalSubcats = Object.keys(category.subCategories).length ?? 0;
    const completedSubcats =
      this.history[categoryName]?.subCategories.length ?? 0;

    const totalLowPriority = category.lowPriorityCategories
      ? Object.keys(category.lowPriorityCategories).length
      : 0;
    const completedLowPriority =
      this.history[categoryName]?.lowPriorityCategories.length ?? 0;

    // Score: lower is better (less completed)
    const subcatProgress =
      totalSubcats > 0 ? completedSubcats / totalSubcats : 0;
    const lowPriorityProgress =
      totalLowPriority > 0 ? completedLowPriority / totalLowPriority : 0;

    return subcatProgress + lowPriorityProgress * 0.5; // Low priority weighted less
  }

  private getUncompletedSubcategories(category: Category): string[] {
    const categoryName = category.category;
    this.initializeHistoryForCategory(categoryName);

    const allSubcats = Object.keys(category.subCategories);
    const completed = this.history[categoryName]?.subCategories;

    return allSubcats.filter((subcat) => !completed?.includes(subcat));
  }

  private getUncompletedLowPriority(category: Category): string[] {
    const categoryName = category.category;
    this.initializeHistoryForCategory(categoryName);

    if (!category.lowPriorityCategories) return [];

    const allLowPriority = Object.keys(category.lowPriorityCategories);
    const completed = this?.history[categoryName]?.lowPriorityCategories;

    return allLowPriority.filter((subcat) => !completed?.includes(subcat));
  }

  private shouldMoveToLowPriority(category: Category): boolean {
    const uncompleted = this.getUncompletedSubcategories(category);
    return uncompleted.length === 0;
  }

  private checkIfAllComplete(): boolean {
    return this.config.every((category) => {
      const uncompletedSubcats = this.getUncompletedSubcategories(category);
      const uncompletedLowPriority = this.getUncompletedLowPriority(category);
      return (
        uncompletedSubcats.length === 0 && uncompletedLowPriority.length === 0
      );
    });
  }

  private resetHistory(): void {
    console.log("🔄 All categories completed! Resetting history...\n");
    this.history = {};
    this.saveHistory();
  }

  private getSubcategoryDetails(category: Category, subcategories: string[]) {
    const details: SubCategoryDetails = {};

    for (const subCat of subcategories) {
      if (category.subCategories[subCat]) {
        details[subCat] = category.subCategories[subCat];
      }
    }

    return details;
  }

  selectCategories(): SelectionResult[] {
    // Check if we need to reset
    if (this.checkIfAllComplete()) {
      this.resetHistory();
    }

    const results: SelectionResult[] = [];

    // Sort categories by completion score (ascending - least completed first)
    const sortedCategories = [...this.config].sort((a, b) => {
      return (
        this.getCategoryCompletionScore(a) - this.getCategoryCompletionScore(b)
      );
    });

    for (const category of sortedCategories) {
      if (results.length >= 2) break;

      const categoryName = category.category;
      this.initializeHistoryForCategory(categoryName);

      // Check if we should work on regular subcategories or low priority
      const shouldUseLowPriority = this.shouldMoveToLowPriority(category);

      if (shouldUseLowPriority) {
        const uncompletedLowPriority = this.getUncompletedLowPriority(category);

        if (uncompletedLowPriority.length > 0) {
          const selected = uncompletedLowPriority.slice(0, 3);
          results.push({
            category: categoryName,
            subcategories: selected,
            subcategoriesDetails: this.getSubcategoryDetails(
              category,
              selected
            ),
            isLowPriority: true,
          });
        }
      } else {
        const uncompletedSubcats = this.getUncompletedSubcategories(category);

        if (uncompletedSubcats.length > 0) {
          const selected = uncompletedSubcats.slice(0, 2);
          results.push({
            category: categoryName,
            subcategories: selected,
            subcategoriesDetails: this.getSubcategoryDetails(
              category,
              selected
            ),
            isLowPriority: false,
          });
        }
      }
    }

    return results;
  }

  markAsCompleted(selections: SelectionResult[]): void {
    for (const selection of selections) {
      this.initializeHistoryForCategory(selection.category);

      if (selection.isLowPriority) {
        // Add to low priority history
        for (const subcat of selection.subcategories) {
          if (
            !this.history[selection.category]?.lowPriorityCategories.includes(
              subcat
            )
          ) {
            this.history[selection.category]?.lowPriorityCategories.push(
              subcat
            );
          }
        }
      } else {
        // Add to regular subcategories history
        for (const subcat of selection.subcategories) {
          if (
            !this.history[selection.category]?.subCategories.includes(subcat)
          ) {
            this.history[selection.category]?.subCategories.push(subcat);
          }
        }
      }
    }

    this.saveHistory();
  }

  run(): SelectionResult[] {
    console.log("🚀 Starting catalog rotation...\n");

    const selections = this.selectCategories();

    console.log("📋 Selected categories and subcategories:\n");
    selections.forEach((selection, index) => {
      const priorityLabel = selection.isLowPriority
        ? "🔽 LOW PRIORITY"
        : "⭐ REGULAR";
      console.log(`${index + 1}. ${selection.category} ${priorityLabel}`);
      selection.subcategories.forEach((subcat) => {
        console.log(`   - ${subcat}`);
      });
      console.log();
    });

    // Mark as completed
    this.markAsCompleted(selections);

    console.log("✅ History updated successfully!\n");

    return selections;
  }
}

// Usage example
const manager = new CatalogRotationManager(
  "./src/crawler/constants/catalog-config.json",
  "./src/crawler/constants/catalog-history.json"
);

export default manager;
