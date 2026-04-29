/**
 * Formats a name for greeting purposes.
 * If the name starts with a common title (Mr., Dr., etc.), it returns Title + First Name.
 * Otherwise, it returns just the First Name.
 */
export const formatGreetingName = (name?: string, fallback: string = 'User'): string => {
  if (!name || name.trim() === '') return fallback;
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return fallback;

  // Common titles to detect
  const titles = ['mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'rev.', 'sir', 'mr', 'mrs', 'ms', 'dr', 'miss'];
  const firstPartLower = parts[0].toLowerCase();

  // If the first part is a title, we want to include the next part of the name
  if (titles.includes(firstPartLower) || (parts[0].length <= 3 && parts[0].includes('.'))) {
    if (parts.length > 1) {
      // Return "Mr. John" instead of just "Mr."
      return `${parts[0]} ${parts[1]}`;
    }
  }

  // Fallback to just the first part (e.g., "John")
  return parts[0];
};
