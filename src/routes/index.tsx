import { createFileRoute, Link } from '@tanstack/react-router'
import type { UIMessage } from 'ai'
import { ChatContent } from '@/components/chat'
import { Button } from '@/components/ui/button'
import { problems } from '@/lib/problems'

export const Route = createFileRoute('/')({
	component: IndexPage,
})

const INTRO = [
	'hi, welcome to unrot',
	'i made this as a fun way to solve logic problems with my girlfriend',
	'then i way overengineered it',
	"it's simple — problem on the left, ai chat on the right. ask questions, and it marks the problem done when you solve it.",
	'problems are from suresolv.com. more coming soon',
	"everything stored in your browser. ai runs on cloud though, so if it breaks, i'm probably broke",
]

const INTRO_MESSAGES: UIMessage[] = INTRO.map((message, index) => ({
	id: index.toString(),
	role: 'assistant',
	parts: [
		{
			type: 'text',
			text: message,
		},
	],
}))

function IndexPage() {
	return (
		<div className='mx-auto h-dvh w-full max-w-[120rem] bg-sidebar md:p-8'>
			<main className='mx-auto flex h-full max-w-2xl flex-col overflow-hidden border border-border bg-muted md:bg-card'>
				<ChatContent messages={INTRO_MESSAGES} status='ready' />

				<div className='flex justify-center p-4'>
					<Link
						className='w-full'
						params={{ problemId: problems[0]?.slug ?? '' }}
						to='/problems/$problemId'
					>
						<Button
							className='h-auto w-full p-3 text-2xl'
							size='lg'
							type='button'
						>
							go solve something
						</Button>
					</Link>
				</div>
			</main>
		</div>
	)
}
