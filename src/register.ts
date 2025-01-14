import { Container } from "./container";

export const dependecy = {
	registerFactory: (register: (container: Container) => void) => {
		return register;
	},
};
