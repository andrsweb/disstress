document.addEventListener('DOMContentLoaded', () => {
    'use strict'
    void initSearchResultsFilters()
    initPropertiesFilters()
})

const getBedsBathsText = (selectedBeds, selectedBaths) => {
    const bedsArray = Array.from(selectedBeds).sort()
    const bathsArray = Array.from(selectedBaths).sort()

    let text = ''
    if (bedsArray.length > 0) {
        text += bedsArray.join(',') + ' bed' + (bedsArray.length > 1 || bedsArray.includes('5+') ? 's' : '')
    }
    if (bathsArray.length > 0) {
        if (text) text += ', '
        text += bathsArray.join(',') + ' bath' + (bathsArray.length > 1 || bathsArray.includes('5+') ? 's' : '')
    }

    return text || 'Select'
}

const updateBedsBathsButtons = (container, tempBeds, tempBaths) => {
    container.querySelectorAll('[data-beds]').forEach(btn => btn.classList.toggle('active', tempBeds.has(btn.dataset.beds)))
    container.querySelectorAll('[data-baths]').forEach(btn => btn.classList.toggle('active', tempBaths.has(btn.dataset.baths)))
}

const initSearchResultsFilters = async () => {
    const buttons = Array.from(document.querySelectorAll('.result-filter[data-filter]'))
    if (!buttons.length) return

    let searchData = searchTabsData;

    const filters = searchData?.filters
    if (!filters) return

    const getLabelByValue = (filterKey, value) => {
        const options = filters?.[filterKey]?.options
        if (!Array.isArray(options)) return value
        return options.find((opt) => opt?.value === value)?.label ?? value
    }

    const applySelection = (button, filterKey, selectedValue) => {
        button.dataset.selectedValue = selectedValue
        button.dispatchEvent(new Event('change', {bubbles: true}));

        const valueEl = button.querySelector('.result-value')
        if (!valueEl) return

        let textSpan = valueEl.querySelector('[data-value-text]')
        if (!textSpan) {
            const img = valueEl.querySelector('img')
            textSpan = document.createElement('span')
            textSpan.setAttribute('data-value-text', 'true')
            valueEl.replaceChildren(textSpan)
            if (img) valueEl.append(img)
        }
        textSpan.textContent = getLabelByValue(filterKey, selectedValue)
    }

    const renderDropdown = (button) => {
        const filterKey = button.dataset.filter
        const options = filters?.[filterKey]?.options
        const dropdown = button.querySelector('.result-dropdown')

        if (!dropdown || !Array.isArray(options)) return

        dropdown.replaceChildren()
        const selectedValue = button.dataset.selectedValue ?? ''

        options.forEach((opt) => {
            const optBtn = document.createElement('button')
            optBtn.type = 'button'
            optBtn.className = `result-option${opt.value === selectedValue ? ' is-selected' : ''}`
            optBtn.setAttribute('data-value', opt.value)

            const text = document.createElement('span')
            text.textContent = opt.label

            const check = document.createElement('img')
            check.className = 'result-option-check'
            check.src = '/wp-content/themes/distress/assets/img/check.svg'
            check.width = 16
            check.height = 16
            check.alt = 'Selected'

            optBtn.append(text, check)
            dropdown.append(optBtn)
        })
        dropdown.hidden = true
    }

    buttons.forEach((button) => {
        const filterKey = button.dataset.filter
        if (filterKey === 'beds_baths') return

        const options = filters?.[filterKey]?.options
        if (!Array.isArray(options) || !options.length) return

        const valueEl = button.querySelector('.result-value')
        if (!valueEl) return

        const currentLabel = (valueEl.querySelector('[data-value-text]')?.textContent ?? valueEl.textContent ?? '').trim().toLowerCase()
        const initial = options.find((opt) => (opt?.label ?? '').trim().toLowerCase() === currentLabel)
        const initialValue = initial?.value ?? options[0]?.value ?? ''

        applySelection(button, filterKey, initialValue)
        renderDropdown(button)
    })

    let openButton = null

    const closeDropdown = (btn) => {
        if (!btn) return
        const dropdown = btn.querySelector('.result-dropdown') || document.querySelector(`[data-result-dropdown="${btn.dataset.filter}"]`)
        if (dropdown) dropdown.hidden = true
        btn.classList.remove('is-open')
    }

    const openDropdown = (btn) => {
        if (!btn) return
        if (openButton && openButton !== btn) closeDropdown(openButton)
        openButton = btn
        const dropdown = btn.querySelector('.result-dropdown') || document.querySelector(`[data-result-dropdown="${btn.dataset.filter}"]`)
        if (dropdown) dropdown.hidden = false
        btn.classList.add('is-open')
    }

    buttons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const option = e.target.closest('.result-option')
            const filterKey = button.dataset.filter

            if (!option) {
                button.classList.contains('is-open') ? (closeDropdown(button), openButton = null) : openDropdown(button)
                return
            }

            const selectedValue = option.getAttribute('data-value')
            if (filterKey && selectedValue) {
                applySelection(button, filterKey, selectedValue)
                renderDropdown(button)
            }
            closeDropdown(button)
            openButton = null
        })
    })

    document.addEventListener('click', (e) => {
        if (!openButton || openButton.contains(e.target) || e.target.closest('[data-result-dropdown]')) return
        closeDropdown(openButton)
        openButton = null
    })

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && openButton) {
            closeDropdown(openButton)
            openButton = null
        }
    })

    const bbSelector = document.querySelector('.result-filter[data-filter="beds_baths"]')
    const bbDropdown = document.querySelector('[data-result-dropdown="beds_baths"]')
    const bbText = document.querySelector('[data-result-beds-baths-text]')
    const bbBedsInp = document.querySelector('[data-result-beds-value]')
    const bbBathsInp = document.querySelector('[data-result-baths-value]')

    if (bbSelector && bbDropdown && bbText && bbBedsInp && bbBathsInp) {
        let selectedBeds = new Set(), selectedBaths = new Set()
        let tempBeds = new Set(), tempBaths = new Set()

        const updateDisplay = () => {
            bbText.textContent = getBedsBathsText(selectedBeds, selectedBaths)
            bbBedsInp.value = Array.from(selectedBeds).join(',')
            bbBathsInp.value = Array.from(selectedBaths).sort().join(',')
        }

        bbDropdown.addEventListener('click', (e) => {
            e.stopPropagation()
            const bedBtn = e.target.closest('[data-beds]')
            const bathBtn = e.target.closest('[data-baths]')
            if (bedBtn) {
                const val = bedBtn.dataset.beds
                tempBeds.has(val) ? tempBeds.delete(val) : tempBeds.add(val)
                updateBedsBathsButtons(bbDropdown, tempBeds, tempBaths)
            }
            if (bathBtn) {
                const val = bathBtn.dataset.baths
                tempBaths.has(val) ? tempBaths.delete(val) : tempBaths.add(val)
                updateBedsBathsButtons(bbDropdown, tempBeds, tempBaths)
            }

            if (e.target.closest('.beds-baths-cancel')) {
                tempBeds = new Set(selectedBeds)
                tempBaths = new Set(selectedBaths)
                updateBedsBathsButtons(bbDropdown, tempBeds, tempBaths)
                closeDropdown(bbSelector)
                openButton = null
            }
            if (e.target.closest('.beds-baths-apply')) {
                selectedBeds = new Set(tempBeds)
                selectedBaths = new Set(tempBaths)
                updateDisplay()
                closeDropdown(bbSelector)
                openButton = null
            }
        })
        updateDisplay()
    }
}

