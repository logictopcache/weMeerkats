import axios from "axios";

export const createPrompt = async (title) => {
  try {
    const response = await axios.post(
      "http://localhost:5274/api/create-prompt",
      { title }
    );
    return response.data;
  } catch (error) {
    return { status: false, message: error.message };
  }
};

export const generateQuestion = async (generatedPrompt) => {
  try {
    const response = await axios.post(
      "http://localhost:5274/api/generate-question",
      {
        generatedPrompt,
      }
    );
    return response.data;
  } catch (error) {
    return { status: false, message: error.message };
  }
};
