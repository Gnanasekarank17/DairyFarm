/**
 * Debounce hook that returns a debounced value.
 */
export declare function useDebounce<T>(value: T, delay: number): T;
/**
 * Returns a debounced callback.
 */
export declare function useDebouncedCallback<TArgs extends unknown[]>(callback: (...args: TArgs) => void, delay: number): (...args: TArgs) => void;
/**
 * Clamp a number between min and max.
 */
export declare function clamp(value: number, min: number, max: number): number;
