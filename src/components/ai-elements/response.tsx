import { memo } from 'react'
import Markdown from 'react-markdown'
import { cn } from '@/lib/utils'

export const Response = memo(
	({
		className,
		children,
		...props
	}: React.ComponentProps<'div'> & { children: string }) => (
		<div
			className={cn(
				'prose size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
				className,
			)}
			style={{
				// override prose css variables to the parent's body
				// @ts-expect-error
				'--tw-prose-body': 'inherit',
				'--tw-prose-counters': 'inherit',
				'--tw-prose-headings': 'inherit',
				'--tw-prose-lead': 'inherit',
				'--tw-prose-links': 'inherit',
				'--tw-prose-bold': 'inherit',
				'--tw-prose-italic': 'inherit',
				'--tw-prose-underline': 'inherit',
				'--tw-prose-strike': 'inherit',
			}}
			{...props}
		>
			<Markdown>{children}</Markdown>
		</div>
	),
	(prevProps, nextProps) => prevProps.children === nextProps.children,
)

Response.displayName = 'Response'

// Streamdown adds a lot to bundle size: https://github.com/vercel/streamdown/issues/157

// 'use client'

// import { type ComponentProps, memo } from 'react'
// import { Streamdown } from 'streamdown'
// import { cn } from '@/lib/utils'

// type ResponseProps = ComponentProps<typeof Streamdown>

// export const Response = memo(
// 	({ className, ...props }: ResponseProps) => (
// 		<Streamdown
// 			className={cn(
// 				'size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
// 				className,
// 			)}
// 			{...props}
// 		/>
// 	),
// 	(prevProps, nextProps) => prevProps.children === nextProps.children,
// )

// Response.displayName = 'Response'
