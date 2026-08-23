'use server';

import {
  aiTutorResourcePrompting,
  type AITutorResourcePromptingOutput,
} from '@/ai/flows/ai-tutor-resource-prompting';

export async function askTutorAction(
  query: string
): Promise<AITutorResourcePromptingOutput> {
  try {
    const response = await aiTutorResourcePrompting({
      query: query,
      studentHistory: 'Completed Algebra I, currently studying Geometry.',
    });
    return response;
  } catch (e) {
    console.error(e);
    // In a real app, you'd handle this error more gracefully
    return { resources: ['Error: Could not get resources. Please try again.'] };
  }
}
