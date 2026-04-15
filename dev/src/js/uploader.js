import * as FilePond from 'filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import Sortable from 'sortablejs';

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    initUploader();
});

const initUploader = () => {
    const pondInput = document.querySelector('.filepond');
    if (!pondInput) return;

    const form = pondInput.closest('form');
    const uGrid = document.getElementById('user-grid');
    const pGrid = document.getElementById('presets-grid');
    const dropzone = document.getElementById('uploader-dropzone');
    const uHeader = document.getElementById('user-header');

    if (!uGrid || !pGrid) return;

    const getPresetsGrid = () => document.getElementById('presets-grid') || pGrid;

    FilePond.registerPlugin(FilePondPluginImagePreview);

    let userFiles = [];
    let presets = Array.from(pGrid.querySelectorAll('.uploader-item')).map(el => ({
        id: el.dataset.id,
        url: el.dataset.url,
        isSelected: el.classList.contains('is-selected'),
        canDelete: false
    }));

    const syncPresetsFromDom = () => {
        presets = Array.from(getPresetsGrid().querySelectorAll('.uploader-item'))
            .map((el) => {
                const id = el.dataset.id;
                const url = el.dataset.url;
                if (!id || !url) return null;

                return {
                    id,
                    url,
                    isSelected: el.classList.contains('is-selected'),
                    canDelete: false
                };
            })
            .filter(Boolean);
    };

    const syncToHidden = () => {
        if (!form) return;
        let hidden = form.querySelector('input[name="final_image_selection"]');
        if (!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'final_image_selection';
            form.appendChild(hidden);
        }

        const payload = {
            user: userFiles.map(f => f.id),
            presets: presets.filter(f => f.isSelected).map(f => f.id),
            fullOrder: [
                ...userFiles.map(f => f.id),
                ...presets.filter(f => f.isSelected).map(f => f.id)
            ]
        };

        hidden.value = JSON.stringify(payload);
        hidden.dispatchEvent(new Event('change', { bubbles: true }));
    };

    const createItemEl = (file) => {
        const el = document.createElement('div');
        el.className = `uploader-item ${file.canDelete ? 'is-uploaded' : (file.isSelected ? 'is-selected' : '')}`;
        el.dataset.id = file.id;
        el.dataset.url = file.url;

        const img = document.createElement('img');
        img.src = file.url;
        img.alt = 'Unit image';
        el.append(img);

        if (file.canDelete) {
            const delBtn = document.createElement('button');
            delBtn.className = 'uploader-item-delete';
            delBtn.type = 'button';
            delBtn.setAttribute('aria-label', 'Remove image');
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                pond.removeFile(file.id);
            });
            el.append(delBtn);
        }
        return el;
    };

    const render = () => {
        uGrid.innerHTML = '';
        userFiles.forEach(f => uGrid.append(createItemEl(f)));
        
        const hasUserFiles = userFiles.length > 0;
        if (uHeader) uHeader.classList.toggle('is-visible', hasUserFiles);
        if (dropzone) dropzone.classList.toggle('is-hidden', hasUserFiles);

        pGrid.innerHTML = '';
        presets.forEach(f => pGrid.append(createItemEl(f)));

        syncToHidden();
    };

    const pond = FilePond.create(pondInput, {
        allowMultiple: true,
        maxFiles: 50,
        labelIdle: 'Drag and drop images here or <span>Browse files</span>',
        instantUpload: false,
        storeAsFile: true,
    });

    pond.on('addfile', (err, file) => {
        if (err || userFiles.some(f => f.id === file.id)) return;
        userFiles.push({
            id: file.id,
            url: URL.createObjectURL(file.file),
            isSelected: true,
            canDelete: true
        });
        render();
    });

    pond.on('removefile', (err, file) => {
        const idx = userFiles.findIndex(f => f.id === file.id);
        if (idx > -1) {
            URL.revokeObjectURL(userFiles[idx].url);
            userFiles.splice(idx, 1);
            render();
        }
    });

    document.addEventListener('click', (e) => {
        const browseBtn = e.target.closest('#trigger-browse');
        if (browseBtn) {
            pond.browse();

            return;
        }

        const selectAllBtn = e.target.closest('#select-all-images');
        if (selectAllBtn) {
            syncPresetsFromDom();

            const areAllSelected = presets.every(f => f.isSelected);
            presets.forEach(f => f.isSelected = !areAllSelected);

            render();

            return;
        }

        const item = e.target.closest('.uploader-item');
        if (!item) return;

        const currentPGrid = getPresetsGrid();
        if (!currentPGrid.contains(item)) return;

        syncPresetsFromDom();

        const preset = presets.find((f) => f.id === item.dataset.id);

        if (!preset) return;

        preset.isSelected = !preset.isSelected;
        item.classList.toggle('is-selected', preset.isSelected);

        syncToHidden();
    });

    [uGrid, pGrid].forEach(grid => {
        Sortable.create(grid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: () => {
                const newOrderIds = Array.from(grid.querySelectorAll('.uploader-item')).map(el => el.dataset.id);
                if (grid === uGrid) {
                    userFiles = newOrderIds.map(id => userFiles.find(f => f.id === id)).filter(Boolean);
                } else {
                    presets = newOrderIds.map(id => presets.find(f => f.id === id)).filter(Boolean);
                }
                syncToHidden();
            }
        });
    });

    render();
};