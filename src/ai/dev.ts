import { config } from 'dotenv';
config();

import '@/ai/flows/generate-subject-forum-summaries.ts';
import '@/ai/flows/recommend-learning-resources.ts';
import '@/ai/flows/send-welcome-email.ts';
