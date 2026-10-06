export const extractItems = (text) => {
  const items = [];

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const skipWords = [
    "total",
    "subtotal",
    "tax",
    "discount",
    "cash",
    "change",
    "gst",
    "vat",
    "date",
    "time",
    "invoice",
    "bill",
  ];

 const itemRegex = /^(.+?)\s*(?:x\s*)?(\d+)?\s*[-:]?\s*(\d+(?:\.\d{1,2})?)$/i;

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    if (skipWords.some((word) => lower.includes(word))) {
      return;
    }

    const matched = line.match(itemRegex);



    if (matched) {
      items.push({
        name: matched[1].trim(),
        qty: Number(matched[2] || 1),
        amount: Number(matched[3]),
        category: "Others",
      });
    }
  });

  return items;
};
