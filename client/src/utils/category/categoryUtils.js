export const normalizeCategory = (name) => {
  return name.trim().toLowerCase();
};

export const toTitleCase = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};