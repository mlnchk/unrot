'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import { ChevronLeft, PanelRightOpen, Settings } from 'lucide-react'
import { type FormEvent, useCallback, useState } from 'react'
import {
	Conversation,
	ConversationContent,
	ConversationScrollButton,
} from '@/components/ai-elements/conversation'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { cn } from '@/lib/utils'

type MockChatMessage = {
	id: string
	role: 'user' | 'assistant'
	content: string
}

const mockProblem = {
	title: 'Labyrinth Cipher',
	category: 'Logic Puzzle',
	difficulty: 'Challenging',
	estimatedTime: '15 minutes',
	tags: ['Pattern recognition', 'Deduction', 'Word play'],
	description: [
		{
			id: 'labyrinth-overview',
			text: 'An eccentric architect has hidden a treasure deep within a modular labyrinth. Each chamber in the maze is labeled with a fragment of a quotation. The fragments shift position every minute following a predictable but puzzling cadence.',
		},
		{
			id: 'vault-requirements',
			text: 'To unlock the vault, you must determine the original quotation, the author, and the order in which the chambers must be visited. Every wrong attempt causes the maze to reconfigure, making brute force attempts futile.',
		},
		{
			id: 'journal-notes',
			text: 'Fortunately, the architect left behind a cryptic field journal with notes on symmetry, prime intervals, and a curious reference to "listening for silent letters."',
		},
	],
	hint: 'Look for alternating palindromes across the chamber numbers before decoding the letters.',
	solution: [
		{
			id: 'solution-mapping',
			text: 'Start by mapping the chamber numbers to prime indices. The palindromic structure reveals that every second fragment should be read in reverse.',
		},
		{
			id: 'solution-quote',
			text: 'Concatenating the adjusted fragments yields the quote "Silence is a true friend who never betrays" by Confucius. The correct path spells the word FRIEND, guiding the traversal order.',
		},
		{
			id: 'solution-path',
			text: 'Entering the chambers in the FRIEND sequence disengages the vault lock without triggering a rearrangement.',
		},
	],
}

const mockMessages: MockChatMessage[] = [
	{
		id: '1',
		role: 'user',
		content: 'Is it even possible to solve this puzzle on a timer?',
	},
	{
		id: '2',
		role: 'assistant',
		content:
			'Absolutely. The cadence hint narrows the space dramatically - focus on how the fragments mirror each other.',
	},
	{
		id: '3',
		role: 'user',
		content: 'Do I need any extra data beyond the journal notes?',
	},
	{
		id: '4',
		role: 'assistant',
		content:
			'No additional data required. Try grouping the fragments by the silent letters the journal mentions.',
	},
]

type ProblemNavigationItem = {
	id: string
	title: string
}

const problemNavigation: ProblemNavigationItem[] = [
	{
		id: 'labyrinth-cipher',
		title: 'Labyrinth Cipher',
	},
	{
		id: 'aurora-lock',
		title: 'Aurora Lock',
	},
	{
		id: 'glyph-garden',
		title: 'Glyph Garden',
	},
	{
		id: 'echo-bridge',
		title: 'Echo Bridge',
	},
]

type ProblemSidebarProps = {
	activeProblemId: string
	className?: string
}

