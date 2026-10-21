'use strict';
(() => {
  const WA = '919779650064';
  const RELEASES = 'HarshGaba1196/milaan-erp-releases';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // theme: follows the computer unless the visitor picks one
  const root = document.documentElement;
  try { const t = localStorage.getItem('milaan-site-theme'); if (t) root.dataset.theme = t; } catch (e) { }
  $('#theme').addEventListener('click', () => {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('milaan-site-theme', root.dataset.theme); } catch (e) { }
  });

  // mobile menu
  const menu = $('#menu'), links = $('#links');
  menu.addEventListener('click', () => { const open = links.classList.toggle('open'); menu.setAttribute('aria-expanded', open); });
  links.addEventListener('click', e => { if (e.target.closest('a')) { links.classList.remove('open'); menu.setAttribute('aria-expanded', false); } });

  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // "Buy on WhatsApp" opens a chat with the plan already written
  const wa = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  $$('.buy').forEach(b => {
    b.href = wa(`Hi, I want to buy Milaan ERP – ${b.dataset.plan}.\n\nName:\nBusiness name:\nMy computer code (Help → Licence → Copy):`);
    b.target = '_blank'; b.rel = 'noopener';
  });
  $('#waTalk').target = '_blank';

  $('#yr').textContent = new Date().getFullYear();

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // "Made for your pharmacy / kirana store / …"
  const rot = $('#rot'), trades = ['pharmacy', 'kirana store', 'garment shop', 'hardware store', 'distributorship', 'electronics shop', 'restaurant', 'wholesale business'];
  if (rot && !still) {
    let i = 0;
    setInterval(() => { rot.classList.add('out'); setTimeout(() => { i = (i + 1) % trades.length; rot.textContent = trades[i]; rot.classList.remove('out'); }, 300); }, 2200);
  }

  // light / dark drag-to-compare
  const ba = $('#ba'), range = $('#baRange');
  if (ba && range) range.addEventListener('input', () => ba.style.setProperty('--pos', range.value + '%'));

  // fade sections in as they scroll into view
  if ('IntersectionObserver' in window && !still) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const t = e.target; t.classList.add('in'); io.unobserve(t); setTimeout(() => { t.style.transitionDelay = ''; }, 1200); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.sec-h, .feat, .prob, .plan, .tile, .dl, .cmp-wrap, .how, .ba, .faq details, .closer .wrap').forEach((el, n) => {
      if (el.getBoundingClientRect().top < innerHeight) return; // already on screen: leave it visible
      el.classList.add('rv'); el.style.transitionDelay = (el.matches('.prob, .plan, .tile, .dl') ? (n % 4) * 70 : 0) + 'ms'; io.observe(el);
    });
  }

  // highlight the download for this visitor's computer
  const ua = navigator.userAgent, plat = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  const os = /Win/i.test(plat) || /Windows/.test(ua) ? 'win' : /Mac/i.test(plat) && !/iPhone|iPad/.test(ua) && navigator.maxTouchPoints < 2 ? 'mac' : '';
  if (os === 'win') { $('#dl-win').classList.add('mine'); $('#heroDl').textContent = 'Download for Windows · free trial'; }
  if (os === 'mac') {
    $('#heroDl').textContent = 'Download for Mac · free trial';
    // Apple-chip Macs report "arm" through userAgentData in Chromium browsers; Safari can't tell, so point at Apple chip (most Macs sold since 2020)
    const pick = arch => { $$('[data-os=mac]').forEach(a => a.classList.remove('mine')); $(arch === 'x86' ? '#dl-mac-intel' : '#dl-mac-arm').classList.add('mine'); };
    pick('arm');
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) navigator.userAgentData.getHighEntropyValues(['architecture']).then(v => v.architecture && pick(v.architecture)).catch(() => { });
  }

  // direct links to the newest installers (falls back to the releases page)
  fetch(`https://api.github.com/repos/${RELEASES}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(rel => {
      const find = re => rel.assets.find(a => re.test(a.name));
      const set = (id, asset) => { if (asset) { const a = $(id); a.href = asset.browser_download_url; a.setAttribute('download', ''); a.dataset.size = Math.round(asset.size / 1048576); } };
      set('#dl-win', find(/windows-setup\.exe$/i));
      set('#dl-mac-arm', find(/mac-arm64\.dmg$/i));
      set('#dl-mac-intel', find(/mac-x64\.dmg$/i));
      const v = (rel.tag_name || '').replace(/^v/, '');
      const date = rel.published_at ? new Date(rel.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      if (v) $('#ver').textContent = `Version ${v}${date ? ' · released ' + date : ''} · about 120–130 MB`;
    })
    .catch(() => { });
  // the hero button jumps to the right installer once we know it
  $('#heroDl').addEventListener('click', e => {
    const mine = $('.dl.mine');
    if (mine && mine.hasAttribute('download')) { e.preventDefault(); location.href = mine.href; setTimeout(() => $('#download').scrollIntoView(), 50); }
  });
})();
