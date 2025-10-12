import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import localforage from 'localforage'

const COMPLETION_STORAGE_KEY = 'completed-problems'
const COMPLETED_PROBLEMS_QUERY_KEY = ['completed-problems'] as const

const getCompletedProblems = async () => {
	const completedProblems = await localforage.getItem(COMPLETION_STORAGE_KEY)
	return (completedProblems ?? []) as string[]
}

const markProblemCompleted = async (problemId: string) => {
	const completedProblems = await getCompletedProblems()
	const nextCompletedProblems = new Set([...completedProblems, problemId])

	return localforage.setItem(
		COMPLETION_STORAGE_KEY,
		Array.from(nextCompletedProblems),
	)
}

export const useCompletedProblemsQuery = () =>
	useQuery({
		queryKey: COMPLETED_PROBLEMS_QUERY_KEY,
		queryFn: getCompletedProblems,
		initialData: [],
	})

export const useMarkProblemCompletedMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: markProblemCompleted,
		onSuccess: (nextCompletedProblems) => {
			queryClient.setQueryData<string[]>(
				COMPLETED_PROBLEMS_QUERY_KEY,
				nextCompletedProblems,
			)
		},
	})
}
