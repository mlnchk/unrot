import { safeValidateUIMessages, type UIMessage } from 'ai'
import localforage from 'localforage'

export const saveChatHistory = (problemSlug: string, messages: UIMessage[]) =>
	localforage.setItem(`chat:${problemSlug}`, messages)

export const getChatHistory = async (problemSlug: string) => {
	if (typeof window === 'undefined') {
		return []
	}

	const messages = await localforage.getItem(`chat:${problemSlug}`)

	if (!messages) {
		return []
	}

	const validationResult = await safeValidateUIMessages({ messages })

	if (!validationResult.success) {
		return []
	}

	return validationResult.data
}
