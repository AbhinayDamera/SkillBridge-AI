import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JobAnalysis, CompanyType, StudyModule, QuizQuestion, CodeChallenge, ExecutionResult } from '../types';

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MODEL_FAST = 'gemini-2.5-flash';

export const analyzeJobDescription = async (text: string, imageBase64?: string, userProvidedCompany?: string): Promise<JobAnalysis> => {
  try {
    const prompt = `
      Analyze the following Job Description (JD) text or image.
      CRITICAL: The user is specifically targeting the company: "${userProvidedCompany}". 
      Even if the JD text is generic, tailor the Role, Type, and Skills analysis specifically for "${userProvidedCompany}".
      
      Extract the Job Role, Company Name (use "${userProvidedCompany}"), and Required Skills.
      Determine if "${userProvidedCompany}" is likely a "Product-based", "Service-based", or "Startup" company.
      Provide a brief 1-sentence summary of the expectation.
    `;

    const contents = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity, could be png
          data: imageBase64
        }
      });
    }
    if (text) {
      contents.push({ text: `\n\nJD Text:\n${text}` });
    }
    
    // Using system instruction as part of prompt for robustness in simple generation or config
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING },
        company: { type: Type.STRING },
        type: { type: Type.STRING, enum: [CompanyType.PRODUCT, CompanyType.SERVICE, CompanyType.STARTUP, CompanyType.UNKNOWN] },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING },
      },
      required: ['role', 'company', 'type', 'skills', 'summary'],
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: [{ role: 'user', parts: [{ text: prompt }, ...contents.map(c => c.inlineData ? c : { text: c.text || '' })] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert HR and Technical Recruiter assistant.",
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as JobAnalysis;
    }
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Error analyzing JD:", error);
    // Fallback data for demo stability
    return {
      role: "Software Engineer",
      company: userProvidedCompany || "Unknown Company",
      type: CompanyType.UNKNOWN,
      skills: ["Problem Solving"],
      summary: "Could not analyze the JD properly. Please try again."
    };
  }
};

export const generateStudyPlan = async (job: JobAnalysis): Promise<StudyModule[]> => {
  try {
    const prompt = `
      Create a comprehensive 4-week study plan for a ${job.role} position at ${job.company} (${job.type}).
      The plan must be highly specific to the company's interview patterns (e.g. if Amazon, focus on Leadership Principles and DSA; if TCS, focus on Aptitude).
      Focus on these skills: ${job.skills.join(', ')}.
      
      Output exactly 4 modules (one per week).
      Format requirements:
      - Week: e.g., "Week 1", "Week 2"
      - Topic: Main theme of the week
      - Description: Detailed advice on what to study.
      - Resources: Array of 2-3 specific search terms or topics to look up (e.g. "React Hooks Tutorial", "Neetcode 150").
    `;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.STRING },
          topic: { type: Type.STRING },
          description: { type: Type.STRING },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['week', 'topic', 'description', 'resources']
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as StudyModule[];
    }
    throw new Error("No plan generated");
  } catch (error) {
    console.error("Error generating plan:", error);
    return [];
  }
};

