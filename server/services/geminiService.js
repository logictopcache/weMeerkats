const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || "AIzaSyBDj65U42OBkTUnh2UiA4lc84Ujti7xA9o"
    );
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Generate content using Gemini
   * @param {string} prompt - The prompt to send to Gemini
   * @param {Array} messages - Array of conversation messages (optional)
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The generated response
   */
  async generateContent(prompt, messages = [], options = {}) {
    try {
      let content;

      if (messages && messages.length > 0) {
        // For conversation-style interactions
        const chat = this.model.startChat({
          history: messages.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
        });

        const result = await chat.sendMessage(prompt);
        content = result.response.text();
      } else {
        // For single prompt interactions
        const result = await this.model.generateContent(prompt);
        content = result.response.text();
      }

      return content;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Generate chat completion (similar to OpenAI's chat.completions.create)
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response in OpenAI-compatible format
   */
  async chatCompletions(messages, options = {}) {
    try {
      // Handle system messages by prepending them to the first user message
      let systemPrompt = "";
      let userMessages = [];

      messages.forEach((msg) => {
        if (msg.role === "system") {
          systemPrompt += msg.content + " ";
        } else if (msg.role === "user" || msg.role === "assistant") {
          userMessages.push(msg);
        }
      });

      // If we have a system prompt, prepend it to the first user message
      if (
        systemPrompt &&
        userMessages.length > 0 &&
        userMessages[0].role === "user"
      ) {
        userMessages[0].content = systemPrompt + userMessages[0].content;
      }

      // Convert to Gemini format
      const geminiHistory = [];
      for (let i = 0; i < userMessages.length - 1; i += 2) {
        if (userMessages[i] && userMessages[i + 1]) {
          geminiHistory.push({
            role: "user",
            parts: [{ text: userMessages[i].content }],
          });
          geminiHistory.push({
            role: "model",
            parts: [{ text: userMessages[i + 1].content }],
          });
        }
      }

      const chat = this.model.startChat({
        history: geminiHistory,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.max_tokens || 2048,
        },
      });

      const lastMessage = userMessages[userMessages.length - 1];
      if (!lastMessage || !lastMessage.content) {
        throw new Error("No valid user message to send to Gemini.");
      }
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response.text();

      // Return in OpenAI-compatible format
      return {
        choices: [
          {
            message: {
              content: response,
              role: "assistant",
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 0, // Gemini doesn't provide token usage
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw new Error(`Gemini chat error: ${error.message}`);
    }
  }

  /**
   * Generate a single response (for simple prompts)
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - The generated response
   */
  async generateSimpleResponse(prompt, options = {}) {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Gemini Simple Generation Error:", error);
      throw new Error(`Gemini generation error: ${error.message}`);
    }
  }

  /**
   * Analyze resume content (for PDF parser)
   * @param {string} resumeText - The resume text to analyze
   * @param {string} profileType - Either 'MENTOR' or 'LEARNER'
   * @returns {Promise<Object>} - Extracted data
   */
  async analyzeResume(resumeText, profileType) {
    try {
      let prompt;

      if (profileType === "MENTOR") {
        prompt = `
                Extract information from the following resume text for a MENTOR profile in JSON format.

                MENTOR Profile Keys to extract:
                - fullName: string
                - education: array of objects with {degree, universityName, location, duration, description}
                - skills: array of strings
                - experience: array of objects with {title, companyName, location, duration, description}
                - certifications: array of strings
                - bio: string (generate a professional bio based on experience)
                - designation: string (current or most recent job title)

                Resume Text:
                ${resumeText}

                Return only valid JSON with the extracted data, no additional text or formatting.
                `;
      } else {
        prompt = `
                Extract information from the following resume text for a LEARNER profile in JSON format.

                LEARNER Profile Keys to extract:
                - fullName: string
                - email: string
                - phone: string
                - education: array of objects with {degree, universityName, location, duration}
                - workExperiences: array of objects with {title, companyName, location, duration}
                - certification: array of strings
                - expertise: array of strings
                - skills: array of strings
                - projects: array of objects with {name, description, technologies}

                Resume Text:
                ${resumeText}

                Return only valid JSON with the extracted data, no additional text or formatting.
                `;
      }

      const response = await this.generateSimpleResponse(prompt, {
        temperature: 0.1,
      });

      // Clean up the response to ensure it's valid JSON
      const cleanedText = response.replace(/```json\n?|\n?```/g, "").trim();

      try {
        return JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Error parsing Gemini response as JSON:", parseError);
        console.log("Raw Gemini response:", response);
        throw new Error("Failed to parse Gemini response as JSON");
      }
    } catch (error) {
      console.error("Error analyzing resume with Gemini:", error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
