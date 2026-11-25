// The Agent's Uh-Oh — make.fun competition u-danu-the-agent-s-uh-oh-4c0911e4
// Writes exactly one word to /output/entry.txt: the word an agent says
// when it has no idea what to do.
//
// The word: "recalculating" — the sound of a lost machine. A GPS says it
// the moment it has no idea where it is; an agent says it the moment it
// has no idea what to do. One word, no caption needed, instantly
// repeatable out loud, and fresher than the obvious "uh-oh" or "oops".

import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";

const WORD = "recalculating";
const OUT_DIR = "/output";
const OUT_FILE = "/output/entry.txt";

// Gate bounds, mirroring the competition's sealed scorer: entries are
// UTF-8 text of 1 to 99 characters, exactly one word, nothing attached.
// Named once here so the pre-write and post-write checks can never drift
// apart if the limits ever change.
const MIN_LEN = 1;
const MAX_LEN = 99;

// validate(word) re-runs the full gate against any string — the in-memory
// word before writing, and the text read back from disk afterwards.
// Fail loudly instead of letting a bad entry through.
function validate(word: string, label: string): void {
  if (word.length < MIN_LEN || word.length > MAX_LEN) {
    throw new Error(`${label} must be ${MIN_LEN}-${MAX_LEN} characters, got ${word.length}`);
  }
  if (!/^\S+$/.test(word)) {
    throw new Error(`${label} must be a single word with no whitespace`);
  }
  if (Buffer.byteLength(word, "utf8") !== word.length) {
    throw new Error(`${label} must be plain ASCII so bytes equal characters`);
  }
}

validate(WORD, "word");

// Ensure the output directory exists. Never delete the /output root itself:
// only clear its previous contents.
mkdirSync(OUT_DIR, { recursive: true });
for (const entry of readdirSync(OUT_DIR)) {
  rmSync(`${OUT_DIR}/${entry}`, { recursive: true, force: true });
}

// Atomic write: write to a temp file in the same directory, then rename,
// so /output/entry.txt is never observed half-written.
const TMP_FILE = "/output/.entry.txt.tmp";
writeFileSync(TMP_FILE, WORD, "utf8");
renameSync(TMP_FILE, OUT_FILE);

// Self-check: what landed on disk must be byte-identical to the word.
if (readFileSync(OUT_FILE, "utf8") !== WORD) {
  throw new Error("written entry does not match the word");
}

// Post-write verification: re-read the raw bytes from disk and re-run the
// full gate against what was actually written, not just the in-memory word.
// This catches a truncated write, a stray newline, or any encoding drift
// between the string and the bytes on disk.
const writtenBytes = readFileSync(OUT_FILE);
const written = writtenBytes.toString("utf8");
if (writtenBytes.length !== WORD.length) {
  throw new Error(`written entry is ${writtenBytes.length} bytes, expected ${WORD.length}`);
}
// Same gate as before the write, now run against the text on disk.
validate(written, "written entry");
if (written !== WORD) {
  throw new Error("written entry does not match the word");
}
