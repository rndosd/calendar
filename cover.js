(() => {
  const hero = document.querySelector('.hero');
  const choices = hero.querySelector('.cover-choices');
  const preview = document.getElementById('cover-preview');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let requestedSkin = hero.dataset.skin;

  choices.addEventListener('change', async ({ target: input }) => {
    requestedSkin = input.value;
    const image = new Image();
    image.src = input.dataset.preview;
    try {
      await image.decode();
    } catch {
      if (requestedSkin === input.value) {
        choices.querySelector(`input[value="${hero.dataset.skin}"]`).checked = true;
      }
      return;
    }
    if (requestedSkin !== input.value) return;

    hero.dataset.skin = input.value;
    preview.src = image.src;
    preview.alt = `${input.labels[0].textContent.trim()} 스킨을 적용한 메신저 캘린더 화면`;
    preview.getAnimations().forEach(animation => animation.cancel());
    if (!reduceMotion.matches) preview.animate({ opacity: [.72, 1] }, { duration: 220 });
  });

  choices.hidden = false;
})();
