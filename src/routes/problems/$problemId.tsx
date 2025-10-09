import { google } from '@ai-sdk/google'
import { useChat } from '@ai-sdk/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
	convertToModelMessages,
	DefaultChatTransport,
	streamText,
	validateUIMessages,
} from 'ai'
import { ChevronLeft, PanelRightOpen, Settings } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import {
	Message,
	MessageAvatar,
	MessageContent,
} from '@/components/ai-elements/message'
import {
	PromptInput,
	PromptInputActionMenu,
	PromptInputActionMenuContent,
	PromptInputActionMenuItem,
	PromptInputActionMenuTrigger,
	PromptInputBody,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
	PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Response as UIResponse } from '@/components/ai-elements/response'
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
import type { Problem, ProblemSolution } from '@/lib/types/problem'
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
	const [isSolutionOpen, setIsSolutionOpen] = useState(false)
	const [problem, setProblem] = useState<Problem | null>(null)
	const [solution, setSolution] = useState<ProblemSolution | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [input, setInput] = useState('')

	const { status, messages, sendMessage } = useChat({
		transport: new DefaultChatTransport({
			// FIXME: replace with Route.url or something
			api: `/problems/${problemId}`,
		}),
	})
	// Load current problem and solution
	useEffect(() => {
		const loadProblem = async () => {
			setIsLoading(true)
			const slug = problemId ?? problems[0]?.slug ?? 'labyrinth-cipher'

			const [loadedProblem, loadedSolution] = await Promise.all([
				getProblemBySlug(slug),
				getSolutionBySlug(slug),
			])

			setProblem(loadedProblem)
			setSolution(loadedSolution)
			setIsLoading(false)
		}

		if (problemId || problems.length > 0) {
			loadProblem()
		}
	}, [problemId, problems])

	const handlePromptSubmit = useCallback(
		(message: PromptInputMessage) => {
			const { text } = message

			if (!text) {
				return
			}

			sendMessage({ text })
			setInput('')

			// Future AI integration point
			// When implementing AI chat:
			// 1. Import buildProblemContext from '@/lib/ai-context'
			// 2. Use it to prepare the problem context:
			//    const context = buildProblemContext(problem, solution);
			// 3. Pass context.systemPrompt and context.problemData to AI SDK
		},
		[problem, solution],
	)

	const activeProblemId = problemId ?? problems[0]?.slug ?? 'labyrinth-cipher'

	if (isLoading || !problem) {
		return (
			<SidebarProvider defaultOpen={false}>
				<div className='h-screen w-full bg-muted/30 py-6'>
					<div className='flex h-full items-center justify-center'>
						<p className='text-muted-foreground'>Loading problem...</p>
					</div>
				</div>
			</SidebarProvider>
		)
	}

	return (
		<SidebarProvider defaultOpen={false}>
			<div className='h-screen w-full bg-muted/30 py-6'>
				<div className='grid h-full w-full grid-cols-1 gap-4 px-6 md:auto-rows-fr md:grid-cols-[auto_minmax(0,1.15fr)_minmax(0,1fr)]'>
					<ProblemSidebar activeProblemId={activeProblemId} />
					<section className='flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-background shadow-md'>
						<div className='flex flex-wrap items-start justify-between gap-4 border-border/60 border-b px-6 py-5'>
							<div>
								<h1 className='font-semibold text-2xl text-foreground sm:text-3xl'>
									{problem.metadata.title}
								</h1>
								<p className='mt-2 text-muted-foreground text-sm sm:text-base'>
									A mind-bending {problem.metadata.category.toLowerCase()} to
									warm up your neurons.
								</p>
							</div>
							<div className='flex flex-col items-end gap-2 text-right'>
								<Badge variant='secondary'>{problem.metadata.difficulty}</Badge>
								<Badge variant='outline'>
									Estimate: {problem.metadata.estimatedTime}
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
										<CollapsibleContent className='prose prose-sm mt-4 border border-dashed px-5 py-4 text-muted-foreground'>
											<Markdown>{solution.content}</Markdown>
										</CollapsibleContent>
									</Collapsible>
								)}
							</div>
						</div>
					</section>

					<aside className='flex min-h-[32rem] flex-col rounded-lg border border-border/60 bg-background shadow-md'>
						<header className='border-border/60 border-b px-6 py-5'>
							<h2 className='font-semibold text-foreground text-xl'>
								AI workspace
							</h2>
							<p className='mt-1 text-muted-foreground text-sm'>
								Draft hypotheses, ask clarifying questions, and iterate with
								your copilot.
							</p>
						</header>
						<div className='flex flex-1 flex-col overflow-y-auto'>
							<Conversation className='flex-1 bg-muted/20'>
								<ConversationContent className='flex flex-col gap-4'>
									{messages.map(({ id, role, parts }) => (
										<Message from={role} key={id}>
											<MessageAvatar
												name={role === 'user' ? 'You' : 'AI'}
												src='https://avatar.vercel.sh/placeholder'
											/>
											<MessageContent>
												{parts.map((part, i) => {
													switch (part.type) {
														case 'text':
															return (
																<UIResponse
																	// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
																	key={`${role}-${i}`}
																>
																	{part.text}
																</UIResponse>
															)
														default:
															return null
													}
												})}
											</MessageContent>
										</Message>
									))}
									{status === 'submitted' && <Loader />}
								</ConversationContent>
								<ConversationScrollButton aria-label='Scroll to latest message' />
							</Conversation>
							<PromptInput onSubmit={handlePromptSubmit}>
								<PromptInputBody>
									<PromptInputTextarea
										onChange={(e) => setInput(e.target.value)}
										placeholder='Type a follow-up or drop a hint request...'
										value={input}
									/>
								</PromptInputBody>
								<PromptInputToolbar>
									<PromptInputTools>
										<PromptInputActionMenu>
											<PromptInputActionMenuTrigger aria-label='Open quick actions' />
											<PromptInputActionMenuContent>
												<PromptInputActionMenuItem>
													Suggest a strategy
												</PromptInputActionMenuItem>
												<PromptInputActionMenuItem>
													Spot a contradiction
												</PromptInputActionMenuItem>
												<PromptInputActionMenuItem>
													Summarize transcripts
												</PromptInputActionMenuItem>
											</PromptInputActionMenuContent>
										</PromptInputActionMenu>
									</PromptInputTools>
									<PromptInputSubmit aria-label='Send message' />
								</PromptInputToolbar>
							</PromptInput>
						</div>
					</aside>
				</div>
			</div>
		</SidebarProvider>
	)
}
