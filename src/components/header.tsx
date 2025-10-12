import { DropdownMenuArrow } from '@radix-ui/react-dropdown-menu'
import { Link } from '@tanstack/react-router'
import { ChevronDownIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSelectedPane } from '@/hooks/use-selected-pane'
import { useCompletedProblemsQuery } from '@/lib/problem-completion'
import { problems } from '@/lib/problems'
import type { Problem } from '@/lib/types/problem'
import { cn } from '@/lib/utils'

type Props = {
	problem: Problem
	className?: string
}

export function Header({ problem, className }: Props) {
	const { pane, setPane } = useSelectedPane()
	const isProblemSelected = pane === 'problem'
	const isChatSelected = pane === 'chat'

	const { data: completedProblems } = useCompletedProblemsQuery()

	const isCurrentProblemCompleted = completedProblems.includes(problem.slug)

	return (
		<div
			className={cn(
				'flex select-none flex-wrap items-center border-border border-b bg-background',
				className,
			)}
		>
			<div className='flex min-w-0 flex-1 items-center gap-2'>
				<DropdownMenu>
					<DropdownMenuTrigger className='flex w-full items-center justify-between gap-2 border-r p-4'>
						<h1
							className={cn(
								'truncate font-semibold text-foreground text-xl md:text-3xl',
								isCurrentProblemCompleted &&
									'text-muted-foreground line-through',
							)}
						>
							{problem.metadata.title}
						</h1>
						<ChevronDownIcon aria-hidden='true' className='size-8' />
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align='start'
						className='w-full min-w-64'
						sideOffset={0}
					>
						<DropdownMenuLabel className='-m-1 bg-muted text-lg'>
							All Problems
						</DropdownMenuLabel>
						<DropdownMenuSeparator />

						{problems.map((p) => {
							const isCompleted = completedProblems.includes(p.slug)

							return (
								<DropdownMenuItem
									asChild
									className={cn(
										'text-lg',
										isCompleted &&
											'text-muted-foreground line-through hover:bg-muted hover:text-muted-foreground focus:bg-muted focus:text-muted-foreground',
									)}
									key={p.slug}
								>
									<Link
										activeProps={{
											className: isCompleted
												? 'bg-muted text-muted-foreground'
												: 'bg-accent text-accent-foreground',
										}}
										className='flex w-full items-center justify-between gap-2'
										params={{ problemId: p.slug }}
										to='/problems/$problemId'
									>
										<span>{p.title}</span>
									</Link>
								</DropdownMenuItem>
							)
						})}

						<DropdownMenuSeparator />

						<DropdownMenuItem asChild className='text-lg'>
							<Link to='/'>
								<span>What is it?</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className='flex items-center gap-2 p-4'>
				<div
					aria-label='Select view'
					className='flex items-center gap-1 md:hidden'
					role='group'
				>
					<Button
						aria-controls='problem-pane'
						aria-pressed={isProblemSelected}
						onClick={() => setPane('problem')}
						size='sm'
						type='button'
						variant={isProblemSelected ? 'secondary' : 'ghost'}
					>
						Problem
					</Button>
					<Button
						aria-controls='chat-pane'
						aria-pressed={isChatSelected}
						onClick={() => setPane('chat')}
						size='sm'
						type='button'
						variant={isChatSelected ? 'secondary' : 'ghost'}
					>
						Chat
					</Button>
				</div>
				<div className='hidden items-center gap-2 md:flex'>
					<Badge variant='secondary'>{problem.metadata.difficulty}</Badge>
				</div>
			</div>
		</div>
	)
}
