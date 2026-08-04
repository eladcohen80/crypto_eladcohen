import {
  GoogleGenerativeAI,
  GenerativeModel,
} from '@google/generative-ai'

const apiKey: string = import.meta.env.VITE_GEMINI_API_KEY ?? ''

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(apiKey)

export const model: GenerativeModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
})

export default genAI