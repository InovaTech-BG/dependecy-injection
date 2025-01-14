export enum Lifetime {
	TRANSIENT = "transient",
	SINGLETON = "singleton",
	SCOPED = "scoped",
}

interface Registration<T> {
	implementation: new (...args: any[]) => T;
	lifetime: Lifetime;
	instance?: T; // singleton and scoped
}

type ScopeMap = Map<Function, any>;

export class Container {
	private registration = new Map<Function, Registration<any>>();
	private scopeInstances = new Map<string, ScopeMap>();

	register<T>(
		token: abstract new (...args: any[]) => T,
		implementation: new (...args: any[]) => T,
	) {
		const reg: Registration<T> = {
			implementation,
			lifetime: Lifetime.TRANSIENT,
			instance: undefined,
		};
		this.registration.set(token, reg);

		return {
			transient: () => {
				reg.lifetime = Lifetime.TRANSIENT;
			},
			singleton: () => {
				reg.lifetime = Lifetime.SINGLETON;
			},
			scoped: () => {
				reg.lifetime = Lifetime.SCOPED;
			},
		};
	}

	resolve<T>(token: new (...args: any[]) => T, scopeId?: string): T {
		const reg = this.registration.get(token);
		if (!reg) {
			throw new Error(`Token not found: ${token.name}`);
		}

		switch (reg.lifetime) {
			case Lifetime.TRANSIENT:
				return new reg.implementation();
			case Lifetime.SINGLETON:
				if (!reg.instance) {
					reg.instance = new reg.implementation();
				}
				return reg.instance;
			case Lifetime.SCOPED: {
				if (!scopeId) {
					throw new Error("ScopeId is required to resolve ${token.name}");
				}
				let scope = this.scopeInstances.get(scopeId);
				if (!scope) {
					scope = new Map();
					this.scopeInstances.set(scopeId, scope);
				}
				if (!scope.has(token)) {
					scope.set(token, new reg.implementation());
				}
				return scope.get(token);
			}
			default:
				throw new Error("Invalid lifetime");
		}
	}

	clear() {
		this.registration.clear();
		this.scopeInstances.clear();
	}
}

export const container = new Container();
