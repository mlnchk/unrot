import {
	ClientOnly,
	createFileRoute,
	Link,
	notFound,
} from '@tanstack/react-router'
import { convertToModelMessages, streamText, validateUIMessages } from 'ai'
import { TableOfContents } from 'lucide-react'
import { Suspense, useState } from 'react'
import Markdown from 'react-markdown'
import { Loader } from '@/components/ai-elements/loader'
import { Chat } from '@/components/chat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buildProblemSystemPrompt, model } from '@/lib/ai'
import { getProblemBySlug, getSolutionBySlug, problems } from '@/lib/problems'

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

	return (
		<div className='h-screen w-full bg-muted/30 py-6'>
			<div className='grid h-full w-full grid-cols-1 gap-4 px-6 md:auto-rows-fr md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]'>
				<section className='flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-background shadow-md'>
					<div className='flex flex-wrap items-center justify-between gap-4 border-border/60 border-b px-5 py-4'>
						<div className='flex items-center gap-2'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										aria-label='Open table of contents'
										size='icon'
										type='button'
										variant='ghost'
									>
										<TableOfContents aria-hidden='true' className='size-4' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align='start'
									className='min-w-64'
									sideOffset={8}
								>
									<DropdownMenuLabel>All Problems</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{problems.map((p) => (
										<DropdownMenuItem asChild key={p.slug}>
											<Link
												params={{ problemId: p.slug }}
												to='/problems/$problemId'
											>
												{p.title}
											</Link>
										</DropdownMenuItem>
									))}
								</DropdownMenuContent>
							</DropdownMenu>
							<h1 className='font-semibold text-3xl text-foreground'>
								{problem.metadata.title}
							</h1>
						</div>
						<div className='flex items-center gap-2 text-right'>
							<Badge variant='secondary'>{problem.metadata.difficulty}</Badge>
							<Badge variant='outline'>{problem.metadata.estimatedTime}</Badge>
						</div>
					</div>
					<div className='flex-1 overflow-y-auto rounded-b-lg border-border/20 border-t'>
						<div className='space-y-8 px-6 py-6'>
							<div className='space-y-3'>
								<div className='prose max-w-none'>
									<Markdown>{problem.content}</Markdown>
								</div>
							</div>
							<div className='bg-muted/40 px-5 py-4'>
								<p className='font-medium text-muted-foreground text-sm uppercase'>
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
											<p className='text-muted-foreground text-sm'>
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

				<aside className='flex flex-col rounded-lg border border-border/60 bg-background shadow-md'>
					<ClientOnly fallback={null}>
						<Suspense
							fallback={
								<div className='flex flex-1 items-center justify-center'>
									<Loader />
								</div>
							}
						>
							<Chat key={problemId} problemId={problemId} />
						</Suspense>
					</ClientOnly>
				</aside>
			</div>
		</div>
	)
}
