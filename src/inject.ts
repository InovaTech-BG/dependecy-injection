import "reflect-metadata";

export const INJECT_TOKEN_METADATA_KEY = Symbol("INJECT_TOKEN_METADATA_KEY");

export function Inject(token: Function): PropertyDecorator {
	return (target, propertyKey) => {
		console.log("Inject", token, target, propertyKey);
		Reflect.defineMetadata(
			INJECT_TOKEN_METADATA_KEY,
			token,
			target,
			propertyKey,
		);
	};
}
