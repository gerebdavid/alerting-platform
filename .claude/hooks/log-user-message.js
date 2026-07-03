#!/usr/bin/env node
// UserPromptSubmit hook: appends the user's message to ai-log.md at the project root.
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', '..', 'ai-log.md');

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let data;
  try {
    data = JSON.parse(input);
  } catch (e) {
    process.exit(0);
  }

  const prompt = typeof data.prompt === 'string' ? data.prompt : '';
  if (!prompt.trim()) process.exit(0);

  if (!fs.existsSync(LOG_PATH)) {
    fs.writeFileSync(LOG_PATH, '# AI Conversation Log\n');
  }

  const timestamp = new Date().toISOString();
  const entry = `\n## User — ${timestamp}\n\n${prompt}\n`;
  fs.appendFileSync(LOG_PATH, entry);
  process.exit(0);
});
