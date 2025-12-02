import fs from "node:fs/promises"
import path from "node:path"
import { tmpdir } from "node:os"
import Logger from "@nan0web/log"
import { createProgress } from "./cli.js"
import { runCommandAsync } from "./runCommandAsync.js"

/**
 * Clone a single package via sparse checkout.
 *
 * In test mode (`MOCK_CLONE=true`) the function does **not** invoke `git`.
 * It creates a minimal temporary package directory containing a `package.json`
 * with a `test:all` script (added if missing) and returns its root path.
 *
 * @param {string} repoUrl – ignored when mock mode is active.
 * @param {string} pkg
 * @param {(data: string, error?: boolean) => void} onChunk
 * @returns {Promise<string>} absolute path to the package root inside the temp dir
 */
export async function clonePackage(repoUrl, pkg, onChunk) {
	if (process.env.MOCK_CLONE === "true") {
		// fast deterministic mock: create a temporary folder with a dummy package.json
		const temp = path.join(tmpdir(), `nan0-mock-${pkg}-${Date.now()}`)
		const pkgRoot = path.join(temp, "packages", pkg)
		await fs.mkdir(pkgRoot, { recursive: true })
		const pjPath = path.join(pkgRoot, "package.json")
		const pj = { name: pkg, version: "0.0.0", scripts: {} }
		// ensure test:all script exists
		if (!pj.scripts["test:all"]) {
			pj.scripts["test:all"] =
				"pnpm test && pnpm test:docs && pnpm test:coverage && pnpm test:release"
		}
		await fs.mkdir(path.dirname(pjPath), { recursive: true })
		await fs.writeFile(pjPath, JSON.stringify(pj, null, 2))
		return pkgRoot
	}

	const temp = path.join(tmpdir(), `nan0-audit-${pkg}-${Date.now()}`)
	await fs.mkdir(temp, { recursive: true })

	// shallow sparse checkout (real git)
	await runCommandAsync(
		"git",
		[
			"clone",
			"--depth",
			"1",
			"--filter=blob:none",
			"--no-checkout",
			"--sparse",
			repoUrl,
			temp,
		],
		{ cwd: temp, onChunk }
	)

	onChunk(`% git -C ${temp} sparse-checkout init --cone`)
	await runCommandAsync("git", ["-C", temp, "sparse-checkout", "init", "--cone"], {
		onChunk,
	})
	onChunk(`% git -C ${temp} sparse-checkout set packages/${pkg}`)
	await runCommandAsync(
		"git",
		["-C", temp, "sparse-checkout", "set", `packages/${pkg}`],
		{ onChunk }
	)
	onChunk(`% git -C ${temp} checkout`)
	await runCommandAsync("git", ["-C", temp, "checkout"], { onChunk })

	const pkgRoot = temp

	// -------------------------------------------------------------
	// Ensure a package.json exists and contains a `test:all` script.
	// Some packages in the monorepo may not ship a `package.json`
	// (e.g. when the repo is shallow or the package was removed).
	// In that case we create a minimal one to keep the isolation
	// workflow functional.
	// -------------------------------------------------------------
	const pjPath = path.join(pkgRoot, "package.json")
	let pj
	try {
		const raw = await fs.readFile(pjPath, "utf8")
		pj = JSON.parse(raw)
	} catch (e) {
		// If reading fails (file missing or corrupted) fall back to a minimal stub.
		const logger = new Logger(Logger.detectLevel(process.argv))
		logger.warn(
			`package.json missing or unreadable for "${pkg}". Creating a minimal stub.`
		)
		pj = { name: pkg, version: "0.0.0", scripts: {} }
	}

	if (!pj.scripts) pj.scripts = {}
	if (!pj.scripts["test:all"]) {
		pj.scripts["test:all"] =
			"pnpm test && pnpm test:docs && pnpm test:coverage && pnpm test:release"
	}
	// Write (or overwrite) the possibly‑created package.json.
	await fs.writeFile(pjPath, JSON.stringify(pj, null, 2))

	return pkgRoot
}
