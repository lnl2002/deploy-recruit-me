import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

class Gemini {
    private genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    constructor() {}

    /**
     * Generate content using the AI model.
     * @param prompt - Input prompt for the model.
     * @returns Generated content.
     */
    async generateContent(prompt: string): Promise<string> {
        try {
            const result = await this.model.generateContent(prompt)
            return result.response.text()
        } catch (error) {
            console.error('Error generating content:', error)
            throw error
        }
    }

    /**
     * Process a CV file and evaluation criteria to calculate scores.
     * @param cvPath - Path to the CV file.
     * @param criteriaPath - Path to the criteria JSON file.
     * @param outputPath - Path to save the result.
     */
    async processCV({ cvContent, criteriaContent }: { cvContent: string; criteriaContent: string }): Promise<string> {
        try {
            // Step 1: Analyze CV
            const prompt1 = `${cvContent}
      First, Based on the above paragraph, try to analyze and come up with the items of the CV.
      Then, detail the CV in JSON format. Notione: Only json file, doesn't have any text.
      `
            const cvJson = await this.generateContent(prompt1)

            // Step 2: Evaluate CV against criteria
            const prompt2 = `CV json: ${cvJson}
      List criteria: ${criteriaContent}

      Based on the given JSON CV and the list of evaluation criteria, calculate the score for each criterion. Follow these rules for scoring:

      1. Each criterion has multiple levels: beginner, basic, intermediate, advanced, expert. Match the skills, experiences, and technologies mentioned in the CV with the details of each level to determine the most appropriate level.
      2. Assign a score based on the weight (weight) of the selected level. For example:
      If the level is basic with a weight range of 4-6, assign a midpoint score (e.g., 5/10).
      3. Use the highest weight of the expert level as the maximum score for each criterion. For example:
          If the expert level has a weight range of 10-12, the maximum score for the criterion is 12.
      4. For each criterion, provide the following output:
      Criterion: [Name of the criterion]
      Score: [Achieved score] / [Maximum score]
      Explanation: [Reasoning for the assigned level, referencing details from the CV].

      Example Output Format like json:
      [
          {
              "criterionId": "673cc4045351b1bdd0e39a1a",
              "criterion": "Knowledge of Node.js and its ecosystem",
              "score": "6/12",
              "explanation": "The CV mentions experience with Node.js and developing RESTful APIs using Express.js. This aligns with the 'intermediate' level, which includes building full RESTful APIs and handling asynchronous operations."
          }
      ]
      `
            const result = await this.generateContent(prompt2)

            // Save the result to a file
            const cleanedResult = result.replace('```json', '').replace('```', '')
            return cleanedResult || ''
        } catch (error) {
            console.error('Error processing CV:', error)
            throw error
        }
    }
}

export default Gemini
