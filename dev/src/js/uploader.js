import * as FilePond from 'filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import Sortable from 'sortablejs';

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    initUploader();
});

const initUploader = () => {
    // --- Элементы ---
    const userGrid = document.getElementById('user-grid');
    const presetsGrid = document.getElementById('presets-grid');
    const dropzone = document.getElementById('uploader-dropzone');
    const userHeader = document.getElementById('user-header');
    const triggerBrowse = document.getElementById('trigger-browse');
    const selectAllBtn = document.getElementById('select-all-images');
    const inputElement = document.querySelector('.filepond');

    if (!userGrid || !presetsGrid || !inputElement) return;

    FilePond.registerPlugin(FilePondPluginImagePreview);

    // --- Состояние ---
    const MAX_FILES = 50;
    const PRESETS = [
        { id: 'p1', url: '/img/h1.jpg', isSelected: true, canDelete: false },
        { id: 'p2', url: '/img/h2.jpg', isSelected: false, canDelete: false }
    ];

    let userFiles = []; // Файлы, загруженные через FilePond
    let buildingFiles = [...PRESETS]; // Пресеты здания

    // --- Инициализация FilePond ---
    const pond = FilePond.create(inputElement, {
        allowMultiple: true,
        maxFiles: MAX_FILES,
        labelIdle: 'Drag and drop images here or <span>Browse files</span>',
        instantUpload: false,
    });

    // --- Вспомогательные функции ---

    /**
     * Создает карточку изображения
     */
    const createCardDOM = (fileItem) => {
        const item = document.createElement('div');
        item.className = 'uploader-item';
        item.dataset.id = fileItem.id;
        if (fileItem.isSelected) item.classList.add('is-selected');

        const img = document.createElement('img');
        img.src = fileItem.url;

        item.appendChild(img);

        // Кнопка удаления (только для пользовательских фото)
        if (fileItem.canDelete) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'uploader-item-delete';
            deleteBtn.type = 'button';
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                pond.removeFile(fileItem.id);
            });
            item.appendChild(deleteBtn);
        }

        // Клик для выбора
        item.addEventListener('click', () => {
            fileItem.isSelected = !fileItem.isSelected;
            item.classList.toggle('is-selected', fileItem.isSelected);
        });

        return item;
    };

    /**
     * Рендер сеток
     */
    const renderGrids = () => {
        // 1. Сетка пользователя
        userGrid.innerHTML = '';
        userFiles.forEach(f => userGrid.appendChild(createCardDOM(f)));

        // Состояние верхнего блока
        const hasUserFiles = userFiles.length > 0;
        userHeader.classList.toggle('is-visible', hasUserFiles);
        dropzone.classList.toggle('is-hidden', hasUserFiles);

        // 2. Сетка пресетов
        presetsGrid.innerHTML = '';
        buildingFiles.forEach(f => presetsGrid.appendChild(createCardDOM(f)));
    };

    // --- Обработчики FilePond ---

    pond.on('addfile', (error, file) => {
        if (error) return;
        
        if (!userFiles.some(f => f.id === file.id)) {
            userFiles.push({
                id: file.id,
                url: URL.createObjectURL(file.file),
                isSelected: true,
                canDelete: true
            });
            renderGrids();
        }
    });

    pond.on('removefile', (error, file) => {
        const fileData = userFiles.find(f => f.id === file.id);
        if (fileData) {
            URL.revokeObjectURL(fileData.url);
            userFiles = userFiles.filter(f => f.id !== file.id);
            renderGrids();
        }
    });

    // --- Интерактивы ---

    // Внешний вызов выбора файлов
    if (triggerBrowse) {
        triggerBrowse.addEventListener('click', () => pond.browse());
    }

    // Выбрать все пресеты
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const allSelected = buildingFiles.every(f => f.isSelected);
            buildingFiles.forEach(f => {
                f.isSelected = !allSelected;
                const el = presetsGrid.querySelector(`[data-id="${f.id}"]`);
                if (el) el.classList.toggle('is-selected', f.isSelected);
            });
        });
    }

    // Сортировка (для обеих сеток по отдельности)
    [userGrid, presetsGrid].forEach(grid => {
        new Sortable(grid, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: () => {
                const domIds = Array.from(grid.querySelectorAll('.uploader-item')).map(el => el.dataset.id);
                if (grid === userGrid) {
                    userFiles = domIds.map(id => userFiles.find(f => f.id === id)).filter(Boolean);
                } else {
                    buildingFiles = domIds.map(id => buildingFiles.find(f => f.id === id)).filter(Boolean);
                }
            }
        });
    });

    renderGrids();
};