import { useChat } from '@ai-sdk/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { type ChatStatus, DefaultChatTransport, type UIMessage } from 'ai'
import { TrashIcon } from 'lucide-react'
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
	PromptInputBody,
	PromptInputButton,
	type PromptInputMessage,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputToolbar,
} from '@/components/ai-elements/prompt-input'
import { Response as UIResponse } from '@/components/ai-elements/response'
import { MARK_PROBLEM_COMPLETED_TOOL_NAME } from '@/lib/ai'
import { clearChatHistory, getChatHistory, saveChatHistory } from '@/lib/chat'
import { useMarkProblemCompletedMutation } from '@/lib/problem-completion'

type Props = {
	problemId: string
}

export function Chat({ problemId }: Props) {
	const [input, setInput] = useState('')
	const markProblemCompletedMutation = useMarkProblemCompletedMutation()

	const handleMarkProblemCompleted = useCallback(
		async () => markProblemCompletedMutation.mutateAsync(problemId),
		[markProblemCompletedMutation, problemId],
	)

	const { data: initialMessages, refetch: refetchChatHistory } =
		useSuspenseQuery({
			queryKey: ['chat', problemId],
			queryFn: () => getChatHistory(problemId),
		})

	const { status, messages, error, sendMessage, setMessages } = useChat({
		messages: initialMessages,
		transport: new DefaultChatTransport({
			// FIXME: use static url
			api: `/problems/${problemId}`,
		}),
		onToolCall: ({ toolCall }) => {
			switch (toolCall.toolName) {
				case MARK_PROBLEM_COMPLETED_TOOL_NAME:
					handleMarkProblemCompleted()

					return
				default:
					return
			}
		},
		onFinish: ({ messages: newMessages }) => {
			saveChatHistory(problemId, newMessages)
		},
	})

	const handleClearChatHistory = useCallback(() => {
		clearChatHistory(problemId)
		refetchChatHistory()
		setMessages([])
	}, [problemId, refetchChatHistory, setMessages])

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
		<div className='flex flex-1 flex-col overflow-hidden'>
			<ChatContent messages={messages} status={status} />

			<PromptInput onSubmit={handlePromptSubmit}>
				<PromptInputBody>
					<PromptInputTextarea
						onChange={(e) => setInput(e.target.value)}
						placeholder='Type a follow-up or drop a hint request...'
						value={input}
					/>
				</PromptInputBody>
				<PromptInputToolbar className='gap-3'>
					<PromptInputButton onClick={handleClearChatHistory}>
						<TrashIcon aria-label='Clear chat history' size={16} />
					</PromptInputButton>

					{error && (
						<div className='flex-1 truncate text-left text-red-500 text-sm'>
							{error.message}
						</div>
					)}
					<PromptInputSubmit aria-label='Send message' status={status} />
				</PromptInputToolbar>
			</PromptInput>
		</div>
	)
}

export function ChatContent({
	messages,
	status,
}: {
	messages: UIMessage[]
	status: ChatStatus
}) {
	return (
		<Conversation>
			<ConversationContent>
				{messages.map(({ id, role, parts }) => (
					<Message from={role} key={id}>
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
									case `tool-${MARK_PROBLEM_COMPLETED_TOOL_NAME}`:
										return (
											<UIResponse
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={`${role}-${i}`}
											>
												🎉 You did it! Problem marked as completed
											</UIResponse>
										)
									default:
										return null
								}
							})}
						</MessageContent>

						<MessageAvatar
							name={role === 'user' ? 'You' : 'AI'}
							src='https://avatar.vercel.sh/placeholder'
						/>
					</Message>
				))}
				{status === 'submitted' && <Loader />}
			</ConversationContent>
			<ConversationScrollButton aria-label='Scroll to latest message' />
		</Conversation>
	)
}

export function ChatLoader() {
	return (
		<div className='flex flex-1 items-center justify-center'>
			<Loader />
		</div>
	)
}
