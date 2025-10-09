export type ProblemMetadata = {
	title: string
	category: string
	difficulty: string
	estimatedTime: string
	hint: string
	source?: string
}

export type ProblemListItem = {
	slug: string
	title: string
	category: string
	difficulty: string
}

export type Problem = {
	slug: string
	metadata: ProblemMetadata
	content: string
}

export type ProblemSolution = {
	slug: string
	content: string
}
