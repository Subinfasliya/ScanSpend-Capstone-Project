export const extractStore = (text) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines? lines[0] : "Store name not found"
};
