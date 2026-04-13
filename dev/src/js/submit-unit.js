document.addEventListener('DOMContentLoaded', () => {
	'use strict'

	initSubmitUnitCalc();
})

const initSubmitUnitCalc = () => {
	const form = document.querySelector('.submit-unit-form')
	const priceInp = document.getElementById('s-price')
	const areaInp = document.getElementById('s-sqrt')
	const resultSpan = document.querySelector('[data-sqrt-value] span')
	const submitBtn = form?.querySelector('button[type="submit"]')

	if (!priceInp || !areaInp || !resultSpan || !form) return

	const formatNumber = (num) => {
		return new Intl.NumberFormat('en-US').format(Math.round(num))
	}

	const cleanInput = (e) => {
		let value = e.target.value.replace(/\D/g, '')

		if (value.length > 1) {
			value = value.replace(/^0+/, '')
		}

		if (value === '' && e.target.value !== '') {
			e.target.value = ''
		} else {
			e.target.value = value
		}
	}

	const calculate = () => {
		const price = parseInt(priceInp.value, 10)
		const area = parseInt(areaInp.value, 10)

		if (price > 0 && area > 0) {
			const result = price / area
			resultSpan.textContent = ` ~${formatNumber(result)} AED / sq ft`
		} else {
			resultSpan.textContent = ''
		}
	}

	const checkFormValidity = () => {
		const requiredFields = form.querySelectorAll('[required]')
		const hiddenInputs = form.querySelectorAll('input[type="hidden"]')

		let isValid = true

		requiredFields.forEach(field => {
			if (!field.value.trim()) isValid = false
		})

		hiddenInputs.forEach(input => {
			if (!input.value) isValid = false
		})

		if (isValid) {
			submitBtn.removeAttribute('disabled')
		} else {
			submitBtn.setAttribute('disabled', 'true')
		}
	}

	const handleKeydown = (e) => {
		if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
			(e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
			(e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true)) ||
			(e.keyCode === 86 && (e.ctrlKey === true || e.metaKey === true)) ||
			(e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true)) ||
			(e.keyCode >= 35 && e.keyCode <= 40)) {
			return
		}

		if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
			e.preventDefault()
		}
	}

	const initToggleButtonGroups = () => {
		const groups = form.querySelectorAll('.submit-buttons-wrapper')

		groups.forEach(group => {
			const buttons = group.querySelectorAll('.beds-baths-btn')
			const hiddenInput = group.querySelector('input[type="hidden"]')

			buttons.forEach(btn => {
				btn.addEventListener('click', () => {
					buttons.forEach(b => b.classList.remove('active'))
					btn.classList.add('active')
					hiddenInput.value = btn.dataset.beds || btn.dataset.baths
					checkFormValidity()
				})
			})
		})
	}

	[priceInp, areaInp].forEach(inp => {
		inp.addEventListener('keydown', handleKeydown)
		inp.addEventListener('input', (e) => {
			cleanInput(e)
			calculate()
			checkFormValidity()
		})
		inp.addEventListener('paste', (e) => {
			setTimeout(() => {
				cleanInput({target: inp})
				calculate()
				checkFormValidity()
			}, 0)
		})
	})

	form.querySelectorAll('input[type="text"], textarea').forEach(inp => {
		inp.addEventListener('input', checkFormValidity)
	})

	document.addEventListener('change', (e) => {
		if (e.target.closest('.dropdown') || e.target.type === 'hidden') {
			checkFormValidity()
		}
	})

	initToggleButtonGroups()
	checkFormValidity()
}
