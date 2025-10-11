export type ProblemMetadata = {
	title: string
	difficulty: string
	source: string
}

export type ProblemListItem = {
	slug: string
	title: string
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
