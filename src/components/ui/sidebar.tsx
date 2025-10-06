import { Slot } from '@radix-ui/react-slot'
import type {
	ButtonHTMLAttributes,
	ComponentPropsWithoutRef,
	CSSProperties,
	HTMLAttributes,
	ReactNode,
	Ref,
} from 'react'
import {
	createContext,
	forwardRef,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

import { cn } from '@/lib/utils'

type SidebarContextValue = {
	open: boolean
	setOpen: (value: boolean) => void
	toggleOpen: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

type SidebarProviderProps = {
	children: ReactNode
	defaultOpen?: boolean
}

export function SidebarProvider({
	children,
	defaultOpen = false,
}: SidebarProviderProps) {
	const [open, setOpen] = useState(defaultOpen)

	const toggleOpen = useCallback(() => {
		setOpen((previous) => !previous)
	}, [])

	const value = useMemo(
		() => ({
			open,
			setOpen,
			toggleOpen,
		}),
		[open, toggleOpen],
	)

	return (
		<SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
	)
}

export function useSidebar() {
	const context = useContext(SidebarContext)

	if (context === null) {
		throw new Error('useSidebar must be used within a SidebarProvider')
	}

	return context
}

type SidebarProps = HTMLAttributes<HTMLElement> & {
	side?: 'left' | 'right'
	collapsedWidth?: number
	expandedWidth?: number
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
	function SidebarComponent(
		{
			className,
			children,
			side = 'left',
			collapsedWidth = 64,
			expandedWidth = 272,
			style,
			...props
		},
		ref,
	) {
		const { open } = useSidebar()
		const width = open ? expandedWidth : collapsedWidth
		const resolvedStyle: CSSProperties = {
			...style,
			width,
		}

		return (
			<aside
				className={cn(
					'group/sidebar relative flex h-full flex-col overflow-hidden border bg-background transition-[width] duration-300 ease-in-out',
					side === 'left' ? 'border-r' : 'border-l',
					className,
				)}
				data-side={side}
				data-state={open ? 'expanded' : 'collapsed'}
				ref={ref}
				style={resolvedStyle}
				{...props}
			>
				{children}
			</aside>
		)
	},
)

export const SidebarContent = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(function SidebarContentComponent({ className, children, ...props }, ref) {
	const { open } = useSidebar()

	return (
		<div
			aria-hidden={!open}
			className={cn(
				'flex-1 overflow-y-auto px-2 py-2 transition-opacity duration-200 ease-linear',
				open ? 'opacity-100' : 'pointer-events-none opacity-0',
				className,
			)}
			data-state={open ? 'expanded' : 'collapsed'}
			ref={ref}
			{...props}
		>
			{children}
		</div>
	)
})

export const SidebarHeader = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(function SidebarHeaderComponent({ className, ...props }, ref) {
	return (
		<div
			className={cn(
				'flex items-center justify-between gap-3 border-b px-4 py-3',
				className,
			)}
			ref={ref}
			{...props}
		/>
	)
})

export const SidebarFooter = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(function SidebarFooterComponent({ className, ...props }, ref) {
	return (
		<div className={cn('border-t px-4 py-3', className)} ref={ref} {...props} />
	)
})

export const SidebarGroup = forwardRef<
	HTMLElement,
	HTMLAttributes<HTMLElement>
>(function SidebarGroupComponent({ className, ...props }, ref) {
	return <nav className={cn('space-y-2', className)} ref={ref} {...props} />
})

export const SidebarGroupLabel = forwardRef<
	HTMLParagraphElement,
	HTMLAttributes<HTMLParagraphElement>
>(function SidebarGroupLabelComponent({ className, ...props }, ref) {
	return (
		<p
			className={cn(
				'font-medium text-muted-foreground text-xs uppercase tracking-wide',
				className,
			)}
			ref={ref}
			{...props}
		/>
	)
})

export const SidebarGroupContent = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(function SidebarGroupContentComponent({ className, ...props }, ref) {
	return <div className={cn('space-y-1', className)} ref={ref} {...props} />
})

export const SidebarMenu = forwardRef<
	HTMLUListElement,
	HTMLAttributes<HTMLUListElement>
>(function SidebarMenuComponent({ className, ...props }, ref) {
	return <ul className={cn('grid gap-1', className)} ref={ref} {...props} />
})

export const SidebarMenuItem = forwardRef<
	HTMLLIElement,
	HTMLAttributes<HTMLLIElement>
>(function SidebarMenuItemComponent({ className, ...props }, ref) {
	return <li className={cn('list-none', className)} ref={ref} {...props} />
})

type SidebarMenuButtonProps = ComponentPropsWithoutRef<typeof Slot> & {
	asChild?: boolean
	isActive?: boolean
}

export const SidebarMenuButton = forwardRef<
	HTMLElement,
	SidebarMenuButtonProps
>(function SidebarMenuButtonComponent(
	{ asChild = false, className, isActive = false, ...props },
	ref,
) {
	const Comp = asChild ? Slot : 'button'
	const { type, ...rest } = props as Record<string, unknown>

	return (
		<Comp
			className={cn(
				'flex w-full items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors',
				isActive
					? 'bg-primary/10 text-primary shadow-xs'
					: 'text-muted-foreground hover:bg-muted hover:text-foreground',
				className,
			)}
			data-state={isActive ? 'active' : 'inactive'}
			ref={ref as Ref<HTMLElement>}
			{...rest}
			{...(asChild ? {} : { type: (type as string | undefined) ?? 'button' })}
		/>
	)
})

export const SidebarSeparator = forwardRef<
	HTMLDivElement,
	HTMLAttributes<HTMLDivElement>
>(function SidebarSeparatorComponent({ className, ...props }, ref) {
	return (
		<div
			className={cn('h-px bg-border', className)}
			ref={ref}
			role='presentation'
			{...props}
		/>
	)
})

type SidebarTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>

export const SidebarTrigger = forwardRef<
	HTMLButtonElement,
	SidebarTriggerProps
>(function SidebarTriggerComponent({ className, onClick, ...props }, ref) {
	const { open, toggleOpen } = useSidebar()

	return (
		<button
			aria-expanded={open}
			aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
			className={cn(
				'inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background font-medium text-sm shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			onClick={(event) => {
				onClick?.(event)
				if (!event.defaultPrevented) {
					toggleOpen()
				}
			}}
			ref={ref}
			type='button'
			{...props}
		>
			<span className='sr-only'>Toggle sidebar</span>
		</button>
	)
})
