(() => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('rw-theme');
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = storedTheme || (preferredDark ? 'dark' : 'light');

  function toggleTheme() {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('rw-theme', root.dataset.theme);
  }
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  document.getElementById('mobileTheme')?.addEventListener('click', toggleTheme);

  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('sidebarScrim');
  const openSidebar = () => { sidebar?.classList.add('open'); scrim?.classList.add('show'); };
  const closeSidebar = () => { sidebar?.classList.remove('open'); scrim?.classList.remove('show'); };
  document.getElementById('sidebarOpen')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  scrim?.addEventListener('click', closeSidebar);
  sidebar?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (innerWidth <= 980) closeSidebar(); }));

  document.querySelectorAll('.nav-group-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.closest('.nav-group');
      group.classList.toggle('open');
      button.setAttribute('aria-expanded', group.classList.contains('open') ? 'true' : 'false');
    });
  });

  const navLinks = [...document.querySelectorAll('.nav-groups a[href^="#"]')];
  const sections = [...document.querySelectorAll('section[id]')];
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .2, .5] });
  sections.forEach(section => observer.observe(section));

  const protocols = {
    tcp: {
      title: 'TCP',
      adv: 'Accusé de réception, transport fiable',
      con: 'Lourd (dû aux mécanismes de fiabilité)',
      use: 'Emails, transfert de fichiers, HTTP/HTTPS, SSH'
    },
    udp: {
      title: 'UDP',
      adv: 'Très rapide',
      con: "Pas d'assurance concernant la qualité de la livraison",
      use: 'Appels, jeux-vidéos, streaming en temps réel, DNS traditionnel'
    }
  };
  const protoButtons = document.querySelectorAll('[data-protocol]');
  protoButtons.forEach(btn => btn.addEventListener('click', () => {
    protoButtons.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn ? 'true':'false'); });
    const data = protocols[btn.dataset.protocol];
    document.getElementById('protoTitle').textContent = data.title;
    document.getElementById('protoAdv').textContent = data.adv;
    document.getElementById('protoCon').textContent = data.con;
    document.getElementById('protoUse').textContent = data.use;
  }));

  const urlParts = {
    protocol: ['https', 'protocole'],
    domain: ['example.com', 'nom de domaine'],
    port: ['443', 'port'],
    path: ['/products', 'chemin'],
    params: ['?id=42', 'paramètres']
  };
  const urlButtons = document.querySelectorAll('[data-urlpart]');
  const urlExplanation = document.getElementById('urlExplanation');
  function showUrlPart(btn) {
    urlButtons.forEach(b => b.classList.toggle('active', b === btn));
    const [value, label] = urlParts[btn.dataset.urlpart];
    urlExplanation.innerHTML = `<strong>${value}</strong><span>: ${label}</span>`;
  }
  urlButtons.forEach(btn => btn.addEventListener('click', () => showUrlPart(btn)));
  if (urlButtons[0]) showUrlPart(urlButtons[0]);

  const serverLoads = [0,0,0];
  const serverBoxes = [...document.querySelectorAll('.server-box')];
  function renderLoads() {
    serverBoxes.forEach((box, i) => {
      box.querySelector('.server-load i').style.width = `${Math.min(serverLoads[i] * 22, 100)}%`;
      box.querySelector('small b').textContent = serverLoads[i];
    });
  }
  document.getElementById('sendRequest')?.addEventListener('click', () => {
    const min = Math.min(...serverLoads);
    const candidates = serverLoads.map((v,i) => v === min ? i : -1).filter(i => i >= 0);
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    serverLoads[target]++;
    serverBoxes.forEach((b,i) => b.classList.toggle('chosen', i === target));
    renderLoads();
    setTimeout(() => {
      serverLoads[target] = Math.max(0, serverLoads[target] - 1);
      renderLoads();
      serverBoxes[target].classList.remove('chosen');
    }, 2800);
  });

  const journeySteps = [
    {name:'Recherche Google', icon:'#i-search', phase:'Actions du côté du client'},
    {name:'URL', icon:'#i-link', phase:'Actions du côté du client'},
    {name:'DNS', icon:'#i-search', phase:'Actions du côté du client'},
    {name:'IP', icon:'#i-monitor', phase:'Actions du côté du client'},
    {name:'Port', icon:'#i-building', phase:'Actions du côté du client'},
    {name:'TCP', icon:'#i-split', phase:'Actions du côté du client'},
    {name:'Paquets', icon:'#i-box', phase:'Actions du côté du client'},
    {name:'Routeur', icon:'#i-router', phase:'Actions du côté du client'},
    {name:'FAI', icon:'#i-wifi', phase:"Transport de l'information"},
    {name:'Internet', icon:'#i-globe', phase:"Transport de l'information"},
    {name:'Réseau Google', icon:'#i-globe', phase:"Transport de l'information"},
    {name:'Load Balancer', icon:'#i-split', phase:'Travail côté Google'},
    {name:'Serveur Google', icon:'#i-server', phase:'Travail côté Google'},
    {name:'Index', icon:'#i-database', phase:'Travail côté Google'},
    {name:'Moteur de recherche', icon:'#i-search', phase:'Travail côté Google'},
    {name:'Résultats', icon:'#i-file', phase:'Travail côté Google'},
    {name:'Retour par Internet', icon:'#i-globe', phase:'Travail côté Google', return:true},
    {name:'Navigateur client', icon:'#i-monitor', phase:'Puis on reçoit la réponse', return:true}
  ];
  const journeyTrack = document.getElementById('journeyTrack');
  const journeyDetail = document.getElementById('journeyDetail');
  let currentStep = 0;
  let journeyTimer = null;
  let journeyRunning = false;

  function buildJourney() {
    if (!journeyTrack) return;
    journeyTrack.innerHTML = '';
    journeySteps.forEach((step, i) => {
      const node = document.createElement('div');
      node.className = `journey-node${step.return ? ' return' : ''}`;
      node.dataset.index = i;
      node.innerHTML = `<button aria-label="${step.name}"><svg><use href="${step.icon}"/></svg></button><small>${step.name}</small>`;
      node.addEventListener('click', () => { stopJourney(); setJourney(i, { center: true }); });
      journeyTrack.appendChild(node);
    });
    const packet = document.createElement('span');
    packet.className = 'journey-packet'; packet.id = 'journeyPacket'; journeyTrack.appendChild(packet);
    setJourney(0, { center: false });
  }
  function setJourney(index, { center = false, behavior = 'smooth' } = {}) {
    currentStep = index;
    const nodes = [...journeyTrack.querySelectorAll('.journey-node')];
    nodes.forEach((n,i) => { n.classList.toggle('active', i === index); n.classList.toggle('done', i < index); });
    const step = journeySteps[index];
    journeyDetail.innerHTML = `<div class="journey-detail-icon"><svg><use href="${step.icon}"/></svg></div><div><span class="journey-step-label">${step.phase}</span><h3>${step.name}</h3></div>`;
    const packet = document.getElementById('journeyPacket');
    const node = nodes[index];
    if (packet && node) packet.style.left = `${node.offsetLeft + node.offsetWidth/2 - 4.5}px`;

    // Important on mobile: scrollIntoView() also moves the page vertically.
    // Mobile browsers fire resize events when their address bar appears/disappears,
    // which used to pull the user back to the Journey at the bottom of the page.
    // Only center the node horizontally inside the Journey's own scroll container.
    if (center && node) {
      const wrap = journeyTrack.closest('.journey-track-wrap');
      if (wrap) {
        const targetLeft = node.offsetLeft + node.offsetWidth / 2 - wrap.clientWidth / 2;
        wrap.scrollTo({ left: Math.max(0, targetLeft), behavior });
      }
    }
  }
  function stopJourney() {
    clearTimeout(journeyTimer);
    journeyRunning = false;
    const btn = document.getElementById('journeyPlay');
    if (btn) btn.innerHTML = '<svg><use href="#i-play"/></svg> Lancer la recherche';
  }
  function advanceJourney() {
    if (!journeyRunning) return;
    if (currentStep >= journeySteps.length - 1) { stopJourney(); return; }
    journeyTimer = setTimeout(() => { setJourney(currentStep + 1, { center: true }); advanceJourney(); }, 1050);
  }
  document.getElementById('journeyPlay')?.addEventListener('click', () => {
    if (journeyRunning) { stopJourney(); return; }
    if (currentStep >= journeySteps.length - 1) setJourney(0, { center: true });
    journeyRunning = true;
    document.getElementById('journeyPlay').innerHTML = '<svg><use href="#i-x"/></svg> Arrêter';
    advanceJourney();
  });
  document.getElementById('journeyReset')?.addEventListener('click', () => { stopJourney(); setJourney(0, { center: true }); });
  addEventListener('resize', () => { if (journeyTrack) setJourney(currentStep, { center: false, behavior: 'auto' }); });
  buildJourney();
})();
