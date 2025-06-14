export const copyArraysAsTableToClipboard = (
  array1: any[],
  array2: any[]
): void => {
  const maxLength = Math.max(array1.length, array2.length);
  const rows: string[] = [];

  for (let i = 0; i < maxLength; i++) {
    const col1 = array1[i] !== undefined ? array1[i] : "";
    const col2 = array2[i] !== undefined ? array2[i] : "";
    rows.push(`${col1}\t${col2}`);
  }

  const tableString = rows.join("\n");

  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(tableString);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = tableString;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};
