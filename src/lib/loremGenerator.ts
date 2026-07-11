const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function mulberry32(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic placeholder body text, seeded by a stable key (a case id) so the same
 * case always renders the same description without ever shipping precomputed text or
 * a text-generation library to the browser.
 */
export function generateDescription(seedKey: string, sentenceCount = 4): string {
  const random = mulberry32(hashString(seedKey));
  const pickWord = () => WORDS[Math.floor(random() * WORDS.length)];

  const sentences = Array.from({ length: sentenceCount }, () => {
    const length = 6 + Math.floor(random() * 10);
    const words = Array.from({ length }, pickWord).join(" ");
    return words.charAt(0).toUpperCase() + words.slice(1) + ".";
  });

  return sentences.join(" ");
}
