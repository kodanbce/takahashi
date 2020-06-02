window.onload = async () => {
  const searchParams = new URL(window.location).searchParams;

  const sourceUrl = searchParams.get('sourceUrl');

  if (!sourceUrl) {
    document.body.innerHTML = 'To present something, add "?sourceUrl=[URL to plaintext]" to the URL of this page.';
    return;
  }

  const sourceResponse = await fetch(sourceUrl);
  const source = await sourceResponse.text();

  const slides =
    source
      .split('\n')
      .map(row => row.trim())
      .filter(row => row.length >= 1);

  if (slides.length < 1) {
    document.body.innerHTML = 'The source document contains no rows of text';
    return;
  }

  const clampIndex = (n) => Math.min(slides.length - 1, Math.max(0, n));

  let currentSlideIndex = clampIndex(parseInt(searchParams.get('slide')) || 0);

  const updateUI = () => {
    document.title = slides[currentSlideIndex];
    document.body.innerHTML = slides[currentSlideIndex];

    // These thresholds are arbitrary
    if (document.body.innerHTML.length > 40) {
      document.body.style.fontSize = '5vmax';
    } else if (document.body.innerHTML.length > 20) {
      document.body.style.fontSize = '7.5vmax';
    } else if (document.body.innerHTML.length > 10) {
      document.body.style.fontSize = '10vmax';
    } else {
      document.body.style.fontSize = '12.5vmax';
    }

    searchParams.set('slide', currentSlideIndex);
    history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`);
  };

  updateUI(); // Initial rendering

  const leftKeys = new Set(['a', 'A', 'w', 'W', 'h', 'H', 'k', 'K', 'ArrowLeft']);
  const rightKeys = new Set(['d', 'D', 's', 'S', 'l', 'L', 'j', 'J', 'ArrowRight', ' ']);
  const resetKeys = new Set(['0']);
  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey) {
      // We don't want to react to the user pressing Ctrl+C for example
      // because that's counterintuitive
      return;
    }

    if (leftKeys.has(event.key)) {
      currentSlideIndex = clampIndex(currentSlideIndex - 1);
      updateUI();
    } else if (rightKeys.has(event.key)) {
      currentSlideIndex = clampIndex(currentSlideIndex + 1);
      updateUI();
    } else if (resetKeys.has(event.key)) {
      currentSlideIndex = 0;
      updateUI();
    }
  });

  window.addEventListener('mousedown', (event) => {
    const leftMouseButtonClicked = event.which === 1;
    if (leftMouseButtonClicked) {
      currentSlideIndex = clampIndex(currentSlideIndex + 1);
      updateUI();
    }
  });
};