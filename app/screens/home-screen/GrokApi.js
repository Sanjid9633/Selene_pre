import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "xai-ztPjhMEnktWC9KMBjLWeik8TlgvGWWRoMKEgQNZOlVpVkmwhz4wc7fJ2wKvH0NfzPQkhUxiDhAeQS7hM", // Replace with your actual API key
  baseURL: "https://api.x.ai/v1", // Replace with Grok's base URL
});

/**
 * Fetches data from Grok using OpenAI client.
 * @param {Array} messages - An array of message objects for the chatbot.
 * @returns {Object} - The response from Grok.
 */
export const fetchDataFromGrok = async (messages) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages,
    });
    return completion.choices[0].message.content; // Return the content of the chatbot's response
  } catch (error) {
    console.error("Error fetching data from Grok:", error);
    throw error;
  }
};
