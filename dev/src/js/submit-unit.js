document.addEventListener('DOMContentLoaded', () => {
	'use strict';

	initFormInteractions();
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

	const checkValidity = () => {
		const requiredElements = form.querySelectorAll('[required], [data-required]');
		const isFormValid = Array.from(requiredElements).every(el =>
			el.type === 'checkbox' ? el.checked : el.value.trim() !== ''
		);
		submitBtn.disabled = !isFormValid;
	};

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

		form.addEventListener('input', checkValidity);
		form.addEventListener('change', checkValidity);

		initButtonGroupToggles();
	};

	initEvents();
	checkValidity();
};
