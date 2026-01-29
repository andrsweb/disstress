import path from 'path';
import fs from 'fs/promises';

const MODAL_JS_PATH = path.resolve('dev/src/js/common/modal.js');
const COMMON_JS_PATH = path.resolve('dev/src/js/common/common.js');

async function ensureModalScriptFile() {
	let exists = false;

	try {
		await fs.access(MODAL_JS_PATH);
		exists = true;
	} catch (error) {}

	if (exists) {
		console.log('File dev/src/js/common/modal.js already exists, skipping creation.');
		return false;
	}

	const lines = [
		"import {disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks} from 'body-scroll-lock';",
		'',
		'document.addEventListener("DOMContentLoaded", () => {',
		'\t"use strict";',
		'\t\tnew ModalManager();',
		'});',
		'',
		'class ModalManager {',
		'\tconstructor() {',
		'\t\tthis.ACTIVE_CLASS = "modal-active";',
		'\t\tthis.ATTRIBUTE_OPEN = "data-modal-open";',
		'\t\tthis.ATTRIBUTE_ID = "data-modal-id";',
		'\t\tthis.ATTRIBUTE_CLOSE = "data-modal-close";',
		'\t\tthis.openModals = new Set();',
		'',
		'\t\tthis.handleDocumentClick = this.handleDocumentClick.bind(this);',
		'\t\tthis.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);',
		'',
		'\t\tthis.init();',
		'\t}',
		'',
		'\tinit() {',
		'\t\tdocument.addEventListener("click", this.handleDocumentClick);',
		'\t\tdocument.addEventListener("keydown", this.handleDocumentKeydown);',
		'\t}',
		'',
		'\tgetModalById(id) {',
		'\t\tif (!id) {',
		'\t\t\treturn null;',
		'\t\t}',
		'',
		'\t\treturn document.querySelector(\'.modal[\' + this.ATTRIBUTE_ID + \'="\' + id + \'"]\');',
		'\t}',
		'',
		'\tisModal(element) {',
		'\t\treturn Boolean(element) && element.classList && element.classList.contains("modal");',
		'\t}',
		'',
		'\topenModal(modal) {',
		'\t\tif (!this.isModal(modal)) {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tif (this.openModals.has(modal)) {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tmodal.classList.add(this.ACTIVE_CLASS);',
		'\t\ttry {',
		'\t\t\tdisableBodyScroll(modal);',
		'\t\t} catch (error) {}',
		'',
		'\t\tthis.openModals.add(modal);',
		'\t}',
		'',
		'\tcloseModal(modal) {',
		'\t\tif (!this.isModal(modal)) {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tconst wasOpen = this.openModals.has(modal);',
		'\t\tmodal.classList.remove(this.ACTIVE_CLASS);',
		'',
		'\t\tif (!wasOpen) {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\ttry {',
		'\t\t\tenableBodyScroll(modal);',
		'\t\t} catch (error) {}',
		'',
		'\t\tthis.openModals.delete(modal);',
		'',
		'\t\tif (!this.openModals.size) {',
		'\t\t\ttry {',
		'\t\t\t\tclearAllBodyScrollLocks();',
		'\t\t\t} catch (error) {}',
		'\t\t}',
		'\t}',
		'',
		'\tcloseTopModal() {',
		'\t\tif (!this.openModals.size) {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tconst modals = Array.from(this.openModals);',
		'\t\tconst last = modals[modals.length - 1];',
		'',
		'\t\tif (last) {',
		'\t\t\tthis.closeModal(last);',
		'\t\t}',
		'\t}',
		'',
		'\thandleDocumentClick(event) {',
		'\t\tconst target = event.target;',
		'',
		'\t\tif (!target) {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tconst openTrigger = target.closest(\'[\' + this.ATTRIBUTE_OPEN + \']\');',
		'',
		'\t\tif (openTrigger) {',
		'\t\t\tconst id = openTrigger.getAttribute(this.ATTRIBUTE_OPEN);',
		'\t\t\tconst modal = this.getModalById(id);',
		'',
		'\t\t\tif (modal) {',
		'\t\t\t\tthis.openModal(modal);',
		'\t\t\t}',
		'',
		'\t\t\tevent.preventDefault();',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tconst closeTrigger = target.closest(\'[\' + this.ATTRIBUTE_CLOSE + \']\');',
		'',
		'\t\tif (closeTrigger) {',
		'\t\t\tconst modal = closeTrigger.closest(".modal");',
		'',
		'\t\t\tif (modal) {',
		'\t\t\t\tthis.closeModal(modal);',
		'\t\t\t}',
		'',
		'\t\t\tevent.preventDefault();',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tconst backdrop = target.closest(".modal");',
		'',
		'\t\tif (backdrop && target === backdrop) {',
		'\t\t\tthis.closeModal(backdrop);',
		'\t\t}',
		'\t}',
		'',
		'\thandleDocumentKeydown(event) {',
		'\t\tif (event.key !== "Escape" && event.key !== "Esc") {',
		'\t\t\treturn;',
		'\t\t}',
		'',
		'\t\tthis.closeTopModal();',
		'\t}',
		'}'
	];

	await fs.mkdir(path.dirname(MODAL_JS_PATH), {recursive: true});
	await fs.writeFile(MODAL_JS_PATH, `${lines.join('\n')}\n`);
	console.log('Base modal script created: dev/src/js/common/modal.js');
	return true;
}

async function ensureCommonImport() {
	let content;

	try {
		content = await fs.readFile(COMMON_JS_PATH, 'utf8');
	} catch (error) {
		return false;
	}

	if (content.includes("import './modal';")) {
		console.log('Import ./modal is already present in dev/src/js/common/common.js.');
		return false;
	}

	const updated = `import './modal';\n\n${content}`;
	await fs.writeFile(COMMON_JS_PATH, updated);
	console.log('File dev/src/js/common/common.js updated: added import ./modal.');
	return true;
}

export async function enableModalTemplate() {
	let updated = false;

	try {
		const createdScript = await ensureModalScriptFile();
		if (createdScript) {
			updated = true;
		}
	} catch (error) {
		console.log('Failed to create base modal script.');
		console.log(String(error));
	}

	try {
		const updatedImport = await ensureCommonImport();
		if (updatedImport) {
			updated = true;
		}
	} catch (error) {
		console.log('Failed to update dev/src/js/common/common.js for modals.');
		console.log(String(error));
	}

	if (updated) {
		console.log('Base modal template is enabled. Use .modal and .modal-active classes and data attributes data-modal-id, data-modal-open, data-modal-close.');
	} else {
		console.log('Modal template was already configured.');
	}
}
