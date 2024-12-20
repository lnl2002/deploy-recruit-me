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
                matchedJobIds: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.STRING,
                    },
                },
                readyToFind: { type: SchemaType.BOOLEAN , description: "defalt: false, only switch to [true] if you done asking user questions detemine if should show jobs for user or not Only switch 'readyToFind' to [true] after you return 'Please wait, I'm finding some jobs for you!' (This consider end of conversation)"},
            },
        },
    },
    required: ['response', 'data'], // If both response and data are always required
}

const generationConfig = {
    temperature: 0.3, // Slightly lower for more focused responses
    topP: 0.1, // Slightly narrower nucleus sampling
    topK: 40, // Allow a broader range of vocabulary
    maxOutputTokens: 512, // Limit response length for efficiency
    responseMimeType: 'application/json',
    responseSchema: jsonSchema,
}

export async function genAnswer(inputMessage: string, history: Content[] = []): Promise<any> {
    //added return type Promise<any>
    // console.log(JSON.stringify(inputMessage))

    const chatSession = model.startChat({
        generationConfig,
        history: history,
    })

    try {
        const result = await chatSession.sendMessage(inputMessage)
        // console.log(result.response.text())
        return result
    } catch (error) {
        console.error('Error during Gemini API call:', error)
        // Handle the error appropriately (e.g., return an error message, retry, etc.)
        throw error // Re-throw for higher-level error handling
    }
}
