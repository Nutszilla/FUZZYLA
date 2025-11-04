/* eslint-disable */
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const EXCEL_PATH = process.env.TARIFF_XLSX || 'F:/FUZZYLA/Updated National Tariff Schedule 12th january 2025 with CMFTA.xlsx';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'public', 'tariff.json');

function detectColumns(headers) {
  const lower = headers.map(h => String(h || '').toLowerCase());
  const descIdx = lower.findIndex(h => /description|product|commodity|item|goods|desc/.test(h));
  const hsIdx = lower.findIndex(h => /hs|code|tariff|classification/.test(h));
  return { descIdx, hsIdx };
}

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Tariff Excel not found: ${EXCEL_PATH}`);
    process.exit(1);
  }
  const wb = xlsx.readFile(EXCEL_PATH);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
  if (!rows.length) {
    console.error('No rows found in Excel');
    process.exit(1);
  }
  const headers = rows[0];
  // Try header row; if detection fails, try next 3 rows as potential headers
  let { descIdx, hsIdx } = detectColumns(headers);
  if (descIdx === -1 || hsIdx === -1) {
    for (let i = 1; i < Math.min(4, rows.length); i++) {
      const tryHeaders = rows[i];
      const det = detectColumns(tryHeaders);
      if (det.descIdx !== -1 && det.hsIdx !== -1) {
        rows.splice(0, i + 1); // drop all rows up to this header row
        descIdx = det.descIdx;
        hsIdx = det.hsIdx;
        break;
      }
    }
  }
  if (descIdx === -1) {
    console.error('Could not detect description column. Headers sample:', headers);
    process.exit(1);
  }
  if (hsIdx === -1) {
    console.error('Could not detect HS code column. Headers sample:', headers);
    process.exit(1);
  }
  const data = rows.slice(1).map(r => ({
    description: String(r[descIdx] || '').trim(),
    hsCode: String(r[hsIdx] || '').trim()
  })).filter(r => r.description);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data), 'utf8');
  console.log(`Wrote ${data.length} tariff rows to ${OUTPUT_PATH}`);
}

main();


