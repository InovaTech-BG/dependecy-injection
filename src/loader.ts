import fs from "node:fs";
import path from "node:path";
import { container } from "./container";

export interface DependecyLoaderConfig {
	baseDirs: string[];
	excludeDirs?: string[];
	includeExtensions?: string[];
	includePatterns?: RegExp[];
	excludeFiles?: RegExp[];
}

export async function loadInjects(config: DependecyLoaderConfig) {
	const {
		baseDirs,
		excludeDirs = [],
		includeExtensions = [".injects.ts"],
		includePatterns = [],
		excludeFiles = [],
	} = config;

	excludeDirs.push("node_modules", ".git");

	for (const baseDir of baseDirs) {
		const absoluteBaseDir = path.isAbsolute(baseDir)
			? baseDir
			: path.resolve(process.cwd(), baseDir);
		if (
			fs.existsSync(absoluteBaseDir) &&
			fs.statSync(absoluteBaseDir).isDirectory()
		) {
			await loadInjectsFromDir(absoluteBaseDir, {
				excludeDirs,
				includeExtensions,
				includePatterns,
				excludeFiles,
			});
		} else {
			throw new Error(`Directory ${absoluteBaseDir} not found`);
		}
	}
}

async function loadInjectsFromDir(
	dir: string,
	config: Omit<DependecyLoaderConfig, "baseDirs">,
) {
	const { excludeDirs, excludeFiles, includeExtensions, includePatterns } =
		config;

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			if (excludeDirs?.includes(entry.name)) {
				continue;
			}

			await loadInjectsFromDir(fullPath, config);
		} else if (entry.isFile()) {
			const hasIncludedExtension = includeExtensions?.some((ext) =>
				entry.name.endsWith(ext),
			);
			const matchesIncludePattern = includePatterns?.some((pattern) =>
				pattern.test(entry.name),
			);
			const matchesExcludeFile = excludeFiles?.some((pattern) =>
				pattern.test(entry.name),
			);

			const shouldInclude = hasIncludedExtension || matchesIncludePattern;
			const shouldExclude = matchesExcludeFile;

			if (shouldInclude && !shouldExclude) {
				try {
					const module = await import(fullPath);
					module.default(container);
					console.log(`Loaded injects from ${fullPath}`);
				} catch (err) {
					console.error(`Failed to load injects from ${fullPath}`, err);
				}
			}
		}
	}
}
