import { glossary } from "./content.mjs";
const aliases = {
  Melded: "Meld",
  Melding: "Meld",
  Melds: "Meld",
  Siphons: "Siphon",
  Siphoned: "Siphon",
  Piercing: "Pierce",
  Corrodes: "Corrode",
  Corrosion: "Corrode",
  Locked: "Lock",
  Locks: "Lock",
  Frozen: "Freeze",
  Freezes: "Freeze",
  Severed: "Sever",
  Severs: "Sever",
  Attuned: "Attune",
  Attunement: "Attune",
  Allies: "Ally",
  Wards: "Ward",
  Shields: "Shield",
  Charges: "Charge",
  Charging: "Charge",
  Recalled: "Recall",
  Recalls: "Recall",
  Stacks: "Stack",
  Stacked: "Stack",
  Stacking: "Stack",
  Constructs: "Construct",
  Burns: "Burn",
  Poisoned: "Poison",
  Corroded: "Corrode",
  Hexes: "Hex",
  Cursed: "Curse",
  Curses: "Curse",
  Resists: "Resist",
  Resistance: "Resist",
  Resistances: "Resist",
  Shifted: "Shift",
  Intercept: "Ally",
  Intercepts: "Ally",
  Interception: "Ally",
  Discarded: "Discard",
  Activations: "Activation allowance",
  Acts: "Activation allowance",
  Adjacency: "Adjacent",
  "Single-use": "Single use",
  Gems: "Gem",
  Socketed: "Socket",
  Socketing: "Socket",
  Unsocket: "Socket",
  Bracelets: "Bracelet",
  Rings: "Ring",
  Necklaces: "Necklace",
  Crowns: "Crown",
  Motes: "Mote",
  Eidolons: "Eidolon",
  Archons: "Archon",
  Strata: "Stratum",
  Tells: "Tell",
  Spells: "Spell",
  Objects: "Object",
  Restlessness: "Restless",
};
const terms = new Map(Object.keys(glossary).map((k) => [k.toLowerCase(), k]));
for (const [alias, key] of Object.entries(aliases))
  terms.set(alias.toLowerCase(), key);
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = new RegExp(
  "\\b(?:" +
    [...terms.keys()]
      .sort((a, b) => b.length - a.length)
      .map(escape)
      .join("|") +
    ")\\b",
  "gi",
);
export function keywordDefinition(term) {
  const key = terms.get(term.toLowerCase());
  return key ? { key, description: glossary[key] } : null;
}
const excluded =
  "script,style,textarea,input,select,option,svg,[contenteditable],.key,[data-keyword],#hover-help,.reveal-back";
export function annotateKeywords(root) {
  const nodes = [];
  if (root.nodeType === Node.TEXT_NODE) nodes.push(root);
  else if (root.nodeType === Node.ELEMENT_NODE) {
    if (root.matches(excluded) || root.closest(excluded)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
  }
  for (const node of nodes) {
    if (!node.parentElement || node.parentElement.closest(excluded)) continue;
    const value = node.nodeValue,
      matches = [...value.matchAll(pattern)];
    if (!matches.length) continue;
    const fragment = document.createDocumentFragment();
    let at = 0;
    for (const match of matches) {
      fragment.append(document.createTextNode(value.slice(at, match.index)));
      const term = keywordDefinition(match[0]),
        span = document.createElement("abbr");
      span.className = "key";
      span.dataset.keyword = term.key;
      span.dataset.tooltip = `${term.key}: ${term.description}`;
      span.textContent = match[0];
      fragment.append(span);
      at = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(value.slice(at)));
    node.replaceWith(fragment);
  }
}
export function installKeywordHelp() {
  annotateKeywords(document.body);
  const observer = new MutationObserver((records) => {
    const roots = new Set();
    for (const record of records) {
      if (record.type === "characterData") roots.add(record.target);
      else for (const node of record.addedNodes) roots.add(node);
    }
    for (const root of roots) if (root.isConnected) annotateKeywords(root);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  return observer;
}
