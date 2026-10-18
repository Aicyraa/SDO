export const MAX_SANCTION_NAME = 80;
export const MAX_SANCTION_DESCRIPTION = 500;

export interface SanctionDraft {
  name: string;
  description: string;
}

export type SanctionErrors = Partial<Record<keyof SanctionDraft, string>>;

/** Add sanction: both fields are required. The API checks again and refuses a name that already exists. */
export function sanctionErrors(draft: SanctionDraft, existingNames: readonly string[] = []): SanctionErrors {
  const errors: SanctionErrors = {};
  const name = draft.name.trim();
  if (name === '') errors.name = 'Enter the sanction name.';
  else if (name.length > MAX_SANCTION_NAME) errors.name = `Keep the name to ${MAX_SANCTION_NAME} characters.`;
  else if (existingNames.some((existing) => existing.trim().toLowerCase() === name.toLowerCase())) errors.name = 'A sanction with that name already exists.';
  const description = draft.description.trim();
  if (description === '') errors.description = 'Describe what the sanction involves.';
  else if (description.length > MAX_SANCTION_DESCRIPTION) errors.description = `Keep the description to ${MAX_SANCTION_DESCRIPTION} characters.`;
  return errors;
}
