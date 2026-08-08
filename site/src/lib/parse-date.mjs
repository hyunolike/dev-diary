const LINE = /^>\s*(?:📅\s*)?(?:작성날짜|탐구 일자|작성일)\s*[::]\s*(.+)$/m;
const YMD_FULL = /^(\d{4})-(\d{1,2})-(\d{1,2})/;
const YMD_SHORT = /^(\d{2})\.(\d{1,2})\.(\d{1,2})/;

const pad = (n) => String(n).padStart(2, '0');

export function parsePostDate(markdown) {
  const line = markdown.match(LINE);
  if (!line) return null;

  const value = line[1].trim();

  const full = value.match(YMD_FULL);
  if (full) return `${full[1]}-${pad(full[2])}-${pad(full[3])}`;

  const short = value.match(YMD_SHORT);
  if (short) return `20${short[1]}-${pad(short[2])}-${pad(short[3])}`;

  return null;
}
