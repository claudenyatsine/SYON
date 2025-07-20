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

const ForumSchema = z.object({
  subject: z.string().describe('The subject of the forum.'),
  posts: z
    .string()
    .describe('Recent forum posts, each post separated by a newline.'),
});

const GenerateSubjectForumSummariesInputSchema = z.object({
  forums: z.array(ForumSchema),
});
export type GenerateSubjectForumSummariesInput = z.infer<
  typeof GenerateSubjectForumSummariesInputSchema
>;

const GenerateSubjectForumSummariesOutputSchema = z.object({
  summaries: z
    .record(
      z.string(),
      z
        .string()
        .describe(
          'A short summary of the recent forum activity, highlighting common questions and interesting discussions.'
        )
    )
    .describe(
      'A map of subject to its corresponding summary. The key is the subject name.'
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
  prompt: `You are an AI assistant summarizing recent activity on multiple subject forums.
  
  For each of the following forums, please provide a concise summary (no more than 2-3 sentences) of the common questions, interesting discussions, and key topics that have emerged.

  {{#each forums}}
  Subject: {{{this.subject}}}
  Recent Forum Posts:
  {{#if this.posts}}
  {{{this.posts}}}
  {{else}}
  There are no recent forum posts.
  {{/if}}
  ---
  {{/each}}

  Return the output as a JSON object where the keys are the subject names and the values are the summaries.
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
