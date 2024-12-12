import { Content, GoogleGenerativeAI, ResponseSchema, SchemaType } from '@google/generative-ai'
import { Answer } from 'aws-sdk/clients/kinesisvideosignalingchannels'
import { systemInstruction } from './gemini-chat-system-instruction'

const GEMINI_CHAT_API_KEY = process.env.GEMINI_CHAT_API_KEY || ''

const genAI = new GoogleGenerativeAI(GEMINI_CHAT_API_KEY ?? '')

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction,
})

// Later, pass this schema object into `responseSchema` in the generation config.
const jsonSchema: ResponseSchema = {
    type: SchemaType.OBJECT, // Crucial: Define the root as an object
    properties: {
        // Use "properties" for the fields
        response: { type: SchemaType.STRING },
        data: {
            type: SchemaType.OBJECT, // "data" is also an object
            properties: {
                matchedJob: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            id: {type: SchemaType.STRING},
                        },
                    },
                },
                readyToFind: { type: SchemaType.BOOLEAN },
            },
        },
    },
    required: ['response', 'data'], // If both response and data are always required
}

const generationConfig = {
    temperature: 0.6, // Slightly lower for more focused responses
    topP: 0.9, // Slightly narrower nucleus sampling
    topK: 40, // Allow a broader range of vocabulary
    maxOutputTokens: 512, // Limit response length for efficiency
    responseMimeType: 'application/json',
    responseSchema: jsonSchema,
}

export async function genAnswer(inputMessage: string, history: Content[] = []): Promise<any> {
    //added return type Promise<any>
    console.log(JSON.stringify(inputMessage))

    const chatSession = model.startChat({
        generationConfig,
        history: history,
    })

    try {
        const result = await chatSession.sendMessage(inputMessage)
        console.log(result.response.text())
        return result
    } catch (error) {
        console.error('Error during Gemini API call:', error)
        // Handle the error appropriately (e.g., return an error message, retry, etc.)
        throw error // Re-throw for higher-level error handling
    }
}
