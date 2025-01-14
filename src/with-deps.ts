import { container } from "./container";
import { INJECT_TOKEN_METADATA_KEY } from "./inject";

export function WithDeps(
	getScopeId?: () => string | undefined,
): ClassDecorator {
	return (target) => {
		const NewClass = class extends (target as unknown as {
			new (...args: any[]): any;
		}) {
			constructor(...args: any[]) {
				super(...args);

				const scopeId = getScopeId ? getScopeId() : undefined;

				console.log(scopeId);

				const instance = new (target as unknown as any)();

				const propertyNames = Object.getOwnPropertyNames(instance);

				for (const propertyName of propertyNames) {
					const token = Reflect.getMetadata(
						INJECT_TOKEN_METADATA_KEY,
						target.prototype,
						propertyName,
					);
					if (token) {
						const instance = container.resolve(token, scopeId);

						(this as any)[propertyName] = instance;
					}
				}
			}
		};

		return NewClass as unknown as typeof target;
	};
}
