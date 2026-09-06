import { translateUiText } from './ja.js';

const ATTRIBUTES = ['title', 'aria-label', 'placeholder'] as const;

/**
 * User-authored, model-authored, diagnostic, identifier, or copy-as-contract surfaces.
 * Presentation localization must never mutate these values in the DOM.
 */
const PROTECTED = [
  'script',
  'style',
  'code',
  'pre',
  'textarea',
  '#timeline',
  '#handoffBox',
  '#sessionList',
  '#inputQueue',
  '#taskPlanPreview',
  '#finishQueue',
  '#activeGoalRow',
  '#composerImages',
  '#rootList',
  '#connectorCards',
  '#fullFeed',
  '#homeFeed',
  '#swarmList',
  '#goalModelList'
].join(',');

function protectedNode(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return Boolean(element?.closest(PROTECTED));
}

function translateTextNode(node: Text): void {
  if (protectedNode(node)) return;
  const current = node.data;
  const translated = translateUiText(current);
  if (translated === current) return;
  const leading = current.match(/^\s*/)?.[0] ?? '';
  const trailing = current.match(/\s*$/)?.[0] ?? '';
  node.data = `${leading}${translated}${trailing}`;
}

function translateElement(element: Element): void {
  if (protectedNode(element)) return;
  for (const attribute of ATTRIBUTES) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    const translated = translateUiText(current);
    if (translated !== current) element.setAttribute(attribute, translated);
  }
  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) translateTextNode(child as Text);
    else if (child.nodeType === Node.ELEMENT_NODE) translateElement(child as Element);
  }
}

let installed = false;

/** Japanese presentation for app-owned chrome only; user/model content remains byte-for-byte untouched. */
export function installJapaneseUi(): void {
  if (
    installed ||
    typeof document === 'undefined' ||
    typeof MutationObserver === 'undefined' ||
    typeof Node === 'undefined' ||
    typeof Element === 'undefined'
  ) return;
  installed = true;
  document.documentElement.lang = 'ja';
  translateElement(document.documentElement);

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData' && record.target.nodeType === Node.TEXT_NODE) {
        translateTextNode(record.target as Text);
        continue;
      }
      if (record.type === 'attributes' && record.target instanceof Element) {
        translateElement(record.target);
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node as Element);
      }
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...ATTRIBUTES]
  });
}
