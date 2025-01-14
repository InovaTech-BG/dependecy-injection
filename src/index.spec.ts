import { container } from "./container";
import { Inject } from "./inject";
import { loadInjects } from "./loader";
import { getScopeId, runWithScope } from "./scope-provider";
import { CustomService, InMemoryCustomService } from "./test/classes";
import { WithDeps } from "./with-deps";

@WithDeps(getScopeId)
class CustomUseCase {
	@Inject(CustomService)
	private service!: CustomService;

	async execute(params: { name: string; email: string }): Promise<void> {
		await this.service.create(params);
	}

	get spy() {
		return (this.service as InMemoryCustomService).repositorySpy;
	}
}

describe("Dependecy Injection", () => {
	afterEach(() => {
		container.clear();
	});

	it("should be able to inject and use dependecies transient", async () => {
		await loadInjects({
			baseDirs: ["."],
			includeExtensions: [".transient.injects-test.ts"],
		});

		const useCase = new CustomUseCase();
		await useCase.execute({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		expect(useCase.spy).toBeCalled();

		const useCase2 = new CustomUseCase();

		expect(useCase2.spy).not.toBeCalled();
	});

	it("should be able to inject and use dependecies singleton", async () => {
		await loadInjects({
			baseDirs: ["."],
			includeExtensions: [".sigleton.injects-test.ts"],
		});

		const useCase = new CustomUseCase();
		await useCase.execute({
			name: "John Doe",
			email: "johndoe@example.com",
		});

		expect(useCase.spy).toBeCalled();

		const useCase2 = new CustomUseCase();

		expect(useCase2.spy).toBeCalled();
	});

	it("should be able to inject and use dependecies scoped", async () => {
		await loadInjects({
			baseDirs: ["."],
			includeExtensions: [".scoped.injects-test.ts"],
		});

		await runWithScope("scope1", async () => {
			const useCase = new CustomUseCase();
			await useCase.execute({
				name: "John Doe",
				email: "johndoe@example.com",
			});
			expect(useCase.spy).toBeCalled();

			const useCase2 = new CustomUseCase();
			expect(useCase2.spy).toBeCalled();
		});

		await runWithScope("scope2", async () => {
			const useCase = new CustomUseCase();
			expect(useCase.spy).not.toBeCalled();
		});
	});
});
