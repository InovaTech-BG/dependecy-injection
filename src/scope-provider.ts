import { AsyncLocalStorage } from "node:async_hooks";

const asyncLocalStorage = new AsyncLocalStorage<string>();

/**
 * @description Provide a scope for the current execution context
 * @param scopeId The scope id
 * @param callback The callback to run with the scope
 * @returns The result of the callback
 */
export function runWithScope<T>(scopeId: string, callback: () => T) {
	return asyncLocalStorage.run(scopeId, callback);
}

/**
 * @description Get the current scope id
 * @returns The scope id
 */
export function getScopeId(): string | undefined {
	return asyncLocalStorage.getStore();
}
