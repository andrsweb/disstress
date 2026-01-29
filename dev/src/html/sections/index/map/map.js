document.addEventListener('DOMContentLoaded', () => {
	'use strict'

	loadMapIframe();
});

const loadMapIframe = () => {
	const section = document.querySelector('.map');
	if (!section) return;

	const iframe = section.querySelector('iframe.map-iframe');
	if (!iframe) return;

	const dataSrc = iframe.dataset.src;
	if (!dataSrc) return;

	const setSrc = () => {
		if (!iframe.src) iframe.src = dataSrc;
	};

	if (!('IntersectionObserver' in window)) {
		setSrc();
		return;
	}

	const observer = new IntersectionObserver(
		(entries, obs) => {
			const isVisible = entries.some((entry) => entry.isIntersecting);

			if (!isVisible) return;

			setSrc();
			obs.disconnect();
		},
		{
			root: null,
			rootMargin: '200px 0px',
			threshold: 0,
		},
	);

	observer.observe(section);
};

