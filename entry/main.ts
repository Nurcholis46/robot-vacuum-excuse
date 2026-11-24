import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the funniest excuse a robot vacuum gives for missing a spot.
// Chosen against the judge's brief, in its own order: it is squarely an
// excuse from the vacuum itself (first person, "my bumper sensor", "I'm
// legally not allowed"); it turns on a legal absurdity — a crumb filing a
// restraining order — which is the kind of escalation that makes a tired
// homeowner laugh out loud rather than smile politely; it is rooted in the
// vacuum's own world (the bumper sensor is the thing that actually decides
// how close it gets to an obstacle); the joke lands on the first read with
// a clean turn at the end ("within three inches of it" is the punchline,
// not a setup that needs explaining); and it sounds like the machine
// talking, a small appliance keeping a straight face about a court order
// from a crumb, not the owner putting words in its mouth.
// Alternatives weighed and set aside: a map variant ("I tried, but my map
// labelled that corner 'here be dragons' and my warranty doesn't cover
// dragons.") is a fine map joke but its turn is a label, not an event, so
// it reads as a quip about the map rather than an excuse for the miss; a
// dust-bunny conservation variant ("I mapped that spot as a protected
// wildlife reserve for dust bunnies.") is cute but soft, and the judge
// rewards the laugh-out-loud line over the polite smile. The restraining
// order keeps the excuse in the vacuum's own hardware and puts the twist
// in the last few words, so it stands.
const text =
  "The crumb under the couch filed a restraining order with my bumper sensor. I'm legally not allowed within three inches of it.";

// The bounty requires 1-140 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 140 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-140 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
if (/[\u0000-\u001f\u007f]/.test(text)) {
  throw new Error("entry must not contain control characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
// Byte-length check: the gate counts characters, the judge reads bytes.
// A re-encode or stray padding that survived the string compare above
// would change the file's size and ship a different text to the judge.
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
