'use server';

/**
 * @fileOverview A flow that generates summaries of recent activity on subject forums.
 *
 * - generateSubjectForumSummaries - A function that handles the generation of subject forum summaries.
 * - GenerateSubjectForumSummariesInput - The input type for the generateSubjectForumSummaries function.
 * - GenerateSubjectForumSummariesOutput - The return type for the generateSubjectForumSummaries function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSubjectForumSummariesInputSchema = z.object({
  subject: z.string().describe('The subject of the forum.'),
  forumPosts: z
    .string()
    .describe('Recent forum posts, each post separated by a newline.'),
});
export type GenerateSubjectForumSummariesInput = z.infer<
  typeof GenerateSubjectForumSummariesInputSchema
>;

const GenerateSubjectForumSummariesOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A short summary of the recent forum activity, highlighting common questions and interesting discussions.'
    ),
});
export type GenerateSubjectForumSummariesOutput = z.infer<
  typeof GenerateSubjectForumSummariesOutputSchema
>;

export async function generateSubjectForumSummaries(
  input: GenerateSubjectForumSummariesInput
): Promise<GenerateSubjectForumSummariesOutput> {
  return generateSubjectForumSummariesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSubjectForumSummariesPrompt',
  input: {schema: GenerateSubjectForumSummariesInputSchema},
  output: {schema: GenerateSubjectForumSummariesOutputSchema},
  prompt: `You are an AI assistant summarizing recent activity on a subject forum.

  Subject: {{{subject}}}

  Recent Forum Posts:
  {{#if forumPosts}}
  {{{forumPosts}}}
  {{else}}
  There are no recent forum posts.
  {{/if}}

  Please provide a concise summary of the common questions, interesting discussions, and key topics that have emerged. The summary should be no more than 2-3 sentences.
  `,
});

const generateSubjectForumSummariesFlow = ai.defineFlow(
  {
    name: 'generateSubjectForumSummariesFlow',
    inputSchema: GenerateSubjectForumSummariesInputSchema,
    outputSchema: GenerateSubjectForumSummariesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