function ProblemSidebar({ activeProblemId, className }: ProblemSidebarProps) {
	const { open, toggleOpen } = useSidebar()

	const hasMatch = problemNavigation.some(
		(problem) => problem.id === activeProblemId,
	)
	const resolvedActiveId = hasMatch
		? activeProblemId
		: (problemNavigation[0]?.id ?? activeProblemId)

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
										{problemNavigation.map((problem) => {
											const isActive = problem.id === resolvedActiveId
											return (
												<SidebarMenuItem key={problem.id}>
													<SidebarMenuButton asChild isActive={isActive}>
														<Link
															className='flex w-full items-center justify-between gap-3'
															params={{ problemId: problem.id }}
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
})

function ProblemDetailPage() {
	const { problemId } = Route.useParams()
	const [isSolutionOpen, setIsSolutionOpen] = useState(false)
	const activeProblemId =
		problemId ?? problemNavigation[0]?.id ?? 'labyrinth-cipher'

	const handlePromptSubmit = useCallback(
		(_message: PromptInputMessage, _event: FormEvent<HTMLFormElement>) => {
			// integrate AI request handling here
		},
		[],
	)

	return (
		<SidebarProvider defaultOpen={false}>
			<div className='min-h-screen w-full bg-muted/30 py-6'>
				<div className='grid min-h-[calc(100vh-3rem)] w-full grid-cols-1 gap-4 px-6 md:auto-rows-fr md:grid-cols-[auto_minmax(0,1.15fr)_minmax(0,1fr)]'>
					<ProblemSidebar activeProblemId={activeProblemId} />
					<section className='flex h-full flex-col rounded-lg border border-border/60 bg-background shadow-md'>
						<div className='flex flex-wrap items-start justify-between gap-4 border-border/60 border-b px-6 py-5'>
							<div>
								<h1 className='font-semibold text-2xl text-foreground sm:text-3xl'>
									{mockProblem.title}
								</h1>
								<p className='mt-2 text-muted-foreground text-sm sm:text-base'>
									A mind-bending {mockProblem.category.toLowerCase()} to warm up
									your neurons.
								</p>
							</div>
							<div className='flex flex-col items-end gap-2 text-right'>
								<Badge variant='secondary'>{mockProblem.difficulty}</Badge>
								<Badge variant='outline'>
									Estimate: {mockProblem.estimatedTime}
								</Badge>
							</div>
						</div>
						<ScrollArea className='flex-1 rounded-b-lg border-border/20 border-t'>
							<div className='space-y-8 px-6 py-6'>
								<div className='space-y-3'>
									<h2 className='font-semibold text-foreground text-lg'>
										Problem statement
									</h2>
									<div className='space-y-4 text-muted-foreground leading-relaxed'>
										{mockProblem.description.map((paragraph) => (
											<p key={paragraph.id}>{paragraph.text}</p>
										))}
									</div>
								</div>
								<div className='space-y-3'>
									<h3 className='font-medium text-muted-foreground text-sm uppercase tracking-wide'>
										Tags
									</h3>
									<div className='flex flex-wrap gap-2'>
										{mockProblem.tags.map((tag) => (
											<Badge key={tag} variant='outline'>
												{tag}
											</Badge>
										))}
									</div>
								</div>
								<div className='bg-muted/40 px-5 py-4'>
									<p className='font-medium text-muted-foreground text-sm uppercase'>
										Hint
									</p>
									<p className='mt-2 text-foreground'>{mockProblem.hint}</p>
								</div>
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
									<CollapsibleContent className='mt-4 space-y-3 border border-dashed px-5 py-4 text-muted-foreground'>
										{mockProblem.solution.map((step) => (
											<p key={step.id}>{step.text}</p>
										))}
									</CollapsibleContent>
								</Collapsible>
							</div>
						</ScrollArea>
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
						<div className='flex flex-1 flex-col'>
							<Conversation className='flex-1 bg-muted/20'>
								<ConversationContent className='flex flex-col gap-4'>
									{mockMessages.map((message) => (
										<Message from={message.role} key={message.id}>
											<MessageAvatar
												name={message.role === 'user' ? 'You' : 'AI'}
												src='https://avatar.vercel.sh/placeholder'
											/>
											<MessageContent>
												<p>{message.content}</p>
											</MessageContent>
										</Message>
									))}
								</ConversationContent>
								<ConversationScrollButton aria-label='Scroll to latest message' />
							</Conversation>
							<PromptInput onSubmit={handlePromptSubmit}>
								<PromptInputBody>
									<PromptInputTextarea placeholder='Type a follow-up or drop a hint request...' />
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