const initPropertiesFilters = () => {
    const filterItem = document.querySelector('.results-filters-items');
    if (!filterItem) return

    let filterButtons = filterItem.querySelectorAll('button.result-filter');
    if (!filterButtons) return

    filterButtons.forEach(button => {
        button.addEventListener('change', () => {
            updatePropertiesList();
        });
    });
}

const updatePropertiesList = () => {
    const filterItem = document.querySelector('.results-filters-items');
    let filterButtons = filterItem.querySelectorAll('button.result-filter'),
        formData = new FormData(),
        resultsBlock = document.getElementById('result-tabs-list-panel'),
        h2Block = document.querySelector('.title-top h2'),
        bedsValueInput = filterItem?.querySelector('input[name="beds"]'),
        bathsValueInput = filterItem?.querySelector('input[name="baths"]'),
        action = filterItem?.querySelector('input[name="action"]');

    resultsBlock.classList.add('preloader');

    formData.append('action', action.value ?? 'get_properties');
    formData.append('_ajax_nonce', ajax_object._ajax_nonce);
    filterButtons.forEach(button => {
        formData.append(button.dataset.filter, button.dataset.selectedValue);
    });

    if (bedsValueInput) {
        formData.append('beds', bedsValueInput.value);
    }

    if (bathsValueInput) {
        formData.append('baths', bathsValueInput.value);
    }

    let currentUrl = new URL(window.location.href);
    
    formData.forEach((value, key) => {
        if ('action' === key || '_ajax_nonce' === key) return;

        if ('all' === value || 'undefined' === value || 0 === value.length) {
            currentUrl.searchParams.delete(key);
            return;
        }

        currentUrl.searchParams.set(key, value);
    });

    formData.append('current_href', currentUrl.href);

    fetch(ajax_object.ajax_url, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => {
            if (response.success) {
                resultsBlock.innerHTML = response.data.properties;
                h2Block.innerHTML = response.data.properties_found;
            }
            console.log(currentUrl.href);
            history.pushState(
                currentUrl.hash,
                '',
                currentUrl.href
            );
            setTimeout(() => {
                resultsBlock.classList.remove('preloader');
                document.dispatchEvent(new Event('ajaxComplete'));
            }, 600);
        })
        .catch(error => {
            console.log(error);
            resultsBlock.classList.remove('preloader');
        });
}