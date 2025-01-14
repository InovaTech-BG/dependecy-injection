import { dependecy } from "../register";
import {
	CustomRepository,
	CustomService,
	InMemoryCustomRepository,
	InMemoryCustomService,
} from "./classes";

export default dependecy.registerFactory((container) => {
	container.register(CustomService, InMemoryCustomService).singleton();
	container.register(CustomRepository, InMemoryCustomRepository).singleton();
});
