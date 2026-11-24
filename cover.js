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

(() => {
  const link = document.querySelector('a#feature-video[data-youtube-id]');
  const player = document.getElementById('feature-player');
  if (!link || !player?.showModal) return;

  const screen = player.querySelector('.feature-player-screen');
  player.querySelector('.feature-player-link').href = link.href;
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.title = '브리티·GOE 메신저 캘린더 기능 소개';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.src = `https://www.youtube-nocookie.com/embed/${link.dataset.youtubeId}?autoplay=1`;
    screen.replaceChildren(frame);
    player.showModal();
  });
  player.addEventListener('close', () => {
    screen.replaceChildren();
    link.focus({ preventScroll: true });
  });
})();
