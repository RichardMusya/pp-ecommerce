import fs from 'fs';
import path from 'path';

test('env example exists and contains DATABASE_URL', () => {
  const p = path.resolve(process.cwd(), '.env.example');
  const s = fs.readFileSync(p, 'utf8');
  expect(s).toMatch(/DATABASE_URL/);
});
