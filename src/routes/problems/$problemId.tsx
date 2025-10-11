import { google } from '@ai-sdk/google'
import {
	ClientOnly,
	createFileRoute,
	Link,
	notFound,
} from '@tanstack/react-router'
import { convertToModelMessages, streamText, validateUIMessages } from 'ai'
import { ChevronLeft, PanelRightOpen, Settings } from 'lucide-react'
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
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	useSidebar,
} from '@/components/ui/sidebar'
import { buildProblemContext } from '@/lib/ai'
import { getProblemBySlug, getSolutionBySlug, problems } from '@/lib/problems'
import { cn } from '@/lib/utils'

type ProblemSidebarProps = {
	activeProblemId: string
	className?: string
}

function ProblemSidebar({ activeProblemId, className }: ProblemSidebarProps) {
	const { open, toggleOpen } = useSidebar()

	const hasMatch = problems.some((problem) => problem.slug === activeProblemId)
	const resolvedActiveId = hasMatch
		? activeProblemId
		: (problems[0]?.slug ?? activeProblemId)

	return (
		<Sidebar
			className={cn(
				'hidden h-full min-h-[32rem] flex-shrink-0 self-stretch rounded-lg border border-border/60 bg-background shadow-md md:flex',
				className,
			)}
			collapsedWidth={64}
			expandedWidth={312}
		>
			<div className='flex h-full flex-1 flex-col'>
				{open ? (
					<>
						<SidebarHeader className='border-border/60 border-b px-4 py-4'>
							<div className='space-y-0.5'>
								<p className='font-semibold text-foreground text-sm'>
									Select a puzzle
								</p>
							</div>
							<Button
								aria-label='Collapse problem sidebar'
								onClick={toggleOpen}
								size='icon'
								type='button'
								variant='ghost'
							>
								<ChevronLeft aria-hidden='true' className='size-4' />
							</Button>
						</SidebarHeader>
						<SidebarContent className='flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4'>
							<div>
								<SidebarGroupContent>
									<SidebarMenu>
										{problems.map((problem) => {
											const isActive = problem.slug === resolvedActiveId
											return (
												<SidebarMenuItem key={problem.slug}>
													<SidebarMenuButton asChild isActive={isActive}>
														<Link
															className='flex w-full items-center justify-between gap-3'
															params={{ problemId: problem.slug }}
															to='/problems/$problemId'
														>
															<span className='font-medium text-foreground text-sm'>
																{problem.title}
															</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											)
										})}
									</SidebarMenu>
								</SidebarGroupContent>
							</div>
						</SidebarContent>
						<SidebarFooter className='border-border/60 border-t px-4 py-3'>
							<Button
								aria-label='Open user settings'
								className='flex w-full items-center justify-between px-3 py-2 text-muted-foreground text-sm'
								size='sm'
								type='button'
								variant='ghost'
							>
								<span>Settings</span>
								<Settings aria-hidden='true' className='size-4' />
							</Button>
						</SidebarFooter>
					</>
				) : (
					<CollapsedSidebarRail onExpand={toggleOpen} />
				)}
			</div>
		</Sidebar>
	)
}

type CollapsedSidebarRailProps = {
	onExpand: () => void
}

function CollapsedSidebarRail({ onExpand }: CollapsedSidebarRailProps) {
	return (
		<div className='flex h-full flex-1 flex-col items-center justify-between py-4'>
			<Button
				aria-label='Expand problem sidebar'
				className='rounded-full border border-transparent'
				onClick={onExpand}
				size='icon'
				type='button'
				variant='ghost'
			>
				<PanelRightOpen aria-hidden='true' className='size-4' />
			</Button>

			<div className='grow' />

			<Button
				aria-label='Open user settings'
				className='rounded-full border border-transparent'
				size='icon'
				type='button'
				variant='ghost'
			>
				<Settings aria-hidden='true' className='size-4' />
			</Button>
		</div>
	)
}

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

				const context = buildProblemContext(problem, solution)

				const result = streamText({
					model: google('gemini-2.5-flash-lite'),
					messages: modelMessages,
					system: context.systemPrompt,
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
		<SidebarProvider defaultOpen={false}>
			<div className='h-screen w-full bg-muted/30 py-6'>
				<div className='grid h-full w-full grid-cols-1 gap-4 px-6 md:auto-rows-fr md:grid-cols-[auto_minmax(0,1.15fr)_minmax(0,1fr)]'>
					<ProblemSidebar activeProblemId={problemId} />
					<section className='flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-background shadow-md'>
						<div className='flex flex-wrap items-center justify-between gap-4 border-border/60 border-b px-6 py-5'>
							<div>
								<h1 className='font-semibold text-3xl text-foreground'>
									{problem.metadata.title}
								</h1>
							</div>
							<div className='flex items-center gap-2 text-right'>
								<Badge variant='secondary'>{problem.metadata.difficulty}</Badge>
								<Badge variant='outline'>
									{problem.metadata.estimatedTime}
								</Badge>
							</div>
						</div>
						<div className='flex-1 overflow-y-auto rounded-b-lg border-border/20 border-t'>
							<div className='space-y-8 px-6 py-6'>
								<div className='space-y-3'>
									<div className='prose prose-sm text-muted-foreground leading-relaxed'>
										<Markdown>{problem.content}</Markdown>
									</div>
								</div>
								<div className='bg-muted/40 px-5 py-4'>
									<p className='font-medium text-muted-foreground text-sm uppercase'>
										Hint
									</p>
									<p className='mt-2 text-foreground'>
										{problem.metadata.hint}
									</p>
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
											<div className='prose prose-sm'>
												<Markdown>{solution.content}</Markdown>
											</div>
										</CollapsibleContent>
									</Collapsible>
								)}
							</div>
						</div>
					</section>

					<aside className='flex min-h-[32rem] flex-col rounded-lg border border-border/60 bg-background shadow-md'>
						<ClientOnly fallback={null}>
							<Suspense
								fallback={
									<div className='flex flex-1 items-center justify-center'>
										<Loader />
									</div>
								}
							>
								<Chat problemId={problemId} />
							</Suspense>
						</ClientOnly>
					</aside>
				</div>
			</div>
		</SidebarProvider>
	)
}
