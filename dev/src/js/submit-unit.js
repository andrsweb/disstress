document.addEventListener('DOMContentLoaded', () => {
	'use strict';

	initFormInteractions();
	initFormValidation();
	initVerifyClose();
});

const initFormInteractions = () => {
	const form = document.querySelector('.submit-unit-form');
	if (!form) return;

	const priceInp = form.querySelector('#s-price');
	const originalPriceInp = form.querySelector('#o-price');
	const discountInp = form.querySelector('input[name="discount"]');
	const pricePerSquareInp = form.querySelector('input[name="price_per_square"]');
	const areaInp = form.querySelector('#s-sqrt');
	const resultSpan = form.querySelector('span.sqrt-value span');
	const discountSpan = form.querySelector('span.discount-value span');
	const submitBtn = form.querySelector('button[type="submit"]');

	if (!priceInp || !areaInp || !resultSpan || !submitBtn) return;

	const formatNumber = (num) => new Intl.NumberFormat('en-US').format(Math.round(num));
	const cleanNumericValue = (val) => val.replace(/\D/g, '').replace(/^0+/, '');

	const updateCalculations = () => {
		const price = parseInt(priceInp.value, 10);
		const area = parseInt(areaInp.value, 10);
		const pricePerSquare = (price > 0 && area > 0) ? Math.round(price / area) : 0;

		resultSpan.textContent = ` ~${formatNumber(pricePerSquare)} AED / sq ft`;
		pricePerSquareInp.value = pricePerSquare;
	};

	const updateOriginalPrice = () => {
		const price = parseInt(priceInp.value, 10);
		const originalPrice = parseInt(originalPriceInp.value, 10);

		if (price > originalPrice || isNaN(originalPrice)) {
			originalPriceInp.value = price;
		}
	}

	const updateDiscount = () => {
		const price = parseInt(priceInp.value, 10);
		const originalPrice = parseInt(originalPriceInp.value, 10);
		const discount = (originalPrice > 0 && price > 0 && originalPrice > price) ? Math.round((originalPrice - price) / originalPrice * 100) : 0;

		discountSpan.textContent = discount + '%';
		discountInp.value = discount;
	}

	const handleNumericInput = (e) => {
		if (e.key.length === 1 && !/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
		}
	};

	const initButtonGroupToggles = () => {
		form.querySelectorAll('.submit-buttons-wrapper').forEach(wrapper => {
			const buttons = wrapper.querySelectorAll('.beds-baths-btn');
			const hiddenInput = wrapper.querySelector('input[type="hidden"]');

			buttons.forEach(btn => {
				btn.addEventListener('click', () => {
					buttons.forEach(b => b.classList.remove('active'));
					btn.classList.add('active');
					hiddenInput.value = btn.dataset.beds || btn.dataset.baths;
					hiddenInput.dispatchEvent(new Event('change', {bubbles: true}));
				});
			});
		});
	};

	const initEvents = () => {
		priceInp.addEventListener('input', () => {
			updateOriginalPrice();
		});

		[priceInp, originalPriceInp, areaInp].forEach(inp => {
			inp.addEventListener('keydown', handleNumericInput);
			inp.addEventListener('input', () => {
				inp.value = cleanNumericValue(inp.value);
				updateCalculations();
				updateDiscount();
			});
		});

		initButtonGroupToggles();
	};

	initEvents();
};

const initFormValidation = () => {
	const form = document.querySelector('.submit-unit-form');
	if (!form) return;

	form.addEventListener('submit', async (e) => {
		const requiredElements = form.querySelectorAll('[required], [data-required]');
		let errors = 0;

		requiredElements.forEach(el => {
			let wrapper = el.closest('.submit-buttons-wrapper');

			if (!wrapper) {
				wrapper = el.closest('.checkbox-buttons-wrapper');
			}

			if (!wrapper) {
				wrapper = el.closest('.input-wrapper');
			}

			if (!wrapper) return;

			if (!el.value) {
				wrapper.classList.add('error-field');
				errors++;
			} else {
				wrapper.classList.remove('error-field');
			}
		});

		const wpEditor = tinymce.get('s-desc');
		if (wpEditor && wpEditor.getContent().length < 40) {
			const wrapper = document.querySelector('.wp-editor-container');
			if (wrapper) {
				wrapper.classList.add('error-field');
				errors++;
			}
		}

		const finalImageSelectionInp = form.querySelector('input[name="final_image_selection"]'),
			imagesUploaderBlock = form.querySelector('.submit-unit-right .uploader');

		if (finalImageSelectionInp) {
			const finalImageSelection = JSON.parse(finalImageSelectionInp.value);

			if (finalImageSelection.fullOrder.length <= 0) {
				errors++;
				imagesUploaderBlock.classList.add('error-field');
			} else {
				imagesUploaderBlock.classList.remove('error-field');
			}
		}

		if (errors > 0) {
			e.preventDefault();
			return false;
		}

		e.preventDefault();
		const isVerified = await verifyDistress(form);
		if (!isVerified) {
			e.preventDefault();
			return false;
		}

		form.submit();
		return true;
	});
}

const verifyDistress = async (form) => {
	const formData = new FormData(form);
	let preloader = form.querySelector('.verify_preloader');

	if (preloader) {
		preloader.classList.add('showed');
	}

	formData.append('action', 'verify_distress');
	formData.append('_ajax_nonce', ajax_object._ajax_nonce);

	try {
		const request = await fetch(ajax_object.ajax_url, {
			method: 'POST', body: formData, headers: {
				Accept: 'application/json',
			},
		});
		if (!request.ok) {
			throw new Error(`HTTP error: ${request.status}`);
		}
		const response = await request.json();
		if (response.success) {
			return true;
		}
		const message = response?.data?.message || 'The property could not be verified.';
		if (preloader) {
			const errorText = preloader.querySelector('.verify_error p');
			if (errorText) {
				errorText.textContent = message;
			}
			preloader.classList.add('showed_error');
		}
		return false;
	} catch (error) {
		if (preloader) {
			const errorText = preloader.querySelector('.verify_error p');
			if (errorText) {
				errorText.textContent = error.message;
			}
			preloader.classList.add('showed_error');
		}
		return false;
	}
}

const initVerifyClose = () => {
	document.addEventListener('click', e => {
		if (e.target.classList.contains('verify_close')) {
			e.preventDefault();

			const preloader = document.querySelector('.verify_preloader');
			preloader?.classList.remove('showed_error');
			preloader?.classList.remove('showed');
		}
	})
}