import axiosInstance from "./axios";

/**
 * @param {string} language - programming language
 * @param {string} code - source code to executed
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const response = await axiosInstance.post("/coderuns/run", {
      language,
      code,
    });

    const data = response.data;

    // The backend runner returns { success, output, error, executionTime }
    // We normalize it to the format the frontend expects
    if (data.success) {
      return {
        success: true,
        output: data.output || "No output",
        error: data.error || null,
      };
    } else {
      return {
        success: false,
        output: data.output || "",
        error: data.error || "Execution failed",
      };
    }
  } catch (error) {
    console.error("Local Execution Error:", error);
    return {
      success: false,
      error: error.response?.data?.message || `Failed to execute code: ${error.message}`,
    };
  }
}
