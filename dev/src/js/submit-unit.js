document.addEventListener('DOMContentLoaded', () => {
	'use strict'
	
	initSubmitUnit();
});

const initSubmitUnit = () => {
	const form = document.querySelector('.submit-unit-form');
	if (!form) return;

	const priceInp = form.querySelector('#s-price');
	const areaInp = form.querySelector('#s-sqrt');
	const resultSpan = form.querySelector('[data-sqrt-value] span');
	const submitBtn = form.querySelector('button[type="submit"]');

	if (!priceInp || !areaInp || !resultSpan || !submitBtn) return;

	const fmt = (n) => new Intl.NumberFormat('en-US').format(Math.round(n));
	const clean = (v) => v.replace(/\D/g, '').replace(/^0+/, '') || '';

	const updateCalc = () => {
		const p = parseInt(priceInp.value, 10), a = parseInt(areaInp.value, 10);
		resultSpan.textContent = (p > 0 && a > 0) ? ` ~${fmt(p / a)} AED / sq ft` : '';
	};

	const validate = () => {
		const els = form.querySelectorAll('[required]');
		const ok = Array.from(els).every(el => el.type === 'checkbox' ? el.checked : el.value.trim() !== '');
		submitBtn.disabled = !ok;
	};

	const blockLetters = (e) => {
		if (e.key.length === 1 && !/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
		}
	};

	form.querySelectorAll('.submit-buttons-wrapper').forEach(grp => {
		const btns = grp.querySelectorAll('.beds-baths-btn'), inp = grp.querySelector('input[type="hidden"]');
		btns.forEach(btn => {
			btn.addEventListener('click', () => {
				btns.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				inp.value = btn.dataset.beds || btn.dataset.baths;
				inp.dispatchEvent(new Event('change', {bubbles: true}));
			});
		});
	});

	[priceInp, areaInp].forEach(inp => {
		inp.addEventListener('keydown', blockLetters);
		inp.addEventListener('input', () => {
			inp.value = clean(inp.value);
			updateCalc();
		});
	});

	form.addEventListener('input', validate);
	form.addEventListener('change', validate);
	validate();
};
