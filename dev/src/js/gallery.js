document.addEventListener('click', (e) => {

	const item = e.target.closest('[data-gallery-index]');

	if (!item) return;

	const index = parseInt(item.getAttribute('data-gallery-index'), 10);
	const gallerySwiperElement = document.querySelector('.gallery-swiper');

	if (gallerySwiperElement && gallerySwiperElement.swiper) {
		gallerySwiperElement.swiper.slideTo(index, 0);
	}
});