import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VISION_MODEL = process.env.ANTHROPIC_VISION_MODEL ?? "claude-sonnet-5";
const CHAT_MODEL = process.env.ANTHROPIC_CHAT_MODEL ?? "claude-sonnet-5";

// Base44's InvokeLLM took a JSON-schema argument and guaranteed the shape
// back. Claude doesn't have a schema-enforcement flag, so we get the same
// guarantee with a single-tool forced tool_choice — the model can only
// respond by "calling" record_plant_analysis, and the input to that call
// IS the structured result. This is the one piece of the migration worth
// testing thoroughly, since the whole Analysis entity depends on its shape.
const ANALYSIS_TOOL: Anthropic.Tool = {
  name: "record_plant_analysis",
  description:
    "Record the structured result of identifying and health-assessing a plant from photos.",
  input_schema: {
    type: "object",
    properties: {
      plant_common_name: { type: "string" },
      plant_scientific_name: { type: "string" },
      family: { type: "string" },
      habitat: { type: "string" },
      uses: { type: "string" },
      is_healthy: { type: "boolean" },
      disease_name: { type: "string", nullable: true },
      critical_rating: {
        type: "string",
        enum: ["Low", "Moderate", "High", "Severe"],
      },
      treatment_recommendation: { type: "string" },
      prevention_recommendation: { type: "string" },
      is_controlled_plant: { type: "boolean" },
      controlled_plant_note: { type: "string", nullable: true },
      identification_confidence: { type: "number", minimum: 0, maximum: 1 },
      health_confidence: { type: "number", minimum: 0, maximum: 1 },
      controlled_confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: [
      "plant_common_name",
      "plant_scientific_name",
      "is_healthy",
      "critical_rating",
      "is_controlled_plant",
      "identification_confidence",
      "health_confidence",
      "controlled_confidence",
    ],
  },
};

const SYSTEM_PROMPT = `You are an expert botanist and plant pathologist. Given
one or more photos of a plant, identify the species and assess its health,
exactly as a field botanist and agronomist would. Flag regulated or
controlled species (e.g. cannabis, opium poppy) explicitly. Be conservative
with confidence scores when the photos are ambiguous. Always respond by
calling record_plant_analysis — never respond in plain text.`;

export type PlantAnalysisResult = {
  plant_common_name: string;
  plant_scientific_name: string;
  family?: string;
  habitat?: string;
  uses?: string;
  is_healthy: boolean;
  disease_name?: string | null;
  critical_rating: "Low" | "Moderate" | "High" | "Severe";
  treatment_recommendation?: string;
  prevention_recommendation?: string;
  is_controlled_plant: boolean;
  controlled_plant_note?: string | null;
  identification_confidence: number;
  health_confidence: number;
  controlled_confidence: number;
};

/**
 * imageInputs: base64-encoded image data + media type, already uploaded to
 * blob storage by the caller (this fn only needs the bytes for the model).
 */
export async function analyzePlantImages(
  imageInputs: { base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" }[],
  analysisType: "standard" | "drone" = "standard",
): Promise<PlantAnalysisResult> {
  const imageBlocks: Anthropic.ImageBlockParam[] = imageInputs.map((img) => ({
    type: "image",
    source: { type: "base64", media_type: img.mediaType, data: img.base64 },
  }));

  const instruction =
    analysisType === "drone"
      ? "These are aerial/batch photos from drone monitoring of a farm plot. Assess overall crop health across the visible area."
      : "Identify this plant and assess its health from the photo(s) provided.";

  const response = await anthropic.messages.create({
    model: VISION_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: "tool", name: "record_plant_analysis" },
    messages: [
      {
        role: "user",
        content: [...imageBlocks, { type: "text", text: instruction }],
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Model did not return a structured analysis");
  }
  return toolUse.input as PlantAnalysisResult;
}

/**
 * Streaming chat for the Assistant page — replaces InvokeLLM's conversational
 * mode. Returns the raw stream so the API route can pipe it to the client.
 */
export function streamAssistantReply(
  history: { role: "user" | "assistant"; content: string }[],
) {
  return anthropic.messages.stream({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system:
      "You are a knowledgeable botanist and plant-care assistant. Answer follow-up questions about plant identification, disease, and care clearly and practically.",
    messages: history,
  });
}
