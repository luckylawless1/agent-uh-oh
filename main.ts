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

// Gate check, mirroring the competition's sealed scorer: UTF-8 text of
// 1 to 99 characters, not only white space, exactly one word, nothing
// attached. Fail loudly instead of writing a bad entry.
if (WORD.length < 1 || WORD.length > 99) {
  throw new Error(`word must be 1-99 characters, got ${WORD.length}`);
}
if (!/^\S+$/.test(WORD)) {
  throw new Error("word must be a single word with no whitespace");
}
if (Buffer.byteLength(WORD, "utf8") !== WORD.length) {
  throw new Error("word must be plain ASCII so bytes equal characters");
}

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
