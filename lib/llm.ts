"use server";

import { Recipe, RecipeRequest } from "@/types/recipe";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateRecipe(prompt: RecipeRequest): Promise<Recipe> {
  const response = await generateText({
    model: google("gemini-2.0-flash"),
    system:
      "You are a world-class chef and expert in diverse cuisines, specialized in crafting recipes tailored to individual preferences and dietary needs. Your task is to generate one high-quality, complete recipe based on the user's request. You must respond with a **single minified JSON object** only—no additional text or commentary",
    prompt: `{
  "recipeName": "string",
  "description": "string", 
  "prepTimeMinutes": "number",
  "cookTimeMinutes": "number",
  "servings": "number",
  "ingredients": [ { "quantity": "string", "name": "string" } ],
  "instructions": [ { "step": "number", "description": "string" } ],
  "chefTips": ["string"]
}

🔧 **Constraints to Follow**:
- Respect all dietary restrictions: ${
      prompt.dietaryRestrictions.join(", ") || "None"
    }
- Prioritize using available ingredients: ${
      prompt.availableIngredients || "None specified"
    }
- Keep total time (prepTimeMinutes + cookTimeMinutes) ≤ ${
      prompt.maxCookingTime
    } minutes
- Ensure servings = ${prompt.servingSize}
- Recipe must reflect the requested main dish: ${prompt.mainDish}

🧠 **Recipe Guidelines**:
- Think creatively but practically—assume a home kitchen setup.
- If available ingredients are not sufficient for a coherent dish, supplement minimally with common pantry items.
- Ensure clear, numbered instructions suitable for a moderately skilled home cook.
- Include at least 1 thoughtful "chefTip" to enhance flavor, simplify a step, or offer a pro technique.

📦 **Output Format Rules**:
- Return only the JSON object, no pretty-printing or newlines.
- All string values must be properly escaped.
- Do not include comments or explanations.

Begin processing the my request now.
    `,
  });

  try {
    // Clean the response text to remove any markdown formatting or extra text
    let cleanedText = response.text.trim();

    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // Remove any leading/trailing text that might not be JSON
    const jsonStart = cleanedText.indexOf("{");
    const jsonEnd = cleanedText.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON found in response");
    }

    const jsonText = cleanedText.substring(jsonStart, jsonEnd);

    // Parse the JSON and validate it's a Recipe
    const recipe: Recipe = JSON.parse(jsonText);

    // Basic validation to ensure required fields exist
    if (!recipe.recipeName || !recipe.ingredients || !recipe.instructions) {
      throw new Error("Invalid recipe structure: missing required fields");
    }

    return recipe;
  } catch (error) {
    console.error("Error parsing recipe JSON:", error);
    console.error("Raw response:", response.text);
    throw new Error(
      `Failed to parse recipe: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function generateIngredientSubstitution(
  ingredient: string,
  restriction: string
): Promise<string> {
  const response = await generateText({
    model: google("gemini-2.0-flash"),
    system:
      "You are a world-class chef and expert in diverse cuisines, specialized in crafting recipes tailored to individual preferences and dietary needs. Your task is to generate one high-quality, complete recipe based on the user's request. You must respond with a **single minified JSON object** only—no additional text or commentary",
    prompt: `{
      "as aprofessional chef, suggest a substitute for "${ingredient}" that is ${restriction}. Provide only a brief, practical substitution suggestion in 1-2 sentencesubstitution": "string"
    }
  `,
  });

  return response.text.trim();
}
