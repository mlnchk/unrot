import type { Problem, ProblemListItem, ProblemSolution } from './types/problem'

// Regex for parsing frontmatter (defined at top level for performance)
const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/

// Parse frontmatter and content from markdown string
function parseFrontmatter(markdown: string): {
	metadata: Record<string, unknown>
	content: string
} {
	const match = markdown.match(frontmatterRegex)

	if (!match) {
		return { metadata: {}, content: markdown }
	}

	const [, frontmatterStr, content] = match
	const metadata: Record<string, unknown> = {}

	// Parse YAML-like frontmatter
	const lines = frontmatterStr.split('\n')
	for (const line of lines) {
		const colonIndex = line.indexOf(':')
		if (colonIndex === -1) {
			continue
		}

		const key = line.slice(0, colonIndex).trim()
		let value: string | string[] = line.slice(colonIndex + 1).trim()

		// Remove quotes
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1)
		}

		// Parse arrays
		if (value.startsWith('[') && value.endsWith(']')) {
			const arrayContent = value.slice(1, -1)
			value = arrayContent
				.split(',')
				.map((item) => {
					const trimmed = item.trim()
					// Remove quotes from array items
					if (
						(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
						(trimmed.startsWith("'") && trimmed.endsWith("'"))
					) {
						return trimmed.slice(1, -1)
					}
					return trimmed
				})
				.filter((item) => item.length > 0)
		}

		metadata[key] = value
	}

	return { metadata, content: content.trim() }
}

// Load all problem markdown files
const problemFiles = import.meta.glob<string>('/src/data/problems/*.md', {
	query: '?raw',
	import: 'default',
})

// Get all problems for navigation
export async function getAllProblems(): Promise<ProblemListItem[]> {
	const problems: ProblemListItem[] = []

	for (const [path, loader] of Object.entries(problemFiles)) {
		// Skip solution files
		if (path.includes('.solution.md')) {
			continue
		}

		const markdown = await loader()
		const { metadata } = parseFrontmatter(markdown)

		// Extract slug from filename
		const filename = path.split('/').at(-1) ?? ''
		const slug = filename.replace('.md', '')

		problems.push({
			slug,
			title: (metadata.title as string) ?? slug,
			category: (metadata.category as string) ?? '',
			difficulty: (metadata.difficulty as string) ?? '',
		})
	}

	return problems
}

// Get a single problem by slug
export async function getProblemBySlug(slug: string): Promise<Problem | null> {
	const path = `/src/data/problems/${slug}.md`
	const loader = problemFiles[path]

	if (!loader) {
		return null
	}

	const markdown = await loader()
	const { metadata, content } = parseFrontmatter(markdown)

	return {
		slug,
		metadata: {
			title: (metadata.title as string) ?? '',
			category: (metadata.category as string) ?? '',
			difficulty: (metadata.difficulty as string) ?? '',
			estimatedTime: (metadata.estimatedTime as string) ?? '',
			hint: (metadata.hint as string) ?? '',
			source: (metadata.source as string) ?? undefined,
		},
		content,
	}
}

// Get solution by slug
export async function getSolutionBySlug(
	slug: string,
): Promise<ProblemSolution | null> {
	const path = `/src/data/problems/${slug}.solution.md`
	const solutionFiles = import.meta.glob<string>(
		'/src/data/problems/*.solution.md',
		{
			query: '?raw',
			import: 'default',
		},
	)

	const loader = solutionFiles[path]

	if (!loader) {
		return null
	}

	const markdown = await loader()
	const { content } = parseFrontmatter(markdown)

	return {
		slug,
		content,
	}
}
