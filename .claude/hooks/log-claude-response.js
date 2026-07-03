#!/usr/bin/env node
// Stop hook: appends Claude's final response for this turn to ai-log.md at the project root.
// Reads the transcript_path from stdin JSON and pulls the assistant text
// produced since the last real user message.
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

  const transcriptPath = data.transcript_path;
  if (!transcriptPath || !fs.existsSync(transcriptPath)) process.exit(0);

  const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
  const entries = [];
  for (const line of lines) {
    if (!line) continue;
    try {
      entries.push(JSON.parse(line));
    } catch (e) {
      // skip malformed lines
    }
  }

  // Find the last real user message (not a tool_result-only message).
  let lastUserIdx = -1;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type === 'user' && e.message && e.message.role === 'user') {
      const content = e.message.content;
      const isToolResultOnly =
        Array.isArray(content) && content.length > 0 && content.every((b) => b.type === 'tool_result');
      if (!isToolResultOnly) {
        lastUserIdx = i;
        break;
      }
    }
  }

  const textParts = [];
  for (let i = lastUserIdx + 1; i < entries.length; i++) {
    const e = entries[i];
    if (e.type === 'assistant' && e.message && Array.isArray(e.message.content)) {
      for (const block of e.message.content) {
        if (block.type === 'text' && block.text) textParts.push(block.text);
      }
    }
  }

  const responseText = textParts.join('\n\n').trim();
  if (!responseText) process.exit(0);

  if (!fs.existsSync(LOG_PATH)) {
    fs.writeFileSync(LOG_PATH, '# AI Conversation Log\n');
  }

  const timestamp = new Date().toISOString();
  const entry = `\n## Claude — ${timestamp}\n\n${responseText}\n`;
  fs.appendFileSync(LOG_PATH, entry);
  process.exit(0);
});
