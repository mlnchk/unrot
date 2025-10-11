import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { problems } from '@/lib/problems'

export const Route = createFileRoute('/')({
	beforeLoad: () => {
		const firstProblem = problems[0]

		if (!firstProblem) {
			throw notFound()
		}

		throw redirect({
			to: '/problems/$problemId',
			params: { problemId: firstProblem.slug },
		})
	},
})
