import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..', '..')
const problemsDir = path.join(projectRoot, 'src', 'data', 'problems')

function escapeDoubleQuotes(value: string): string {
	return value.replace(/"/g, '\\"')
}

export type ProblemRecord = {
	slug: string
	title: string
	markdown: string
	source: string
}

export async function collectExistingSlugs(): Promise<Set<string>> {
	const slugs = new Set<string>()

	try {
		const entries = await readdir(problemsDir)
		for (const entry of entries) {
			if (entry.endsWith('.solution.md')) {
				slugs.add(entry.slice(0, -'.solution.md'.length))
			} else if (entry.endsWith('.md')) {
				slugs.add(entry.slice(0, -'.md'.length))
			}
		}
	} catch (error) {
		const err = error as NodeJS.ErrnoException
		if (err.code !== 'ENOENT') {
			throw err
		}
	}

	return slugs
}

export async function ensureUniqueSlug(
	baseSlug: string,
	usedSlugs: Set<string>,
): Promise<string> {
	let candidate = baseSlug
	let suffix = 1

	while (usedSlugs.has(candidate) || (await slugExistsOnDisk(candidate))) {
		candidate = `${baseSlug}-${suffix}`
		suffix += 1
	}

	usedSlugs.add(candidate)
	return candidate
}

export async function writeProblemFiles(problem: ProblemRecord): Promise<void> {
	await mkdir(problemsDir, { recursive: true })

	const problemFilePath = path.join(problemsDir, `${problem.slug}.md`)
	const solutionFilePath = path.join(problemsDir, `${problem.slug}.solution.md`)

	if (await pathExists(problemFilePath)) {
		throw new Error(`Problem file already exists: ${problemFilePath}`)
	}

	if (await pathExists(solutionFilePath)) {
		throw new Error(`Solution file already exists: ${solutionFilePath}`)
	}

	const frontmatter = buildFrontmatter(problem)
	const problemContent = `${frontmatter}${problem.markdown}\n`
	const solutionPlaceholder = `## Solution\n\n_Add the solution for "${problem.title}" here._\n`

	await writeFile(problemFilePath, problemContent, 'utf8')
	await writeFile(solutionFilePath, solutionPlaceholder, 'utf8')
}

async function slugExistsOnDisk(slug: string): Promise<boolean> {
	const problemPath = path.join(problemsDir, `${slug}.md`)
	const solutionPath = path.join(problemsDir, `${slug}.solution.md`)
	return (await pathExists(problemPath)) || (await pathExists(solutionPath))
}

function buildFrontmatter(problem: ProblemRecord): string {
	return [
		'---',
		`title: "${escapeDoubleQuotes(problem.title)}"`,
		'difficulty: ""',
		`source: "${escapeDoubleQuotes(problem.source)}"`,
		`cover: ""`,
		'---',
		'',
	].join('\n')
}

async function pathExists(targetPath: string): Promise<boolean> {
	try {
		await access(targetPath)
		return true
	} catch {
		return false
	}
}
