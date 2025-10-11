import { Link } from '@tanstack/react-router'
import { TableOfContents } from 'lucide-react'
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
import { problems } from '@/lib/problems'
import type { Problem } from '@/lib/types/problem'
import { cn } from '@/lib/utils'

export type MobileView = 'problem' | 'chat'

type Props = {
	problem: Problem
	mobileView: MobileView
	setMobileView: (mobileView: MobileView) => void
	className?: string
}

export function Header({
	problem,
	mobileView,
	setMobileView,
	className,
}: Props) {
	return (
		<div
			className={cn(
				'flex flex-wrap items-center gap-4 border-border/60 border-b px-5 py-4',
				className,
			)}
		>
			<div className='flex min-w-0 flex-1 items-center gap-2'>
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
								<Link params={{ problemId: p.slug }} to='/problems/$problemId'>
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
			<div className='flex items-center gap-2'>
				<div
					aria-label='Select view'
					className='flex items-center gap-1 md:hidden'
					role='group'
				>
					<Button
						aria-controls='problem-pane'
						aria-pressed={mobileView === 'problem'}
						onClick={() => setMobileView('problem')}
						size='sm'
						type='button'
						variant={mobileView === 'problem' ? 'secondary' : 'ghost'}
					>
						Problem
					</Button>
					<Button
						aria-controls='chat-pane'
						aria-pressed={mobileView === 'chat'}
						onClick={() => setMobileView('chat')}
						size='sm'
						type='button'
						variant={mobileView === 'chat' ? 'secondary' : 'ghost'}
					>
						Chat
					</Button>
				</div>
				<div className='hidden items-center gap-2 md:flex'>
					<Badge variant='secondary'>{problem.metadata.difficulty}</Badge>
					<Badge variant='outline'>{problem.metadata.estimatedTime}</Badge>
				</div>
			</div>
		</div>
	)
}
