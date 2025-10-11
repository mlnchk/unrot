import { getRouteApi } from '@tanstack/react-router'
import { useCallback } from 'react'
import { z } from 'zod'

const routeApi = getRouteApi('/problems/$problemId')

export const selectedPaneSchema = z.enum(['problem', 'chat']).default('problem')

type SelectedPane = z.infer<typeof selectedPaneSchema>

export function useSelectedPane() {
	const { pane } = routeApi.useSearch()
	const navigate = routeApi.useNavigate()

	const setPane = useCallback(
		(newPane: SelectedPane) => {
			navigate({ search: { pane: newPane } })
		},
		[navigate],
	)

	return { pane, setPane }
}
