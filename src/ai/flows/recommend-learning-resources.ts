'use server';

/**
 * @fileOverview Recommends learning resources based on the student's grade level and subjects.
 *
 * - recommendLearningResources - A function that recommends learning resources.
 * - RecommendLearningResourcesInput - The input type for the recommendLearningResources function.
 * - RecommendLearningResourcesOutput - The return type for the recommendLearningResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendLearningResourcesInputSchema = z.object({
  gradeLevel: z.string().describe('The grade level of the student.'),
  subjects: z.array(z.string()).describe('The subjects the student is studying.'),
});
export type RecommendLearningResourcesInput = z.infer<
  typeof RecommendLearningResourcesInputSchema
>;

const RecommendLearningResourcesOutputSchema = z.object({
  resources: z
    .array(z.string())
    .describe('A list of recommended learning resources for the student.'),
});
export type RecommendLearningResourcesOutput = z.infer<
  typeof RecommendLearningResourcesOutputSchema
>;

export async function recommendLearningResources(
  input: RecommendLearningResourcesInput
): Promise<RecommendLearningResourcesOutput> {
  return recommendLearningResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendLearningResourcesPrompt',
  input: {schema: RecommendLearningResourcesInputSchema},
  output: {schema: RecommendLearningResourcesOutputSchema},
  prompt: `You are an AI tutor assistant. A student in grade {{{gradeLevel}}} is studying the following subjects: {{{subjects}}}.  Recommend learning resources for the student. Return the resources as a list of strings, including URLs if relevant.`,
});

const recommendLearningResourcesFlow = ai.defineFlow(
  {
    name: 'recommendLearningResourcesFlow',
    inputSchema: RecommendLearningResourcesInputSchema,
    outputSchema: RecommendLearningResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
