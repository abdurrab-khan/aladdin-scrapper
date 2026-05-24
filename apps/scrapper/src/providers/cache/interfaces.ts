export abstract class BaseCache {
  /**
   * Connects to the cache database.
   */
  abstract connect(): Promise<boolean>;

  /**
   * Disconnects from the cache database.
   */
  abstract disconnect(): Promise<boolean>;

  /**
   * Checks if a URL is already cached.
   * @param url The URL to check.
   * @param pattern Optional pattern for cache key matching.
   */
  abstract isUrlCached(url: string, pattern?: string): Promise<boolean>;
}
