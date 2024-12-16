import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

class Gemini {
    private genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    private model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

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
            const prompt2 = `CV json: ${cvContent}
                            List criteria: ${criteriaContent}

                            Based on the given JSON CV and the list of evaluation criteria, calculate the score for each criterion. Follow these rules for scoring:

                            1. Each criterion has multiple levels: beginner, basic, intermediate, advanced, expert. Match the skills, experiences, and technologies mentioned in the CV with the details of each level to determine the most appropriate level.
                            2. Assign a score based on the weight (weight) of the selected level. For example:
                            - If the level is basic with a weight range of 4-6, assign a midpoint score (e.g., 5/10).
                            3. Use the highest weight of the expert level as the maximum score for each criterion. For example:
                            - If the expert level has a weight range of 10-12, the maximum score for the criterion is 12.
                            4. If no relevant information is found in the CV for a criterion, assign a score of 0 for that criterion.
                            5. Provide detailed reasoning for each assigned level, referencing specific details from the CV to justify the score.
                            - If no relevant details are present in the CV, state explicitly: "No relevant information found in the CV."

                            Output the result in the following JSON format:
                            [
                                {
                                    "criterionId": "673cc4045351b1bdd0e39a1a",
                                    "criterion": "Knowledge of Node.js and its ecosystem",
                                    "score": "0/12",
                                    "explanation": "No relevant information found in the CV."
                                },
                                {
                                    "criterionId": "2a7cd99248b6d5c7e123def4",
                                    "criterion": "Knowledge of React and its ecosystem",
                                    "score": "8/12",
                                    "explanation": "The CV mentions experience in developing React components and managing state using Redux. This aligns with the 'advanced' level, which includes handling complex state management and implementing performance optimizations."
                                }
                            ]

                            Ensure that no scores or explanations are fabricated. If no information is available for a criterion, the score must be 0, and the explanation should clearly state the lack of information.`;

            console.log('calculate done')
            const result = await this.generateContent(prompt2)

            // Save the result to a file
            const cleanedResult = result.replace('```json', '').replace('```', '')
            return cleanedResult || ''
        } catch (error) {
            console.error('Error processing CV:', error)
            throw error
        }
    }

    async analyzeCV({ cvContent }: { cvContent: string }): Promise<string> {
        try {
            const prompt = `
                ${cvContent}
                Based on the provided text extracted from a CV, analyze and extract the content into a structured JSON format.
                The JSON must include at least the following mandatory fields:

                1. **Personal Information**: Includes name, date of birth, email, phone number, and address.
                2. **Skills**: A list of the candidate's skills.
                3. **Experience**: Includes any relevant experience, such as:
                   - Projects (academic, personal, or professional): Provide details like project name, description, and the candidate's role or contributions.
                   - Internships or work experience: Include organization name, role, start and end dates, and key responsibilities or achievements.
                   - Other relevant experiences: Any practical experience, volunteer work, or activities that demonstrate skills or competencies.
                4. **Education**: Includes degree, field of study, school name, and graduation year.

                Additionally, include any other information present in the CV under an **additionalInformation** field. This field should capture any data not directly mapped to the mandatory fields above.

                Ensure the output is in valid JSON format. For example:

                {
                    "personalInformation": {
                        "name": "John Doe",
                        "dateOfBirth": "1990-01-01",
                        "email": "john.doe@example.com",
                        "phone": "+123456789",
                        "address": "123 Main St, City, Country"
                    },
                    "skills": ["JavaScript", "React", "Node.js"],
                    "experience": [
                        {
                            "type": "Project",
                            "name": "E-commerce Website",
                            "description": "Developed a full-stack e-commerce platform as part of a university project.",
                            "role": "Frontend Developer",
                            "contributions": ["Designed UI using React", "Integrated payment gateway", "Deployed the app on AWS"]
                        },
                        {
                            "type": "Internship",
                            "organizationName": "Tech Corp",
                            "role": "Software Engineer Intern",
                            "startDate": "2023-06",
                            "endDate": "2023-08",
                            "responsibilities": ["Developed APIs for data processing", "Collaborated with the frontend team to integrate features"]
                        },
                        {
                            "type": "Volunteer Work",
                            "organizationName": "Local NGO",
                            "role": "Community Outreach Volunteer",
                            "description": "Organized events to raise awareness about environmental sustainability."
                        }
                    ],
                    "education": [
                        {
                            "degree": "Bachelor's in Computer Science",
                            "fieldOfStudy": "Computer Science",
                            "schoolName": "XYZ University",
                            "graduationYear": "2022"
                        }
                    ],
                    "additionalInformation": {
                        "certifications": [
                            {
                                "name": "Certified Kubernetes Administrator",
                                "organization": "CNCF",
                                "obtainedDate": "2021-07"
                            }
                        ],
                        "languages": [
                            {
                                "language": "English",
                                "proficiency": "Fluent"
                            },
                            {
                                "language": "Spanish",
                                "proficiency": "Intermediate"
                            }
                        ],
                        "otherDetails": "Open to relocation and remote work."
                    }
                }

                Important notes:
                - Include **all information** from the CV in the JSON output.
                - Use an **additionalInformation** field to capture any data not fitting the mandatory fields.
                - Ensure the output is valid JSON and contains no extra text or formatting.
            `
            const cvJson = await this.generateContent(prompt)

            // Clean and return the result
            const cleanedResult = cvJson.replace('```json', '').replace('```', '')
            return cleanedResult || ''
        } catch (error) {
            console.error('Error processing CV:', error)
            throw error
        }
    }
}

export default Gemini
