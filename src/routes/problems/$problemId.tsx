import { ClientOnly, createFileRoute, notFound } from '@tanstack/react-router'
import { convertToModelMessages, streamText, validateUIMessages } from 'ai'
import { Suspense, useState } from 'react'
import Markdown from 'react-markdown'
import { Chat, ChatLoader } from '@/components/chat'
import { Header, type MobileView } from '@/components/header'
import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { buildProblemSystemPrompt, model } from '@/lib/ai'
import { getProblemBySlug, getSolutionBySlug } from '@/lib/problems'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/problems/$problemId')({
	component: ProblemDetailPage,

	loader: async ({ params }) => {
		const { problemId } = params
		const [problem, solution] = await Promise.all([
			getProblemBySlug(problemId),
			getSolutionBySlug(problemId),
		])

		if (!(problem && solution)) {
			throw notFound()
		}

		return {
			problem,
			solution,
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
	const [mobileView, setMobileView] = useState<MobileView>('problem')

	return (
		<div className='h-screen w-full bg-muted/30 md:p-5'>
			<div className='grid h-full w-full grid-cols-1 gap-4 md:auto-rows-fr md:grid-cols-2'>
				<section
					className={cn(
						'flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-background shadow-md',
						mobileView !== 'problem' && 'max-md:hidden',
					)}
					id='problem-pane'
				>
					<Header
						mobileView={mobileView}
						problem={problem}
						setMobileView={setMobileView}
					/>

					<div className='flex-1 overflow-y-auto rounded-b-lg border-border/20 border-t'>
						<div className='space-y-8 px-6 py-6'>
							<div className='space-y-3'>
								<div className='prose max-w-none'>
									<Markdown>{problem.content}</Markdown>
								</div>
							</div>
							<div className='bg-muted/40 px-5 py-4'>
								<p className='font-medium text-md text-muted-foreground uppercase'>
									Hint
								</p>
								<p className='mt-2 text-foreground'>{problem.metadata.hint}</p>
							</div>
							{solution && (
								<Collapsible
									onOpenChange={setIsSolutionOpen}
									open={isSolutionOpen}
								>
									<div className='flex items-center justify-between gap-3 border px-5 py-4'>
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
									<CollapsibleContent className='mt-4 border border-dashed px-5 py-4 text-muted-foreground'>
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
						'flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-background shadow-md',
						mobileView !== 'chat' && 'max-md:hidden',
					)}
					id='chat-pane'
				>
					<Header
						className='md:hidden'
						mobileView={mobileView}
						problem={problem}
						setMobileView={setMobileView}
					/>

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
