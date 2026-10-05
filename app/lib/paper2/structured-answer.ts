export interface Paper2AnswerTable {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

function pipeCells(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

/** Parse the compact pipe-row format used by authored Paper 2 answer tables. */
export function parsePaper2AnswerTable(value: string): Paper2AnswerTable | null {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2 || lines.some((line) => !line.includes("|"))) return null;
  const headers = pipeCells(lines[0]);
  if (headers.length < 2 || headers.some((header) => !header)) return null;
  const possibleDivider = pipeCells(lines[1]);
  const hasDivider = possibleDivider.length === headers.length && possibleDivider.every((cell) => /^:?-{3,}:?$/.test(cell));
  const rows = lines.slice(hasDivider ? 2 : 1).map(pipeCells);
  if (rows.length === 0 || rows.some((row) => row.length !== headers.length)) return null;
  return { headers, rows };
}
