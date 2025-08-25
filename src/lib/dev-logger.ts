/**
 * Development-only logging utilities
 *
 * These logging functions will only output in development mode.
 * In production builds, they will be no-ops to improve performance
 * and prevent sensitive information from being logged.
 */

/**
 * Logs an error message only in development mode
 * @param message The error message to log
 * @param error Optional error object or additional data
 */
export const devError = (message: string, error?: unknown): void => {
  if (__DEV__) {
    console.error(message, error);
  }
};

/**
 * Logs a warning message only in development mode
 * @param message The warning message to log
 * @param data Optional additional data
 */
export const devWarn = (message: string, data?: unknown): void => {
  if (__DEV__) {
    console.warn(message, data);
  }
};

/**
 * Logs an info message only in development mode
 * @param message The info message to log
 * @param data Optional additional data
 */
export const devLog = (message: string, data?: unknown): void => {
  if (__DEV__) {
    console.log(message, data);
  }
};

/**
 * Logs a debug message only in development mode
 * @param message The debug message to log
 * @param data Optional additional data
 */
export const devDebug = (message: string, data?: unknown): void => {
  if (__DEV__) {
    console.debug(message, data);
  }
};

/**
 * Logs performance timing information only in development mode
 * @param label The performance label
 * @param startTime The start time (from performance.now())
 * @param endTime The end time (from performance.now())
 */
export const devPerf = (label: string, startTime: number, endTime: number): void => {
  if (__DEV__) {
    console.log(`🏃‍♂️ ${label}: ${(endTime - startTime).toFixed(2)}ms`);
  }
};

/**
 * Conditional logging based on a condition
 * @param condition The condition to check
 * @param message The message to log
 * @param data Optional additional data
 */
export const devLogIf = (condition: boolean, message: string, data?: unknown): void => {
  if (__DEV__ && condition) {
    console.log(message, data);
  }
};

// Global types for __DEV__
declare const __DEV__: boolean;
