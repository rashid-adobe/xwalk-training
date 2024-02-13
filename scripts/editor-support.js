import {
  decorateBlock,
  decorateButtons,
  decorateIcons,
  loadBlock,
} from './aem.js';
// eslint-disable-next-line import/no-unresolved
import { decorateRichtext } from './editor-support-rte.js';

const connectionPrefix = 'urn:aemconnection:';

async function handleEditorUpdate(event) {
  const { detail } = event;

  const resource = detail?.request?.target?.resource;
  if (!resource) return;
  const updates = detail?.response?.updates;
  if (!updates.length) return;
  const { content } = updates[0];

  const parsedUpdate = new DOMParser().parseFromString(content, 'text/html');
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);
  // proceed only if the updated element exists and is not a section
  if (element && !element.matches('.section')) {
    const block = element.parentElement?.closest('.block') || element?.closest('.block');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      if (!blockResource || !blockResource.startsWith(connectionPrefix)) return;
      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      if (newBlock) {
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);
        // decorate buttons and icons
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        // decorate and load the block
        decorateBlock(newBlock);
        await loadBlock(newBlock);
        // remove the old block and show the new one
        block.remove();
        newBlock.style.display = null;
        return;
      }
    } else {
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      if (newElements.length) {
        const { parentElement } = element;
        element.replaceWith(...newElements);
        // decorate buttons and icons
        decorateButtons(parentElement);
        decorateIcons(parentElement);
        decorateRichtext(parentElement);
        return;
      }
    }
  }

  window.location.reload();
}

document.querySelector('main')?.addEventListener('aue:content-patch', handleEditorUpdate);
document.querySelector('main')?.addEventListener('aue:content-update', handleEditorUpdate);
