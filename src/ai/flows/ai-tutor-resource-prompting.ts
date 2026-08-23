export interface AITutorResourcePromptingOutput {
  resources: string[];
}

export interface AITutorResourcePromptingInput {
  query: string;
  studentHistory: string;
}

export async function aiTutorResourcePrompting(
  input: AITutorResourcePromptingInput
): Promise<AITutorResourcePromptingOutput> {
  console.log('[AI Tutor Resource Prompting]', input);
  
  // Return some dummy mock resources based on the query to satisfy the action
  return {
    resources: [
      `Recommended resource for "${input.query}": Geometry Part 1 - Fundamentals`,
      `Interactive Exercises on coordinate planes and shapes`,
      `Practice Quiz: Geometry basics`,
    ],
  };
}
