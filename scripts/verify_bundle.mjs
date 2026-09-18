import { readFileSync } from 'fs';

const js = readFileSync('dist/assets/index-uA2ZAEIv.js', 'utf8');

const mustBeAbsent = [
  ['MIỄN PHÍ VẬN CHUY (Romanian hybrid)', 'MIỄN PHÍ VẬN CHUY'],
  ['pentru (Romanian)', 'pentru'],
  ['și (Romanian and)', 'și'],
  ['hardcoded 0.85', '0.85'],
];

const mustBePresent = [
  ['miễn phí vận chuyển', 'miễn phí vận chuyển'],
  ['Zalo/WhatsApp/SMS/email', 'Zalo/WhatsApp/SMS/email'],
  ['dynamic Tiết kiệm {rate}%', 'Tiết kiệm '],
  ['Đăng ký (Giảm {rate}%)', 'Đăng ký (Giảm'],
  ['Cùng mức giá −{rate}%', 'Cùng mức giá'],
  ['Đăng ký để nhận ưu đãi 15%', 'Đăng ký để nhận ưu đãi 15%'],
];

let fail = 0;
for (const [label, needle] of mustBeAbsent) {
  const found = js.includes(needle);
  if (found) { console.log(`FAIL | absent expected: ${label}`); fail = 1; }
  else console.log(`PASS | ${label} absent`);
}
for (const [label, needle] of mustBePresent) {
  const found = js.includes(needle);
  if (!found) { console.log(`FAIL | present expected: ${label}`); fail = 1; }
  else console.log(`PASS | ${label} present`);
}
process.exit(fail);