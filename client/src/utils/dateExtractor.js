const formatDatetoInput = (dateStr) => {
  if (!dateStr) return "";

  const parts = dateStr.split("/");

  if (parts.length !== 3) return "";

  // yyyy/mm/dd
  if (parts[0].length === 4) {
    const [yyyy, mm, dd] = parts;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }


  let [p1, p2, yyyy] = parts;

  const num1 = Number(p1);
  const num2 = Number(p2);

  //  dd/mm/yyyy
  if (num1 > 12 && num2 <= 12) {
    return `${yyyy}-${p2.padStart(2, "0")}-${p1.padStart(2, "0")}`;
  }

  //  mm/dd/yyyy
  if (num2 > 12 && num1 <= 12) {
    return `${yyyy}-${p1.padStart(2, "0")}-${p2.padStart(2, "0")}`;
  }

  // ambiguous (e.g. 11/10/2016)
  // Indian receipt assume dd/mm/yyyy
  return `${yyyy}-${p2.padStart(2, "0")}-${p1.padStart(2, "0")}`;
};

export const extractDate = (text) => {
  console.log("OCR extracted Text : ", text);

  const dateRegex = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/;

  const dateMatch = text.match(dateRegex);

  if (!dateMatch) {
    console.log("Bill date not found");
    return "";
  }

  console.log("Date Matched : ", dateMatch[0]);

  const formattedDate = formatDatetoInput(dateMatch[0]);

  console.log("Formatted Date : ", formattedDate);

  return formattedDate;
};
