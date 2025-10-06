import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: App,
})

function App() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'>
			<section className='relative overflow-hidden px-6 py-20 text-center'>
				<div className='absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10' />
				<div className='relative mx-auto max-w-5xl'>
					<div className='mb-6 flex items-center justify-center gap-6'>
						<h1 className='font-bold text-6xl text-white md:text-7xl'>
							<span className='text-gray-300'>TANSTACK</span>{' '}
							<span className='bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
								START
							</span>
						</h1>
					</div>
					<p className='mb-4 font-light text-2xl text-gray-300 md:text-3xl'>
						The framework for next generation AI applications
					</p>
					<p className='mx-auto mb-8 max-w-3xl text-gray-400 text-lg'>
						Full-stack framework powered by TanStack Router for React and Solid.
						Build modern applications with server functions, streaming, and type
						safety.
					</p>
					<div className='flex flex-col items-center gap-4'>
						<a
							className='rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-white shadow-cyan-500/50 shadow-lg transition-colors hover:bg-cyan-600'
							href='https://tanstack.com/start'
							rel='noopener noreferrer'
							target='_blank'
						>
							Documentation
						</a>
						<p className='mt-2 text-gray-400 text-sm'>
							Begin your TanStack Start journey by editing{' '}
							<code className='rounded bg-slate-700 px-2 py-1 text-cyan-400'>
								/src/routes/index.tsx
							</code>
						</p>
					</div>
				</div>
			</section>

			<section className='mx-auto max-w-7xl px-6 py-16'>
				<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3' />
			</section>
		</div>
	)
}
