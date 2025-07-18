'use server';

/**
 * @fileOverview A flow for sending a welcome and verification email to a new user.
 *
 * - sendWelcomeEmail - A function that handles sending the verification email.
 * - SendWelcomeEmailInput - The input type for the sendWelcomeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendWelcomeEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the new user.'),
  fullname: z.string().describe("The user's full name."),
});
export type SendWelcomeEmailInput = z.infer<typeof SendWelcomeEmailInputSchema>;

// This is a placeholder for the output. In a real app, this might return a status or message ID.
const SendWelcomeEmailOutputSchema = z.object({
  status: z.string(),
});
type SendWelcomeEmailOutput = z.infer<
  typeof SendWelcomeEmailOutputSchema
>;

/**
 * Mocks sending a welcome email with a verification link.
 * In a real application, this would integrate with an email service (e.g., SendGrid, Mailgun).
 */
const sendEmailTool = ai.defineTool(
  {
    name: 'sendEmail',
    description:
      'Sends an email to the user with a welcome message and verification link.',
    inputSchema: z.object({
      to: z.string().email(),
      subject: z.string(),
      body: z.string(),
    }),
    outputSchema: z.object({success: z.boolean()}),
  },
  async ({to, subject, body}) => {
    console.log('------- MOCK EMAIL SENT -------');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(body);
    console.log('-----------------------------');
    // In a real app, you would have your email sending logic here.
    // We'll just pretend it always succeeds.
    return {success: true};
  }
);

const prompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: {schema: SendWelcomeEmailInputSchema},
  tools: [sendEmailTool],
  prompt: `A new user has signed up. Their name is {{fullname}} and their email is {{email}}.
  
  Generate a friendly and welcoming email for them. The email should include a clear "call to action" button for them to verify their account. The verification link should be a placeholder, like "#".
  
  Use the sendEmail tool to send this email. The subject should be "Welcome to LearnetIQ! Please Verify Your Account".`,
});

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: SendWelcomeEmailInputSchema,
    outputSchema: SendWelcomeEmailOutputSchema,
  },
  async input => {
    await prompt(input);
    return {status: 'Email sent successfully'};
  }
);

export async function sendWelcomeEmail(
  input: SendWelcomeEmailInput
): Promise<SendWelcomeEmailOutput> {
  return sendWelcomeEmailFlow(input);
}
