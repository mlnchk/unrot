import { stderr as errorOutput, stdout as output } from 'node:process'
import { collectExistingSlugs, ensureUniqueSlug, writeProblemFiles } from './file-writer'
import { fetchHtml, parseProblem } from './parser'

type GeneratedProblem = {
	slug: string
	title: string
	markdown: string
	source: string
}

function writeLine(message: string): void {
	output.write(`${message}\n`)
}

function writeError(message: string): void {
	errorOutput.write(`${message}\n`)
}

function slugifyTitle(rawTitle: string): string {
	const normalized = rawTitle
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/['"]/g, '')
		.replace(/&/g, ' and ')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase()

	return normalized.length > 0 ? normalized : 'problem'
}

async function generateProblem(
	url: string,
	usedSlugs: Set<string>,
): Promise<GeneratedProblem> {
	writeLine(`Processing ${url}...`)

	const html = await fetchHtml(url)
	const parsed = parseProblem(html, url)

	const baseSlug = slugifyTitle(parsed.title)
	const slug = await ensureUniqueSlug(baseSlug, usedSlugs)

	return {
		slug,
		title: parsed.title,
		markdown: parsed.markdown,
		source: url,
	}
}

async function main(): Promise<void> {
	const urls = process.argv
		.slice(2)
		.filter((argument) => argument.trim().length > 0)

	if (urls.length === 0) {
		writeError(
			'Usage: bun --bun tsx scripts/add-problems/index.ts <url-1> <url-2> ...',
		)
		return
	}

	const usedSlugs = await collectExistingSlugs()

	for (const url of urls) {
		const problem = await generateProblem(url, usedSlugs)
		await writeProblemFiles(problem)
		writeLine(
			`Created markdown files for ${problem.title} (${problem.slug})`,
		)
	}

	writeLine('\nNext steps:')
	writeLine('- Fill in the frontmatter fields (title, category, difficulty, estimatedTime, hint, source).')
	writeLine('- Review the generated markdown files under src/data/problems/.')
	writeLine('- Replace the solution placeholder with the actual walkthrough.')
	writeLine('- Add each new problem entry to src/lib/problems.ts manually.')
	writeLine('- Run bun --bun run lint before committing.')
}

main().catch((error) => {
	writeError(`Error: ${(error as Error).message}`)
	process.exitCode = 1
})
