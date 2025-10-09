import { useChat } from '@ai-sdk/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { DefaultChatTransport } from 'ai'
import { useCallback, useState } from 'react'
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
import { getChatHistory, saveChatHistory } from '@/lib/chat'

type Props = {
	problemId: string
}

export function Chat({ problemId }: Props) {
	const [input, setInput] = useState('')

	const { data: initialMessages } = useSuspenseQuery({
		queryKey: ['chat', problemId],
		queryFn: () => getChatHistory(problemId),
	})

	const { status, messages, sendMessage } = useChat({
		messages: initialMessages,
		transport: new DefaultChatTransport({
			// FIXME: use static url
			api: `/problems/${problemId}`,
		}),
		onFinish: ({ messages: newMessages }) => {
			saveChatHistory(problemId, newMessages)
		},
	})

	const handlePromptSubmit = useCallback(
		(message: PromptInputMessage) => {
			const { text } = message

			if (!text) {
				return
			}

			sendMessage({ text })
			setInput('')
		},
		[sendMessage],
	)

	return (
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
	)
}
