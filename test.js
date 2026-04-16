function generateUnicodeEscapedRows(start) {
  const rows = [];

  for (let row = 0; row < 16; row++) {
    let line = "";
    for (let col = 0; col < 16; col++) {
      const code = start + row * 16 + col;
      const hex = code.toString(16).toUpperCase().padStart(4, "0");
      line += `\\u${hex}`;
    }
    rows.push(line);
  }

  return rows;
}

const chars = generateUnicodeEscapedRows(0x2600);

console.log(chars)