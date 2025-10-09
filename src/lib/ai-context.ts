import type { Problem, ProblemSolution } from './types/problem'

type ProblemContext = {
	systemPrompt: string
	problemData: {
		title: string
		category: string
		difficulty: string
		estimatedTime: string
		tags: string[]
		hint: string
		content: string
		solution?: string
	}
}

/**
 * Builds context object for AI SDK integration.
 * This prepares the problem data to be passed to AI chat sessions.
 *
 * Usage with AI SDK (future integration):
 * ```
 * const context = buildProblemContext(problem, solution);
 * const response = await generateText({
 *   model: anthropic('claude-sonnet-4'),
 *   system: context.systemPrompt,
 *   messages: [...userMessages],
 * });
 * ```
 */
export function buildProblemContext(
	problem: Problem,
	solution?: ProblemSolution | null,
): ProblemContext {
	const { metadata, content } = problem

	// Build system prompt with problem details
	let systemPrompt = `You are an AI assistant helping a user solve brain teasers and logic puzzles.

Current Problem: "${metadata.title}"
Category: ${metadata.category}
Difficulty: ${metadata.difficulty}
Estimated Time: ${metadata.estimatedTime}

Problem Description:
${content}

Hint: ${metadata.hint}
`

	// Include solution only if provided (useful for hint generation or verification)
	if (solution) {
		systemPrompt += `

Solution (for reference - guide the user without revealing everything):
${solution.content}
`
	}

	systemPrompt += `

Guidelines:
- Help the user think through the problem step by step
- Provide hints without giving away the complete solution
- Ask clarifying questions to understand their thinking
- Encourage creative problem-solving approaches
- Celebrate insights and progress
- If they're completely stuck, offer progressively more specific hints
`

	return {
		systemPrompt,
		problemData: {
			title: metadata.title,
			category: metadata.category,
			difficulty: metadata.difficulty,
			estimatedTime: metadata.estimatedTime,
			tags: metadata.tags,
			hint: metadata.hint,
			content,
			solution: solution?.content,
		},
	}
}
