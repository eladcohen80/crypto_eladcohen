export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface GeminiRequestPayload {
  prompt: string
  temperature?: number
  maxOutputTokens?: number
}

export interface GeminiChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
}