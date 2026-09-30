(() => {
  const popupMarkup = `
    <div class="card-popup" id="cardPopup" aria-hidden="true">
      <div class="popup-content" role="dialog" aria-modal="true" aria-labelledby="popupTitle">
        <button class="popup-close" type="button" aria-label="Close details">&times;</button>
        <div class="popup-media" id="popupMedia">
          <div class="popup-slides" id="popupSlides"></div>
          <div class="popup-dots" id="popupDots" aria-label="Image selection"></div>
        </div>
        <div class="popup-text">
          <span class="popup-kicker">ABC ACADEMY</span>
          <h2 id="popupTitle"></h2>
          <div class="popup-scroll-wrap"><div class="popup-description" id="popupDescription"></div><div class="popup-scroll-rail" id="popupScrollRail" aria-hidden="true"><div class="popup-scroll-thumb" id="popupScrollThumb"></div></div></div>
          <a class="popup-btn" id="popupAction" href="education.html">Explore details <span>↗</span></a>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', popupMarkup);
  const popup = document.getElementById('cardPopup');
  const popupTitle = document.getElementById('popupTitle');
  const popupDescription = document.getElementById('popupDescription');
  const popupMedia = document.getElementById('popupMedia');
  const popupSlides = document.getElementById('popupSlides');
  const popupDots = document.getElementById('popupDots');
  const popupAction = document.getElementById('popupAction');
  const popupScrollWrap = document.querySelector('.popup-scroll-wrap');
  const popupScrollRail = document.getElementById('popupScrollRail');
  const popupScrollThumb = document.getElementById('popupScrollThumb');
  const closeButton = popup.querySelector('.popup-close');

  let carouselIndex = 0;
  let carouselTimer = null;
  let carouselImages = [];
  let pointerStartX = 0;
  let pointerCurrentX = 0;
  let dragOffset = 0;
  let isDragging = false;
  let pointerId = null;

  const AUTOPLAY_MS = 4200;
  const SWIPE_THRESHOLD = 55;

  function updateScrollIndicator() {
    if (!popupDescription || !popupScrollRail || !popupScrollThumb) return;
    const scrollable = popupDescription.scrollHeight > popupDescription.clientHeight + 2;
    popupScrollRail.classList.toggle('visible', scrollable);
    if (!scrollable) return;
    const viewport = popupDescription.clientHeight;
    const content = popupDescription.scrollHeight;
    const railHeight = popupScrollRail.clientHeight || 1;
    const thumbHeight = Math.max(34, Math.round((viewport / content) * railHeight));
    const maxThumbTravel = Math.max(0, railHeight - thumbHeight);
    const maxScroll = Math.max(1, content - viewport);
    const top = (popupDescription.scrollTop / maxScroll) * maxThumbTravel;
    popupScrollThumb.style.height = `${thumbHeight}px`;
    popupScrollThumb.style.transform = `translateY(${top}px)`;
  }

  let scrollRailDragging = false;
  let scrollRailStartY = 0;
  let scrollRailStartScroll = 0;

  popupDescription.addEventListener('scroll', updateScrollIndicator, {passive:true});
  popupScrollRail.addEventListener('pointerdown', event => {
    if (!popupScrollRail.classList.contains('visible')) return;
    scrollRailDragging = true;
    scrollRailStartY = event.clientY;
    scrollRailStartScroll = popupDescription.scrollTop;
    popupScrollRail.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  });
  popupScrollRail.addEventListener('pointermove', event => {
    if (!scrollRailDragging) return;
    const railHeight = popupScrollRail.clientHeight || 1;
    const thumbHeight = popupScrollThumb.offsetHeight || 34;
    const maxThumbTravel = Math.max(1, railHeight - thumbHeight);
    const maxScroll = Math.max(0, popupDescription.scrollHeight - popupDescription.clientHeight);
    const delta = event.clientY - scrollRailStartY;
    popupDescription.scrollTop = scrollRailStartScroll + (delta / maxThumbTravel) * maxScroll;
  });
  const endRailDrag = event => {
    if (!scrollRailDragging) return;
    scrollRailDragging = false;
    popupScrollRail.releasePointerCapture?.(event.pointerId);
  };
  popupScrollRail.addEventListener('pointerup', endRailDrag);
  popupScrollRail.addEventListener('pointercancel', endRailDrag);

  popupScrollRail.addEventListener('click', event => {
    if (event.target === popupScrollThumb) return;
    const rect = popupScrollRail.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    popupDescription.scrollTop = ratio * (popupDescription.scrollHeight - popupDescription.clientHeight);
  });

  const scrollResizeObserver = new ResizeObserver(updateScrollIndicator);
  scrollResizeObserver.observe(popupDescription);


  function updateDots() {
    popupDots.querySelectorAll('.popup-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === carouselIndex);
      dot.setAttribute('aria-current', i === carouselIndex ? 'true' : 'false');
    });
  }

  function setSlidePosition(animate = true, offset = 0) {
    popupSlides.style.transition = animate
      ? 'transform .72s cubic-bezier(.22,.61,.36,1)'
      : 'none';
    const width = popupMedia.clientWidth || 1;
    popupSlides.style.transform = `translate3d(${(-carouselIndex * width) + offset}px,0,0)`;
    if (animate) updateDots();
  }

  function goToSlide(index, restartAutoplay = true) {
    if (!carouselImages.length) return;
    carouselIndex = (index + carouselImages.length) % carouselImages.length;
    setSlidePosition(true, 0);
    if (restartAutoplay) restartTimer();
  }

  function startTimer() {
    clearInterval(carouselTimer);
    if (carouselImages.length > 1 && popup.classList.contains('active')) {
      carouselTimer = setInterval(() => goToSlide(carouselIndex + 1, false), AUTOPLAY_MS);
    }
  }

  function restartTimer() {
    clearInterval(carouselTimer);
    startTimer();
  }

  function renderCarousel(title) {
    popupSlides.innerHTML = carouselImages.map((src, i) =>
      `<div class="popup-slide"><img src="${src}" alt="${title} - image ${i + 1}" loading="eager" draggable="false"></div>`
    ).join('');

    popupDots.innerHTML = carouselImages.map((_, i) =>
      `<button type="button" class="popup-dot${i === 0 ? ' active' : ''}" aria-label="Show image ${i + 1}" aria-current="${i === 0 ? 'true' : 'false'}" data-index="${i}"></button>`
    ).join('');

    popupDots.hidden = carouselImages.length <= 1;
    carouselIndex = 0;
    requestAnimationFrame(() => setSlidePosition(false, 0));
    restartTimer();
  }

  function beginDrag(event) {
    if (carouselImages.length < 2 || event.pointerType === 'mouse' && event.button !== 0) return;
    isDragging = true;
    pointerId = event.pointerId;
    pointerStartX = event.clientX;
    pointerCurrentX = event.clientX;
    dragOffset = 0;
    clearInterval(carouselTimer);
    popupSlides.style.transition = 'none';
    popupSlides.setPointerCapture?.(pointerId);
    popupMedia.classList.add('is-dragging');
  }

  function moveDrag(event) {
    if (!isDragging || event.pointerId !== pointerId) return;
    pointerCurrentX = event.clientX;
    dragOffset = pointerCurrentX - pointerStartX;

    // Add resistance when pulling beyond the first/last slide.
    const atEdge = (carouselIndex === 0 && dragOffset > 0) ||
                   (carouselIndex === carouselImages.length - 1 && dragOffset < 0);
    const resistedOffset = atEdge ? dragOffset * 0.32 : dragOffset;
    setSlidePosition(false, resistedOffset);
  }

  function endDrag(event) {
    if (!isDragging || event.pointerId !== pointerId) return;
    const distance = pointerCurrentX - pointerStartX;
    const width = popupMedia.clientWidth || 1;
    const shouldChange = Math.abs(distance) > Math.max(SWIPE_THRESHOLD, width * 0.12);

    isDragging = false;
    popupMedia.classList.remove('is-dragging');
    popupSlides.releasePointerCapture?.(pointerId);
    pointerId = null;

    if (shouldChange) {
      goToSlide(carouselIndex + (distance < 0 ? 1 : -1), false);
    } else {
      setSlidePosition(true, 0);
      startTimer();
    }
  }

  popupMedia.addEventListener('pointerdown', beginDrag);
  popupMedia.addEventListener('pointermove', moveDrag);
  popupMedia.addEventListener('pointerup', endDrag);
  popupMedia.addEventListener('pointercancel', endDrag);

  popupDots.addEventListener('click', event => {
    const dot = event.target.closest('.popup-dot');
    if (!dot) return;
    goToSlide(Number(dot.dataset.index));
  });

  popupMedia.addEventListener('mouseenter', () => clearInterval(carouselTimer));
  popupMedia.addEventListener('mouseleave', () => {
    if (!isDragging) startTimer();
  });

  window.addEventListener('resize', () => {
    if (popup.classList.contains('active')) setSlidePosition(false, 0);
    updateScrollIndicator();
  });

  function closePopup() {
    popup.classList.remove('active');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('popup-open');
    clearInterval(carouselTimer);
  }

  function openPopup(card) {
    const title = card.querySelector('h3, h2, b')?.textContent?.trim() || 'ABC Academy';
    const popupData = card.querySelector('.popup-data');
    const description = popupData?.innerHTML?.trim() || card.dataset.popupDescription || card.querySelector('p')?.innerHTML?.trim() || '';
    const image = card.querySelector('img')?.getAttribute('src') || '';
    const dataImages = (card.dataset.carouselImages || '').split('|').map(v => v.trim()).filter(Boolean);

    carouselImages = dataImages.length ? dataImages : [image];
    renderCarousel(title);

    const action = card.querySelector('a');
    const actionText = card.dataset.popupAction || action?.textContent?.replace('↗', '').trim() || 'Explore details';
    let actionHref = card.dataset.popupHref || action?.getAttribute('href') || 'education.html';

    // Any popup explicitly labelled as a WhatsApp enquiry gets a safe,
    // card-specific pre-filled WhatsApp message even when no href was set.
    if (/whatsapp/i.test(actionText) && !card.dataset.popupHref && !action?.getAttribute('href')) {
      const message = `Hi ABC Fashion & Beauty Academy, I would like to enquire about ${title}.`;
      actionHref = 'https://wa.me/919385920297?text=' + encodeURIComponent(message);
    }

    popupTitle.textContent = title;
    popupDescription.innerHTML = description;
    requestAnimationFrame(() => { popupDescription.scrollTop = 0; updateScrollIndicator(); });
    popupAction.textContent = actionText + ' ↗';
    popupAction.href = actionHref;
    popupAction.target = actionHref.startsWith('http') && !actionHref.includes(location.host) ? '_blank' : '_self';
    popup.classList.add('active');
    popup.setAttribute('aria-hidden', 'false');
    document.body.classList.add('popup-open');
    restartTimer();
  }

  function bindCards() {
    document.querySelectorAll('.popup-card').forEach(card => {
      if (card.dataset.popupBound === '1') return;
      card.dataset.popupBound = '1';

      card.addEventListener('click', event => {
        const interactive = event.target.closest('a,button,input,select,textarea');
        if (interactive && interactive !== card) return;
        event.preventDefault();
        openPopup(card);
      });
    });
  }

  closeButton.addEventListener('click', closePopup);
  popup.addEventListener('click', event => {
    if (event.target === popup) closePopup();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && popup.classList.contains('active')) closePopup();
  });

  const observer = new MutationObserver(bindCards);
  observer.observe(document.body, { childList: true, subtree: true });
  bindCards();
})();
