/**
 * Helper utilities for rendering full subject details, curriculum board, and syllabus codes.
 */

export interface SubjectLike {
  id?: string;
  name?: string;
  level?: string;
  category?: string;
  curriculum_board?: string | null;
  code?: string | null;
  description?: string | null;
  [key: string]: any;
}

/**
 * Returns the standardized curriculum board: 'ZIMSEC' | 'Cambridge'
 */
export function getCurriculumBoard(subject?: SubjectLike | null): 'ZIMSEC' | 'Cambridge' {
  if (!subject) return 'ZIMSEC';
  
  if (subject.curriculum_board) {
    const b = subject.curriculum_board.toLowerCase();
    if (b.includes('cambridge') || b.includes('cie') || b.includes('igcse')) return 'Cambridge';
    if (b.includes('zimsec') || b.includes('zjc')) return 'ZIMSEC';
  }

  const name = subject.name || '';
  const level = subject.level || '';

  if (name.includes('0600') || name.includes('0580') || name.includes('0625') || name.includes('0620') || name.includes('0610') || name.includes('9700') || name.includes('9701') || name.includes('9702') || name.includes('9709') || name.includes('9618') || name.includes('9695') || name.includes('9489') || name.includes('9696') || name.includes('9011') || name.includes('9699') || name.includes('0478') || name.includes('0470') || name.includes('0500') || name.includes('0475') || name.includes('0460') || name.includes('0410') || level === 'IGCSE') {
    return 'Cambridge';
  }

  return 'ZIMSEC';
}

/**
 * Returns the standardized academic level: 'ZJC (Form 1-2)' | 'O-Level' | 'A-Level' | 'IGCSE'
 */
export function getSubjectLevel(subject?: SubjectLike | null): string {
  if (!subject) return 'O-Level';
  if (subject.level) return subject.level;
  
  const name = subject.name || '';
  if (name.includes('ZJC')) return 'ZJC (Form 1-2)';
  if (name.includes('0600') || name.includes('0580') || name.includes('0625') || name.includes('0620') || name.includes('0610')) return 'IGCSE';
  if (name.includes('9700') || name.includes('9701') || name.includes('9702') || name.includes('9709') || name.includes('6030') || name.includes('6031') || name.includes('6032') || name.includes('9164')) return 'A-Level';
  return 'O-Level';
}

/**
 * Extracts syllabus code if present in the name, e.g. "5038" from "Agriculture (5038)"
 */
export function getSubjectCode(subject?: SubjectLike | null): string | null {
  if (!subject) return null;
  if (subject.code) return subject.code;
  const match = (subject.name || '').match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

/**
 * Returns clean subject name without parenthesized code, e.g. "Agriculture" from "Agriculture (5038)"
 */
export function getSubjectBaseName(subject?: SubjectLike | null): string {
  if (!subject || !subject.name) return 'Subject';
  return subject.name.replace(/\s*\([^)]+\)/, '').trim();
}

/**
 * Returns the full descriptive title: e.g. "ZIMSEC O-Level • Agriculture (5038)"
 */
export function getSubjectFullTitle(subject?: SubjectLike | null): string {
  if (!subject) return 'Subject';
  const board = getCurriculumBoard(subject);
  const level = getSubjectLevel(subject);
  const name = subject.name || 'Subject';
  return `${board} ${level} • ${name}`;
}

/**
 * Returns short badge label: e.g. "[ZIMSEC] Agriculture (5038)"
 */
export function getSubjectShortBadge(subject?: SubjectLike | null): string {
  if (!subject) return 'Subject';
  const board = getCurriculumBoard(subject);
  return `[${board}] ${subject.name || 'Subject'}`;
}
