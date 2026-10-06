const { askAssistant } = require("../services/assistantService");
const { successResponse } = require("../utils/apiResponse");

const chat = async (req, res, next) => {
  try {
    const reply = await askAssistant(req.body.prompt);
    return successResponse(res, 200, "AI response generated", { reply });
  } catch (error) {
    return next(error);
  }
};

module.exports = { chat };