const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Extracts unique {{variableName}} tokens from a template body, in order of first appearance. */
export function extractVariables(body: string): string[] {
  const seen = new Set<string>();
  for (const match of body.matchAll(VARIABLE_PATTERN)) {
    seen.add(match[1]);
  }
  return Array.from(seen);
}

export interface RenderResult {
  text: string;
  missing: string[];
}

/** Replaces {{variableName}} tokens with values from `variables`. Missing values become "". */
export function renderTemplate(
  body: string,
  variables: Record<string, string | null | undefined>,
): RenderResult {
  const missing: string[] = [];
  const text = body.replace(VARIABLE_PATTERN, (_match, name: string) => {
    const value = variables[name];
    if (value === undefined || value === null || value === '') {
      if (!missing.includes(name)) missing.push(name);
      return '';
    }
    return value;
  });
  return { text, missing };
}

/** Standard variables every contact provides for personalization, on top of any extras. */
export function contactVariables(contact: {
  firstName: string;
  lastName?: string | null;
  phoneNumber: string;
}): Record<string, string> {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName ?? '',
    phoneNumber: contact.phoneNumber,
  };
}
