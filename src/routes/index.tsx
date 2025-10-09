import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Brain, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { problems } from '@/lib/problems'

export const Route = createFileRoute('/')({
	component: App,
})

function App() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<section className='relative overflow-hidden px-6 py-20 text-center'>
				<div className='absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10' />
				<div className='relative mx-auto max-w-5xl'>
					<div className='mb-6 flex items-center justify-center gap-4'>
						<Brain aria-hidden='true' className='size-16 text-cyan-400' />
						<h1 className='font-bold text-6xl text-white md:text-7xl'>
							<span className='bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
								Riddles
							</span>
						</h1>
						<Sparkles aria-hidden='true' className='size-12 text-purple-400' />
					</div>
					<p className='mb-4 font-light text-2xl text-gray-300 md:text-3xl'>
						Challenge your mind with brain teasers and logic puzzles
					</p>
					<p className='mx-auto mb-8 max-w-3xl text-gray-400 text-lg'>
						Solve intriguing puzzles with the help of AI. Each problem comes
						with an interactive chat workspace where you can explore ideas, get
						hints, and work through solutions step by step.
					</p>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-6 py-16'>
				<h2 className='mb-8 font-semibold text-3xl text-white'>
					Available Puzzles
				</h2>

				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{problems.map((problem) => (
						<Link
							className='group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 p-6 shadow-lg transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/20'
							key={problem.slug}
							params={{ problemId: problem.slug }}
							to='/problems/$problemId'
						>
							<div className='mb-4 flex items-start justify-between'>
								<h3 className='font-semibold text-white text-xl group-hover:text-cyan-400'>
									{problem.title}
								</h3>
								<ArrowRight
									aria-hidden='true'
									className='size-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400'
								/>
							</div>

							<p className='mb-4 text-gray-400 text-sm'>{problem.category}</p>

							<Badge className='bg-slate-700' variant='secondary'>
								{problem.difficulty}
							</Badge>
						</Link>
					))}
				</div>

				{problems.length === 0 && (
					<div className='rounded-lg border border-slate-700 border-dashed px-6 py-12 text-center'>
						<p className='text-gray-400'>
							No puzzles available yet. Check back soon!
						</p>
					</div>
				)}

				<div className='mt-12 text-center'>
					<Button asChild size='lg' variant='outline'>
						<Link
							params={{ problemId: problems[0]?.slug ?? 'labyrinth-cipher' }}
							to='/problems/$problemId'
						>
							Start Solving
						</Link>
					</Button>
				</div>
			</section>
		</div>
	)
}
