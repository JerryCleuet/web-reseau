(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const mobileTheme = document.getElementById('mobileTheme');
  const savedTheme = localStorage.getItem('rw-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem('rw-theme', theme);
    const use = mobileTheme?.querySelector('use');
    if (use) use.setAttribute('href', theme === 'dark' ? '#i-sun' : '#i-moon');
  }
  setTheme(initialTheme);
  [themeToggle, mobileTheme].forEach(btn => btn?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')));

  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('sidebarScrim');
  const openSidebar = () => { sidebar.classList.add('open'); scrim.classList.add('show'); };
  const closeSidebar = () => { sidebar.classList.remove('open'); scrim.classList.remove('show'); };
  document.getElementById('sidebarOpen')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
  scrim?.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (innerWidth <= 980) closeSidebar(); }));

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
    tcp: { badge:'Fiable', title:'TCP vérifie que le colis arrive', text:'TCP établit une connexion avant l’envoi, vérifie la réception et favorise la fiabilité. En contrepartie, il est plus lourd.', adv:'Transport fiable', con:'Plus lourd', use:'Emails, fichiers, HTTP/HTTPS, SSH' },
    udp: { badge:'Rapide', title:'UDP privilégie la vitesse', text:'UDP envoie les données sans mettre en place les mêmes mécanismes de contrôle. C’est très rapide, mais il n’y a pas la même assurance de livraison.', adv:'Très rapide', con:'Pas d’assurance de livraison', use:'Appels, jeux vidéo, streaming temps réel, DNS traditionnel' }
  };
  const protoButtons = document.querySelectorAll('[data-protocol]');
  protoButtons.forEach(btn => btn.addEventListener('click', () => {
    protoButtons.forEach(b => { b.classList.toggle('active', b === btn); b.setAttribute('aria-selected', b === btn ? 'true':'false'); });
    const data = protocols[btn.dataset.protocol];
    document.getElementById('protoBadge').textContent = data.badge;
    document.getElementById('protoTitle').textContent = data.title;
    document.getElementById('protoText').textContent = data.text;
    document.getElementById('protoAdv').textContent = data.adv;
    document.getElementById('protoCon').textContent = data.con;
    document.getElementById('protoUse').textContent = data.use;
    document.querySelector('.ack-line').style.opacity = btn.dataset.protocol === 'tcp' ? '1' : '0';
  }));

  const urlParts = {
    protocol: ['Protocole','https','La manière utilisée pour communiquer avec le serveur.'],
    domain: ['Nom de domaine','example.com','Le nom facile à retenir. Le DNS permettra ensuite de retrouver l’adresse IP correspondante.'],
    port: ['Port','443','Le numéro qui permet de viser précisément le bon service sur la machine.'],
    path: ['Chemin','/products','L’endroit ou la ressource précise que l’on demande au serveur.'],
    params: ['Paramètres','?id=42','Des informations supplémentaires transmises avec l’adresse. Ici, par exemple, l’identifiant 42.']
  };
  const urlButtons = document.querySelectorAll('[data-urlpart]');
  const urlExplanation = document.getElementById('urlExplanation');
  function showUrlPart(btn) {
    urlButtons.forEach(b => b.classList.toggle('active', b === btn));
    const [label, value, desc] = urlParts[btn.dataset.urlpart];
    urlExplanation.innerHTML = `<span>${label}</span><strong>${value}</strong><p>${desc}</p>`;
  }
  urlButtons.forEach(btn => btn.addEventListener('click', () => showUrlPart(btn)));
  if (urlButtons[0]) showUrlPart(urlButtons[0]);

  const serverLoads = [0,0,0];
  const serverBoxes = [...document.querySelectorAll('.server-box')];
  const sendRequest = document.getElementById('sendRequest');
  function renderLoads() {
    serverBoxes.forEach((box, i) => {
      box.querySelector('.server-load i').style.width = `${Math.min(serverLoads[i] * 20, 100)}%`;
      box.querySelector('small b').textContent = serverLoads[i];
      box.querySelector('small').lastChild.textContent = ` requête${serverLoads[i] > 1 ? 's' : ''}`;
    });
  }
  sendRequest?.addEventListener('click', () => {
    const min = Math.min(...serverLoads);
    const candidates = serverLoads.map((v,i) => v === min ? i : -1).filter(i => i >= 0);
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    serverLoads[target]++;
    serverBoxes.forEach((b,i) => b.classList.toggle('chosen', i === target));
    renderLoads();
    setTimeout(() => { serverLoads[target] = Math.max(0, serverLoads[target] - 1); renderLoads(); serverBoxes[target].classList.remove('chosen'); }, 2800);
  });

  const journeySteps = [
    {name:'Recherche', icon:'#i-search', text:'Tu écris ta recherche dans le navigateur et tu la valides. C’est le point de départ.'},
    {name:'URL', icon:'#i-link', text:'Le navigateur travaille avec l’adresse du site : protocole, nom de domaine, port éventuel, chemin et paramètres.'},
    {name:'DNS', icon:'#i-search', text:'Le nom google.com doit être associé à une adresse IP. Le DNS joue le rôle d’annuaire.'},
    {name:'IP', icon:'#i-monitor', text:'L’adresse IP permet maintenant d’identifier la machine ou le réseau à joindre.'},
    {name:'Port', icon:'#i-building', text:'Le port permet de viser le bon service sur la machine distante.'},
    {name:'TCP', icon:'#i-split', text:'La communication utilise TCP : une connexion est établie avant l’échange des données.'},
    {name:'Paquets', icon:'#i-box', text:'La demande est transportée sous forme de petits morceaux : les paquets réseau.'},
    {name:'Routeur', icon:'#i-router', text:'Le routeur reçoit les paquets et les redirige vers la prochaine étape du trajet.'},
    {name:'FAI', icon:'#i-wifi', text:'Les données passent ensuite par ton fournisseur d’accès à Internet.'},
    {name:'Internet', icon:'#i-globe', text:'Les paquets traversent plusieurs réseaux reliés entre eux jusqu’au réseau de Google.'},
    {name:'Réseau Google', icon:'#i-globe', text:'La demande atteint l’infrastructure réseau de Google.'},
    {name:'Load balancer', icon:'#i-split', text:'Un load balancer répartit les demandes afin d’éviter qu’un seul serveur absorbe tout le travail.'},
    {name:'Serveur', icon:'#i-server', text:'Un serveur Google reçoit la demande et lance le traitement nécessaire.'},
    {name:'Index', icon:'#i-database', text:'Le moteur ne scanne pas tout le Web en direct : il cherche dans l’index constitué auparavant.'},
    {name:'Moteur', icon:'#i-search', text:'Le moteur trouve plusieurs pages, les classe et prépare les résultats.'},
    {name:'Résultats', icon:'#i-file', text:'La réponse contenant les résultats est prête à repartir vers toi.'},
    {name:'Retour Internet', icon:'#i-globe', text:'Les données retraversent Internet dans l’autre sens pour revenir jusqu’à ton réseau.', return:true},
    {name:'Navigateur', icon:'#i-monitor', text:'Le navigateur reçoit la réponse et affiche enfin les résultats à l’écran.', return:true}
  ];
  const journeyTrack = document.getElementById('journeyTrack');
  const journeyDetail = document.getElementById('journeyDetail');
  let currentStep = 0;
  let journeyTimer = null;
  let journeyRunning = false;

  function buildJourney() {
    journeyTrack.innerHTML = '';
    journeySteps.forEach((step, i) => {
      const node = document.createElement('div');
      node.className = `journey-node${step.return ? ' return' : ''}`;
      node.dataset.index = i;
      node.innerHTML = `<button aria-label="Étape ${i+1} : ${step.name}"><svg><use href="${step.icon}"/></svg></button><small>${step.name}</small>`;
      node.addEventListener('click', () => { stopJourney(); setJourney(i, true); });
      journeyTrack.appendChild(node);
    });
    const packet = document.createElement('span');
    packet.className = 'journey-packet'; packet.id = 'journeyPacket'; journeyTrack.appendChild(packet);
    setJourney(0);
  }
  function updateJourneyPacket() {
    const nodes = [...journeyTrack.querySelectorAll('.journey-node')];
    const node = nodes[currentStep];
    const packet = document.getElementById('journeyPacket');
    if (packet && node) packet.style.left = `${node.offsetLeft + node.offsetWidth / 2 - 4.5}px`;
  }

  function centerJourneyNode(index, smooth = true) {
    const wrap = journeyTrack.closest('.journey-track-wrap');
    const node = journeyTrack.querySelector(`.journey-node[data-index="${index}"]`);
    if (!wrap || !node) return;

    const targetLeft = node.offsetLeft + node.offsetWidth / 2 - wrap.clientWidth / 2;
    wrap.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  function setJourney(index, centerHorizontally = false) {
    currentStep = index;
    const nodes = [...journeyTrack.querySelectorAll('.journey-node')];
    nodes.forEach((n,i) => { n.classList.toggle('active', i === index); n.classList.toggle('done', i < index); });
    const step = journeySteps[index];
    journeyDetail.innerHTML = `<div class="journey-detail-icon"><svg><use href="${step.icon}"/></svg></div><div><span class="journey-step-label">Étape ${index+1} sur ${journeySteps.length}</span><h3>${step.name}</h3><p>${step.text}</p></div>`;
    updateJourneyPacket();
    if (centerHorizontally) centerJourneyNode(index);
  }
  function stopJourney() { clearTimeout(journeyTimer); journeyRunning = false; const btn=document.getElementById('journeyPlay'); if(btn) btn.innerHTML='<svg><use href="#i-play"/></svg> Lancer la recherche'; }
  function advanceJourney() {
    if (!journeyRunning) return;
    if (currentStep >= journeySteps.length - 1) { stopJourney(); return; }
    journeyTimer = setTimeout(() => { setJourney(currentStep + 1, true); advanceJourney(); }, 1050);
  }
  document.getElementById('journeyPlay')?.addEventListener('click', () => {
    if (journeyRunning) { stopJourney(); return; }
    if (currentStep >= journeySteps.length - 1) setJourney(0, true);
    journeyRunning = true;
    document.getElementById('journeyPlay').innerHTML = '<svg><use href="#i-x"/></svg> Arrêter';
    advanceJourney();
  });
  document.getElementById('journeyReset')?.addEventListener('click', () => { stopJourney(); setJourney(0, true); });
  addEventListener('resize', updateJourneyPacket);
  buildJourney();
})();
