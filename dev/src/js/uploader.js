import * as FilePond from 'filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import Sortable from 'sortablejs';

document.addEventListener('DOMContentLoaded', () => {
	'use strict';

	initUploader();
});

export const initUploader = () => {
	const pondInput = document.querySelector('.filepond');
	if (!pondInput) return;

	const uGrid = document.getElementById('user-grid');
	const pGrid = document.getElementById('presets-grid');
	if (!uGrid || !pGrid) return;

	const syncToHidden = () => {
		const form = pondInput.closest('form');
		if (!form) return;

		let hidden = form.querySelector('input[name="final_image_selection"]');
		if (!hidden) {
			hidden = document.createElement('input');
			hidden.type = 'hidden';
			hidden.name = 'final_image_selection';
			form.appendChild(hidden);
		}

		const userIds = Array.from(uGrid.querySelectorAll('.uploader-item')).map(el => el.dataset.id);
		const presetIds = Array.from(pGrid.querySelectorAll('.uploader-item.is-selected')).map(el => el.dataset.id);

		const payload = {
			user: userIds,
			presets: presetIds,
			fullOrder: [...userIds, ...presetIds]
		};

		hidden.value = JSON.stringify(payload);
		hidden.dispatchEvent(new Event('change', {bubbles: true}));
	};

	if (pondInput.dataset.uploaderInitialized) {
		syncToHidden();

		return;
	}
	pondInput.dataset.uploaderInitialized = 'true';

	const handleGridClick = (e) => {
		const item = e.target.closest('.uploader-item');
		if (!item) return;

		if (e.target.closest('.uploader-item-delete')) {
			e.stopPropagation();

			const pond = FilePond.find(pondInput);
			if (pond) {
				pond.removeFile(item.dataset.id);
			}
			return;
		}

		if (item.parentElement === pGrid) {
			item.classList.toggle('is-selected');
			syncToHidden();
		}
	};

	uGrid.addEventListener('click', handleGridClick);
	pGrid.addEventListener('click', handleGridClick);

	const createItemEl = (file) => {
		const el = document.createElement('div');
		el.className = `uploader-item ${file.canDelete ? 'is-uploaded' : (file.isSelected ? 'is-selected' : '')}`;
		el.dataset.id = file.id;

		const img = document.createElement('img');
		img.src = file.url;
		img.alt = 'Unit image';
		el.append(img);

		if (file.canDelete) {
			const delBtn = document.createElement('button');
			delBtn.className = 'uploader-item-delete';
			delBtn.type = 'button';
			delBtn.setAttribute('aria-label', 'Remove image');
			el.append(delBtn);
		}
		return el;
	};

	const updateUIState = () => {
		const uHeader = document.getElementById('user-header');
		const dropzone = document.getElementById('uploader-dropzone');
		const hasUserFiles = uGrid.children.length > 0;

		if (uHeader) uHeader.classList.toggle('is-visible', hasUserFiles);
		if (dropzone) dropzone.classList.toggle('is-hidden', hasUserFiles);
		syncToHidden();
	};

	FilePond.registerPlugin(FilePondPluginImagePreview);
	const pond = FilePond.create(pondInput, {
		allowMultiple: true,
		maxFiles: 50,
		labelIdle: 'Drag and drop images here or <span>Browse files</span>',
		instantUpload: false,
		storeAsFile: true,
	});

	pond.on('addfile', (err, file) => {
		if (err) return;
		const itemEl = createItemEl({
			id: file.id,
			url: URL.createObjectURL(file.file),
			canDelete: true
		});
		uGrid.append(itemEl);
		updateUIState();
	});

	pond.on('removefile', (err, file) => {
		const el = uGrid.querySelector(`[data-id="${file.id}"]`);
		if (el) {
			const img = el.querySelector('img');
			if (img) URL.revokeObjectURL(img.src);
			el.remove();
		}
		updateUIState();
	});

	document.getElementById('trigger-browse')?.addEventListener('click', () => pond.browse());
	document.getElementById('select-all-images')?.addEventListener('click', () => {
		const items = pGrid.querySelectorAll('.uploader-item');
		const areAllSelected = Array.from(items).every(el => el.classList.contains('is-selected'));
		items.forEach(el => el.classList.toggle('is-selected', !areAllSelected));
		syncToHidden();
	});

	[uGrid, pGrid].forEach(grid => {
		Sortable.create(grid, {
			animation: 150,
			ghostClass: 'sortable-ghost',
			onEnd: () => syncToHidden()
		});
	});

	// Initial syc
	syncToHidden();
};

window.initUploader = initUploader;