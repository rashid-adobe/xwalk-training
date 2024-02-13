import {
  decorateBlock,
  decorateButtons,
  decorateIcons,
  loadBlock,
} from './aem.js';

const connectionPrefix = 'urn:aemconnection:';

async function handleEditorUpdate(event) {
  const { detail } = event;

  const resource = detail?.request?.target?.resource;
  if (!resource) return;
  const updates = detail?.response?.updates;
  if (!updates.length) return;
  const { content } = updates[0];

  const element = document.querySelector(`[data-aue-resource="${resource}"]`);
  if (element) {
    const block = element.parentElement?.closest('.block') || element?.closest('.block');
    if (block) {
      const blockResource = block.getAttribute('data-aue-resource');
      if (!blockResource || !blockResource.startsWith(connectionPrefix)) return;
      const newBlockDocument = new DOMParser().parseFromString(content, 'text/html');
      const newBlock = newBlockDocument?.querySelector(`[data-aue-resource="${blockResource}"]`);
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
      }

      return;
    }

    const updatedSection = new DOMParser().parseFromString(content, 'text/html');
    const newElement = updatedSection?.querySelector(`[data-aue-resource="${resource}"]`);
    if (newElement) {
      newElement.style.display = 'none';
      element.insertAdjacentElement('afterend', newElement);
      // decorate buttons and icons
      decorateButtons(newElement);
      decorateIcons(newElement);
      // remove the old element and show the new one
      element.remove();
      newElement.style.display = null;
    }
  }
}

document.querySelector('main')?.addEventListener('aue:content-patch', handleEditorUpdate);
