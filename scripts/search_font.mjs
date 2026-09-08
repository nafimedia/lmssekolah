import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain';
const convs = fs.readdirSync(brainDir);

for (const c of convs) {
  const logFile = path.join(brainDir, c, '.system_generated', 'logs', 'transcript.jsonl');
  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, 'utf-8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('"USER_INPUT"') && (line.toLowerCase().includes('font') || line.toLowerCase().includes('huruf') || line.toLowerCase().includes('kamad'))) {
        try {
          const obj = JSON.parse(line);
          console.log(`[${c}] User:`, obj.content);
        } catch (e) {
          console.log(`[${c}] Raw:`, line.slice(0, 200));
        }
      }
    }
  }
}
