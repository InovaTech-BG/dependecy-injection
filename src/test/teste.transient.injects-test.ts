import { dependecy } from "../register";
import {
	CustomRepository,
	CustomService,
	InMemoryCustomRepository,
	InMemoryCustomService,
} from "./classes";

export default dependecy.registerFactory((container) => {
	container.register(CustomService, InMemoryCustomService).transient();
	container.register(CustomRepository, InMemoryCustomRepository).transient();
});