export const generateQuiz = async (job: JobAnalysis): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      You are an expert technical interviewer for ${job.company}. 
      Generate 40 multiple-choice questions that have historically appeared in ${job.company}'s placement papers or technical rounds.
      
      CRITICAL: The questions must match the specific difficulty and style of ${job.company}.
      - If ${job.company} is a Service-based company (e.g., TCS, Infosys, Wipro): Focus heavily on Quantitative Aptitude, Logical Reasoning, and basic C/Java/Python Output questions (Pointer logic, loops).
      - If ${job.company} is a Product-based company (e.g., Amazon, Google, Microsoft): Focus on Data Structures (Trees, Graphs), Algorithms, Operating Systems (Deadlocks, Paging), and DBMS (SQL queries, Normalization).
      
      Classify each question into:
      1. "Aptitude" (Quant & Logic - very important for service companies)
      2. "Technical" (Code Output prediction, Debugging, Language specifics)
      3. "Core CS" (OS, DBMS, CN)
      4. "Domain" (Specific to the job role: ${job.skills.join(', ')})

      Distribution: 10 questions per category.
    `;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          category: { type: Type.STRING, enum: ['Aptitude', 'Technical', 'Core CS', 'Domain'] },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
          explanation: { type: Type.STRING },
        }
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const generateCodeChallenges = async (job: JobAnalysis): Promise<CodeChallenge[]> => {
  try {
    const prompt = `
      You are a technical recruiter for ${job.company}. 
      Identify 3 REAL coding interview questions that have been frequently asked in ${job.company}'s previous interview rounds.
      
      Do NOT generate generic questions. Search your knowledge base for questions tagged with "${job.company}" on platforms like LeetCode or GeeksForGeeks.
      
      1. Problem 1: Easy/Medium (Commonly asked in screening)
      2. Problem 2: Medium (Commonly asked in technical rounds)
      3. Problem 3: Hard (Asked in final rounds or for higher roles)
      
      In the 'description', explicitly mention: "This question has appeared in ${job.company} interviews."
      
      For each problem, provide:
      - Title (Use the standard competitive programming name, e.g., "Trapping Rain Water", "LRU Cache")
      - Detailed Description with constraints.
      - Difficulty
      - Starter Code templates.
    `;

    const responseSchema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
            starterCode: {
                type: Type.OBJECT,
                properties: {
                    python: { type: Type.STRING },
                    javascript: { type: Type.STRING },
                    java: { type: Type.STRING }
                },
                required: ['python', 'javascript', 'java']
            }
        },
        required: ['title', 'description', 'difficulty', 'starterCode']
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CodeChallenge[];
    }
    throw new Error("No challenge generated");
  } catch (error) {
    // Fallback
    return [{
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. (Often asked by ${job.company})`,
      difficulty: "Easy",
      starterCode: {
        python: "def two_sum(nums, target):\n    # Write your code here\n    pass",
        javascript: "function twoSum(nums, target) {\n    // Write your code here\n}",
        java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}"
      }
    }];
  }
};

export const runCodeWithAI = async (code: string, language: string, problemDescription: string): Promise<ExecutionResult> => {
  try {
    const prompt = `
      Act as an automated code judge and compiler.
      Language: ${language}.
      Problem: ${problemDescription}
      
      User Code:
      ${code}

      Tasks:
      1. Check for syntax errors.
      2. Create 3 distinct test cases (including one edge case) for this problem.
      3. Simulate the execution of the user's code against these test cases.
      
      Return a JSON response strictly matching this schema. Do not include markdown formatting.
    `;

    const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
            status: { type: Type.STRING, enum: ['Success', 'Error'] },
            errorDetails: { type: Type.STRING },
            testCases: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        input: { type: Type.STRING },
                        expectedOutput: { type: Type.STRING },
                        actualOutput: { type: Type.STRING },
                        passed: { type: Type.BOOLEAN }
                    }
                }
            },
            summary: { type: Type.STRING }
        },
        required: ['status', 'testCases', 'summary']
    };

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as ExecutionResult;
    }
    throw new Error("No output");
  } catch (error) {
    return {
        status: 'Error',
        errorDetails: "Failed to execute code simulation.",
        testCases: [],
        summary: "System error occurred."
    };
  }
}

export const getCodeHint = async (code: string, language: string, problemDescription: string): Promise<string> => {
    try {
        const prompt = `
          The user is stuck on this coding problem. Provide a helpful hint without giving away the full solution code.
          Problem: ${problemDescription}
          Current User Code (${language}):
          ${code}
          
          Provide a short, 2-sentence conceptual hint to nudge them in the right direction.
        `;
        
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
        });
        
        return response.text || "Try breaking the problem into smaller steps.";
    } catch (e) {
        return "Analyze the constraints and edge cases carefully.";
    }
}
