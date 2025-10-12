import { ClientOnly, createFileRoute, notFound } from '@tanstack/react-router'
import { convertToModelMessages, streamText, validateUIMessages } from 'ai'
import { Suspense, useState } from 'react'
import Markdown from 'react-markdown'
import { z } from 'zod'
import { Chat, ChatLoader } from '@/components/chat'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { selectedPaneSchema, useSelectedPane } from '@/hooks/use-selected-pane'
import {
	buildProblemSystemPrompt,
	MARK_PROBLEM_COMPLETED_TOOL_NAME,
	markProblemCompletedTool,
	model,
} from '@/lib/ai'
import { getProblemBySlug, getSolutionBySlug } from '@/lib/problems'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/problems/$problemId')({
	component: ProblemDetailPage,

	validateSearch: z.object({
		pane: selectedPaneSchema,
	}),

	loader: async ({ params }) => {
		const { problemId } = params
		const [problem, solution] = await Promise.all([
			getProblemBySlug(problemId),
			getSolutionBySlug(problemId),
		]).catch(() => {
			throw notFound()
		})

		if (!(problem && solution)) {
			throw notFound()
		}

		return {
			problem,
			solution,
		}
	},

	head: ({ loaderData }) => {
		if (!loaderData) {
			return {}
		}

		const title = loaderData.problem.metadata.title

		return {
			meta: [{ title }],
		}
	},

	server: {
		handlers: {
			POST: async ({ request, params }) => {
				const body = await request.json()

				const { problemId } = params
				const [problem, solution] = await Promise.all([
					getProblemBySlug(problemId),
					getSolutionBySlug(problemId),
				])

				if (!(problem && solution)) {
					return Response.json({ error: 'Problem not found' }, { status: 404 })
				}

				const uiMessages = await validateUIMessages({ messages: body.messages })
				const modelMessages = convertToModelMessages(uiMessages)

				const systemPrompt = buildProblemSystemPrompt(problem, solution)

				const result = streamText({
					model,
					messages: modelMessages,
					system: systemPrompt,
					tools: {
						[MARK_PROBLEM_COMPLETED_TOOL_NAME]: markProblemCompletedTool,
					},
				})

				return result.toUIMessageStreamResponse()
			},
		},
	},
})

function ProblemDetailPage() {
	const { problemId } = Route.useParams()
	const { problem, solution } = Route.useLoaderData()
	const [isSolutionOpen, setIsSolutionOpen] = useState(false)
	const { pane } = useSelectedPane()

	return (
		<div className='mx-auto h-dvh w-full max-w-[120rem] bg-sidebar md:p-8'>
			<div className='grid h-full w-full grid-cols-1 gap-8 md:auto-rows-fr md:grid-cols-[5fr_4fr]'>
				<section
					className={cn(
						'flex h-full flex-col overflow-hidden border border-border bg-background',
						pane !== 'problem' && 'max-md:hidden',
					)}
					id='problem-pane'
				>
					<Header problem={problem} />

					<div className='flex-1 overflow-y-auto'>
						<div className='space-y-6 p-4'>
							<img
								alt={problem.metadata.title}
								className='h-auto w-full'
								height={300}
								src={problem.metadata.cover}
								width='auto'
							/>
							<div className='prose max-w-none'>
								<Markdown>{problem.content}</Markdown>
							</div>
							{solution && (
								<Collapsible
									onOpenChange={setIsSolutionOpen}
									open={isSolutionOpen}
								>
									<div className='flex items-center justify-between gap-3 border p-4'>
										<div>
											<p className='font-medium text-foreground'>
												Solution walkthrough
											</p>
											<p className='text-md text-muted-foreground'>
												Reveal step-by-step reasoning
											</p>
										</div>
										<CollapsibleTrigger asChild>
											<Button size='sm' type='button' variant='outline'>
												{isSolutionOpen ? 'Hide' : 'Reveal'}
											</Button>
										</CollapsibleTrigger>
									</div>
									<CollapsibleContent className='mt-4 border border-dashed p-4 text-muted-foreground'>
										<div className='prose max-w-none'>
											<Markdown>{solution.content}</Markdown>
										</div>
									</CollapsibleContent>
								</Collapsible>
							)}
						</div>
					</div>
				</section>

				<aside
					className={cn(
						'flex h-full flex-col overflow-hidden border border-border bg-muted md:bg-card',
						pane !== 'chat' && 'max-md:hidden',
					)}
					id='chat-pane'
				>
					<Header className='md:hidden' problem={problem} />

					<ClientOnly fallback={<ChatLoader />}>
						<Suspense fallback={<ChatLoader />}>
							<Chat key={problemId} problemId={problemId} />
						</Suspense>
					</ClientOnly>
				</aside>
			</div>
		</div>
	)
}
