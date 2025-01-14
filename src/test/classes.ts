import { Inject } from "../inject";
import { getScopeId } from "../scope-provider";
import { WithDeps } from "../with-deps";

export abstract class CustomService {
	abstract create(params: { name: string; email: string }): Promise<void>;
}

export abstract class CustomRepository {
	abstract create(params: { name: string; email: string }): Promise<void>;
}

export class InMemoryCustomRepository extends CustomRepository {
	public spy = vi.fn();
	async create(params: { name: string; email: string }): Promise<void> {
		this.spy(params);
	}
}

@WithDeps(getScopeId)
export class InMemoryCustomService extends CustomService {
	@Inject(CustomRepository)
	private repository!: CustomRepository;

	async create(params: { name: string; email: string }): Promise<void> {
		await this.repository.create(params);
	}

	get repositorySpy() {
		return (this.repository as InMemoryCustomRepository).spy;
	}
}
