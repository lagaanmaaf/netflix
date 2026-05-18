window.showHome = showHome;
window.showGridPage = showGridPage;
window.showCredits = showCredits;
window.playHeroVideoFullscreen = playHeroVideoFullscreen;
window.handleHeroPlay = handleHeroPlay;
window.closeVideoPlayer = closeVideoPlayer;
window.showToast = showToast;
window.handleGlobalCardClick = handleGlobalCardClick;
window.showVideo = showVideo;
window.prevSlide = prevSlide;
window.nextSlide = nextSlide;
window.showLoveLetter = showLoveLetter;
window.showTimeline = showTimeline;
window.showReasons = showReasons;
window.showPromises = showPromises;
window.showStarWish = showStarWish;
window.toggleMusic = toggleMusic;
window.toggleMusicPlayer = toggleMusicPlayer;
window.seekMusic = seekMusic;


async function loadAllSavedMedia(uid) {
  if (!storage) return;
  try {
    const folderRef = ref(storage, `${STORAGE_PATH}/${uid}`);
    const result = await listAll(folderRef);
    for(const itemRef of result.items) {
      try { const url = await getDownloadURL(itemRef); applyMedia(itemRef.name, url); } catch(e){}
    }
  } catch(err){}
}
function applyMedia(key, url) {
  if(key === 'hero-video-src') {
    const vid = document.getElementById('hero-video');
    const srcEl = document.getElementById('hero-video-src');
    if(srcEl && vid) { srcEl.src = url; vid.load(); }
  } else {
    const el = document.getElementById(key);
    if(el) el.src = url;
  }
}

// ── Page Management & Music Autoplay ──
let hasMusicAutoplayed = false;
let wasMusicPlayingBeforeVideo = false;

function hideAllPages() {
  ['intro','home','grid-page','video-page','credits','love-letter-page','timeline-page','reasons-page','promises-page','starwish-page'].forEach(id => {
    const el = document.getElementById(id);
    if(el) { el.style.display = 'none'; }
  });
  closeVideoPlayer();
}

function showHome() {
  hideAllPages();
  document.getElementById('home').style.display = 'block';
  window.scrollTo(0,0);
  observeFadeIns();
  
  // Autoplay music on entry if not started already
  if (!hasMusicAutoplayed) {
    hasMusicAutoplayed = true;
    audio.play().then(() => {
        isMusicPlaying = true;
        document.getElementById('mp-play-btn').textContent = '⏸';
        document.getElementById('mp-vinyl').classList.add('playing');
    }).catch(err => {
        console.log("Audio autoplay was prevented:", err);
    });
  }
}

function showGridPage(event, targetSectionId = null) {
  if(event) event.stopPropagation();
  hideAllPages();
  document.getElementById('grid-page').style.display = 'block';
  window.scrollTo(0,0);
  const gridContainer = document.getElementById('grid-container');
  gridContainer.innerHTML = '';
  const allCards = Array.from(document.querySelectorAll('.row-cards .card'));
  let orderedCards = allCards;
  if(targetSectionId) {
    const targetCards = Array.from(document.querySelectorAll(`#${targetSectionId} .card`));
    const otherCards = allCards.filter(c => !targetCards.includes(c));
    orderedCards = [...targetCards, ...otherCards];
  }
  orderedCards.forEach((originalCard) => {
    const clone = originalCard.cloneNode(true);
    const overlay = clone.querySelector('.view-all-overlay');
    if(overlay) overlay.remove();
    const originalIndex = allCards.indexOf(originalCard);
    clone.onclick = () => { const imgEl = clone.querySelector('img'); addToRecentlyWatched({ id: 'mem-'+originalIndex, action:`showVideo(${originalIndex})`, img: imgEl.src, title:`Memory ${originalIndex+1}` }); showVideo(originalIndex); };
    gridContainer.appendChild(clone);
  });
}
function showCredits() {
  hideAllPages();
  document.getElementById('credits').style.display = 'flex';
  window.scrollTo(0,0);
  launchHearts();
}

// ── LOVE LETTER ──
const letterText = `You know what's funny?
I never planned any of this.
I never planned to notice you the way I did,
never planned to think about you at 2am,
never planned to fall so completely, so quietly,
that by the time I realized it — I was already yours.

And the thing is — I'm not even scared of that.

Being yours feels like the safest place I've ever been.
Like finally exhaling after holding my breath for years.
Like the universe said: here, this one is for you.

I don't need the perfect words.
I just need you to know —
you are the best thing that ever chose me back.

Every fight we've had, every silence, every reunion —
all of it was worth it.
All of it led here.

I love you more than I'll ever be able to say.
But I'll spend my whole life trying.`;

function showLoveLetter() {
  hideAllPages();
  const page = document.getElementById('love-letter-page');
  page.style.display = 'flex';
  page.style.flexDirection = 'column';
  page.style.alignItems = 'center';
  window.scrollTo(0,0);
  const now = new Date();
  document.getElementById('letter-date').textContent = now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const bodyEl = document.getElementById('letter-body');
  bodyEl.innerHTML = '';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.className = 'letter-cursor';
  bodyEl.appendChild(cursor);
  function typeChar() {
    if(i < letterText.length) {
      cursor.before(document.createTextNode(letterText[i]));
      i++;
      setTimeout(typeChar, 22 + Math.random() * 18);
    }
  }
  setTimeout(typeChar, 400);
}

// ── TIMELINE ──
const timelineEvents = [
  { date: 'The Beginning', title: 'Two Strangers Meet', desc: 'Neither of us knew that this was the start of everything. The universe had already made up its mind.', emoji: '✨' },
  { date: 'First Conversation', title: 'Words That Changed Everything', desc: 'Something about talking to you felt different. Like I had known you before. Like home.', emoji: '💬' },
  { date: 'First Laugh Together', title: 'When You Made Me Laugh', desc: 'I still remember when I first really laughed with you. That laugh changed something in me forever.', emoji: '😄' },
  { date: 'The College Days', title: 'Birthday Celebration — IMI', desc: 'Same corridors, same city, different worlds — until they became one world.', emoji: '🎓' },
  { date: 'That One Day', title: 'The Day I Knew', desc: 'There was a moment. A quiet, ordinary moment. And I knew — this person is mine and I am theirs.', emoji: '💡' },
  { date: 'Every Memory Since', title: 'Building a World Together', desc: 'Every photo in this collection. Every memory. Every moment. This is what we built.', emoji: '🌍' },
  { date: 'Today & Always', title: 'Still Choosing You', desc: 'And here we are. Still us. Still choosing. Still writing the most beautiful story.', emoji: '❤️' },
];
function showTimeline(event) {
  if(event) event.stopPropagation();
  hideAllPages();
  const page = document.getElementById('timeline-page');
  page.style.display = 'block';
  window.scrollTo(0,0);
  const container = document.getElementById('timeline-container');
  container.innerHTML = '';
  timelineEvents.forEach((ev, i) => {
    const item = document.createElement('div');
    item.className = 'tl-item';
    item.innerHTML = `
      <div class="tl-spacer"></div>
      <div style="position:relative;display:flex;align-items:flex-start;justify-content:center;width:40px;flex-shrink:0;">
        <div class="tl-dot"></div>
      </div>
      <div class="tl-content">
        <div class="tl-date">${ev.date}</div>
        <div class="tl-title">${ev.title}</div>
        <div class="tl-desc">${ev.desc}</div>
        <div class="tl-emoji">${ev.emoji}</div>
      </div>
    `;
    container.appendChild(item);
    setTimeout(() => { item.classList.add('visible'); }, i * 200 + 300);
  });
}

// ── REASONS ──
const reasons = [
  { emoji: '😂', title: 'The Way You Laugh', body: 'Your laugh is the most genuine thing I have ever heard. It is loud and unfiltered and it makes me feel like everything in the world is okay.' },
  { emoji: '🧠', title: 'Your Beautiful Mind', body: 'The way you think about things — deeply, carefully, with such heart — it is one of the most attractive things about you.' },
  { emoji: '🤗', title: 'How You Care', body: 'You care so fiercely. For people, for feelings, for the little things others miss. That tenderness in you is extraordinary.' },
  { emoji: '🌧️', title: 'You Stay Through the Hard Parts', body: 'You don\'t run when things get difficult. You stay. You show up. That means more to me than you will ever know.' },
  { emoji: '✨', title: 'You Make Ordinary Days Magical', body: 'The most ordinary Tuesday with you feels like an event. You have this gift of making everything feel special.' },
  { emoji: '🎯', title: 'Your Drive', body: 'Watching you go after what you want — with that quiet, determined fire — makes me proud every single day.' },
  { emoji: '🫀', title: 'You Chose Me Back', body: 'Out of everyone, you looked at me — all my mess, all my flaws — and you chose me. That is everything.' },
  { emoji: '🌙', title: 'Late Night Conversations', body: 'Every late night talk with you felt like discovering a new universe. I could talk to you forever and never run out of reasons to.' },
  { emoji: '🎭', title: 'You Are Unapologetically You', body: 'You never pretend. You never perform. You are just — gloriously, completely you. And that is the most beautiful thing.' },
  { emoji: '🏡', title: 'You Feel Like Home', body: 'No address, no building — just you. Wherever you are is where I want to be. You are the definition of home.' },
];
function showReasons() {
  hideAllPages();
  const page = document.getElementById('reasons-page');
  page.style.display = 'block';
  window.scrollTo(0,0);
  const grid = document.getElementById('reasons-grid');
  grid.innerHTML = '';
  reasons.forEach((r, i) => {
    const card = document.createElement('div');
    card.className = 'reason-card';
    card.innerHTML = `
      <div class="reason-num">0${i+1}</div>
      <div class="reason-emoji">${r.emoji}</div>
      <div class="reason-title">${r.title}</div>
      <div class="reason-body">${r.body}</div>
      <div class="reveal-hint">✦ tap to reveal</div>
    `;
    card.onclick = () => card.classList.toggle('revealed');
    grid.appendChild(card);
  });
}

// ── PROMISES ──
function showPromises() {
  hideAllPages();
  const page = document.getElementById('promises-page');
  page.style.display = 'flex';
  page.style.flexDirection = 'column';
  page.style.alignItems = 'center';
  window.scrollTo(0,0);
}

// ── STAR WISH ──
const starMessages = [
  "You are the most beautiful thing that ever happened to me. ✨",
  "Every star up there knows your name. 🌟",
  "In another life, I'd find you again. And again. And again. 💫",
  "You make the universe make sense. 🌌",
  "I fell in love with you slowly, then all at once. ❤️",
  "You are my favourite 'what if' that became real. 🌠",
  "If I could bottle a feeling, it would be you. 💖",
  "Home is not a place. Home is you. 🏡",
  "I'd cross every distance just to reach you. 💌",
  "You're my favourite notification, thought, and person. 📱❤️",
  "I love you more than words have ever been invented to say. 🌹",
  "You are the reason I believe in magic. ✨",
  "Growing old with you is my favourite plan. 👫",
  "You changed the way I see everything. 🌅",
  "I choose you. Today. Tomorrow. Always. 💍",
];
let starPositions = [];
function showStarWish() {
  hideAllPages();
  const page = document.getElementById('starwish-page');
  page.style.display = 'flex';
  window.scrollTo(0,0);
  const canvas = document.getElementById('starwish-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  starPositions = [];
  for(let i = 0; i < 120; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 2.5 + 0.5;
    const twinkle = Math.random() > 0.7;
    starPositions.push({ x, y, r, msg: starMessages[Math.floor(Math.random() * starMessages.length)], twinkle, phase: Math.random() * Math.PI * 2 });
  }
  let animFrame;
  function drawStars(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    starPositions.forEach(s => {
      const alpha = s.twinkle ? 0.5 + 0.5 * Math.sin(ts / 800 + s.phase) : 0.9;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, ${200 + Math.floor(Math.random()*5)}, ${200 + Math.floor(Math.random()*5)}, ${alpha})`;
      ctx.shadowBlur = s.r > 1.5 ? 8 : 3;
      ctx.shadowColor = 'rgba(255,150,150,0.7)';
      ctx.fill();
    });
    animFrame = requestAnimationFrame(drawStars);
  }
  drawStars(0);
  canvas._cancelAnim = () => cancelAnimationFrame(animFrame);
  const hint = document.getElementById('starwish-hint');
  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let closest = null, minDist = 30;
    starPositions.forEach(s => {
      const d = Math.hypot(s.x - mx, s.y - my);
      if(d < minDist) { minDist = d; closest = s; }
    });
    document.querySelectorAll('.star-popup').forEach(p => p.remove());
    if(closest) {
      hint.style.opacity = '0';
      const popup = document.createElement('div');
      popup.className = 'star-popup';
      popup.innerHTML = `<p>${closest.msg}</p>`;
      popup.style.left = Math.min(mx, window.innerWidth - 280) + 'px';
      popup.style.top = (my - 80) + 'px';
      page.appendChild(popup);
      setTimeout(() => popup.remove(), 4000);
    }
  };
}

// ── MUSIC PLAYER ──
const audio = new Audio('song.mp3');
audio.loop = false;
let musicVisible = false;
let isMusicPlaying = false;

function toggleMusicPlayer() {
  musicVisible = !musicVisible;
  const player = document.getElementById('music-player');
  player.classList.toggle('show', musicVisible);
}
function toggleMusic() {
  if(isMusicPlaying) {
    audio.pause();
    isMusicPlaying = false;
    document.getElementById('mp-play-btn').textContent = '▶';
    document.getElementById('mp-vinyl').classList.remove('playing');
  } else {
    audio.play().catch(() => showToast('🎵 Place song.mp3 in the same folder to play!'));
    isMusicPlaying = true;
    document.getElementById('mp-play-btn').textContent = '⏸';
    document.getElementById('mp-vinyl').classList.add('playing');
  }
}
audio.addEventListener('timeupdate', () => {
  if(audio.duration) document.getElementById('mp-fill').style.width = (audio.currentTime / audio.duration * 100) + '%';
});
audio.addEventListener('ended', () => {
  isMusicPlaying = false;
  document.getElementById('mp-play-btn').textContent = '▶';
  document.getElementById('mp-vinyl').classList.remove('playing');
});
function seekMusic(e) {
  const bar = document.getElementById('mp-progress-bar');
  const rect = bar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  if(audio.duration) audio.currentTime = pct * audio.duration;
}
document.getElementById('upload-song').addEventListener('change', function(e) {
  const file = e.target.files[0]; if(!file) return;
  if(isMusicPlaying) { audio.pause(); isMusicPlaying = false; document.getElementById('mp-play-btn').textContent = '▶'; document.getElementById('mp-vinyl').classList.remove('playing'); }
  audio.src = URL.createObjectURL(file);
  document.getElementById('mp-song-title').textContent = file.name.replace(/\.[^.]+$/, '');
  showToast('🎵 Song loaded! Hit play ▶');
  if(!musicVisible) { musicVisible = true; document.getElementById('music-player').classList.add('show'); }
});

// ── VIDEO THUMBNAIL CAPTURE ──
function captureVideoThumbnail(videoEl) {
  return new Promise((resolve) => {
    // Determine the actual source URL
    const videoSrc = videoEl.src || videoEl.currentSrc || (videoEl.querySelector('source') ? videoEl.querySelector('source').src : '');
    
    if (!videoEl || !videoSrc || videoEl.readyState < 2) {
      resolve(null);
      return;
    }
    const canvas = document.getElementById('thumb-capture-canvas');
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    try {
      ctx.drawImage(videoEl, 0, 0, 320, 180);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    } catch(e) {
      resolve(null);
    }
  });
}

// ── RECENTLY WATCHED ──
let recentlyWatchedItems = [];
function addToRecentlyWatched(item) {
  recentlyWatchedItems = recentlyWatchedItems.filter(i => i.id !== item.id);
  recentlyWatchedItems.unshift(item);
  if(recentlyWatchedItems.length > 10) recentlyWatchedItems.pop();
  renderRecentlyWatched();
}
function renderRecentlyWatched() {
  const section = document.getElementById('recently-watched-section');
  const container = document.getElementById('recently-watched-cards');
  if(recentlyWatchedItems.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  container.innerHTML = '';
  recentlyWatchedItems.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'continue-card';
    card.setAttribute('onclick', item.action);
    const randProgress = Math.floor(Math.random() * 60 + 20);
    const thumbSrc = item.videoThumb || item.img;
    card.innerHTML = `<div class="thumb"><img src="${thumbSrc}" alt="${item.title}"></div><div class="progress-bar"><div class="progress-fill" style="width:${randProgress}%"></div></div><div class="info"><strong>📌 ${item.title}</strong>Recently Watched</div>`;
    container.appendChild(card);
  });
}

// ── HERO ──
async function handleHeroPlay(event) {
  if(event) event.stopPropagation();
  const heroImg = document.getElementById('hero-img-el');
  const heroVideo = document.getElementById('hero-video');

  let videoThumb = null;
  const videoSrc = heroVideo ? (heroVideo.src || heroVideo.currentSrc || (heroVideo.querySelector('source') ? heroVideo.querySelector('source').src : '')) : '';

  if (heroVideo && heroVideo.readyState >= 2) {
    videoThumb = await captureVideoThumbnail(heroVideo);
  } else if (heroVideo && videoSrc) {
    videoThumb = await new Promise((resolve) => {
      const tempVideo = document.createElement('video');
      tempVideo.src = videoSrc;
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.muted = true;
      tempVideo.currentTime = 1;
      tempVideo.addEventListener('seeked', function onSeeked() {
        tempVideo.removeEventListener('seeked', onSeeked);
        const canvas = document.getElementById('thumb-capture-canvas');
        canvas.width = 320;
        canvas.height = 180;
        try {
          canvas.getContext('2d').drawImage(tempVideo, 0, 0, 320, 180);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch(e) { resolve(null); }
      });
      tempVideo.addEventListener('error', () => resolve(null));
      setTimeout(() => resolve(null), 3000); 
    });
  }

  addToRecentlyWatched({
    id: 'hero',
    action: `playHeroVideoFullscreen()`,
    img: heroImg ? heroImg.src : '',
    videoThumb: videoThumb, 
    title: `Our Story (Series)`
  });

  playHeroVideoFullscreen();
}

function playHeroVideoFullscreen() {
  document.getElementById('video-player').style.display = 'flex';
  const fsVid = document.getElementById('fs-video');
  const srcEl = document.getElementById('hero-video-src');
  fsVid.src = srcEl.src;
  
  // Pause the background music when the full-screen video begins playing
  wasMusicPlayingBeforeVideo = isMusicPlaying;
  if(isMusicPlaying) {
    audio.pause();
    isMusicPlaying = false;
    document.getElementById('mp-play-btn').textContent = '▶';
    document.getElementById('mp-vinyl').classList.remove('playing');
  }

  fsVid.play();
}

function closeVideoPlayer() {
  const vp = document.getElementById('video-player');
  if(vp) vp.style.display = 'none';
  const fsVid = document.getElementById('fs-video');
  if(fsVid) { fsVid.pause(); fsVid.currentTime = 0; }
  
  // Resume the background music if it was playing before we opened the video
  if(wasMusicPlayingBeforeVideo) {
    audio.play().catch(()=>{});
    isMusicPlaying = true;
    document.getElementById('mp-play-btn').textContent = '⏸';
    document.getElementById('mp-vinyl').classList.add('playing');
    wasMusicPlayingBeforeVideo = false; // reset the tracker
  }
}

// ── MISC ──
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if(nb) nb.classList.toggle('scrolled', window.scrollY > 50);
});
function observeFadeIns() {
  const obs = new IntersectionObserver(entries => { entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); }); }, { threshold: 0.15 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// Hero hover video
const heroSection = document.getElementById('hero-section');
const heroVideo = document.getElementById('hero-video');
heroSection.addEventListener('mouseenter', () => heroVideo.play().catch(()=>{}));
heroSection.addEventListener('mouseleave', () => heroVideo.pause());

// Uploads
document.getElementById('profile-upload').addEventListener('change', async function(e) {
  const file = e.target.files[0]; if(!file) return;
  document.getElementById('profile-img').src = URL.createObjectURL(file);
  showToast('⏳ Uploading...'); await saveMedia('profile-img', file);
});
document.getElementById('upload-credits-photo').addEventListener('change', async function(e) {
  const file = e.target.files[0]; if(!file) return;
  document.getElementById('credits-photo-img').src = URL.createObjectURL(file);
  showToast('⏳ Uploading...'); await saveMedia('credits-photo-img', file);
});

// ── SLIDESHOW ──
let currentSlide = 0, totalSlides = 0, autoTimer;
const captionsList = [
  "Every love story is beautiful… but ours is my favourite. 🌅",
  "In a world full of people, you were the one I was looking for. 💫",
  "You are my today and all of my tomorrows. ❤️",
  "Home is wherever I am with you, Juliet. 🏡",
  "You make every ordinary moment feel like magic. ✨",
  "And I'd choose you again, in every lifetime. 🌹",
  "You laughed and I forgot every worry I ever had. 😄",
  "Somewhere between hello and now, I fell completely. 💌",
  "These are the days I'll remember when I'm old and smiling. 🌸",
  "Every picture here holds a piece of my heart. 📷",
];
function handleGlobalCardClick(cardEl) {
  const allCards = Array.from(document.querySelectorAll('.row-cards .card'));
  const index = allCards.indexOf(cardEl);
  if(index === -1) return;
  const imgEl = cardEl.querySelector('img');
  addToRecentlyWatched({ id:'mem-'+index, action:`showVideo(${index})`, img: imgEl.src, title:`Memory ${index+1}` });
  showVideo(index);
}
function showVideo(startIndex = 0) {
  hideAllPages();
  const page = document.getElementById('video-page');
  page.style.display = 'flex';
  window.scrollTo(0,0);
  const slideshow = document.getElementById('slideshow');
  slideshow.innerHTML = '';
  const cards = Array.from(document.querySelectorAll('.row-cards .card'));
  totalSlides = cards.length;
  cards.forEach((cardEl, idx) => {
    const imgEl = cardEl.querySelector('img');
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide';
    const cap = captionsList[idx % captionsList.length];
    slideDiv.innerHTML = `<img src="${imgEl.src}" alt="Memory"><div class="caption">${cap}</div>`;
    slideshow.appendChild(slideDiv);
  });
  currentSlide = startIndex < totalSlides ? startIndex : 0;
  renderDots();
  updateSlide();
  clearInterval(autoTimer);
  autoTimer = setInterval(nextSlide, 4500);
}
function renderDots() {
  const dotsEl = document.getElementById('dots');
  dotsEl.innerHTML = '';
  const max = Math.min(totalSlides, 12);
  for(let i = 0; i < max; i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.onclick = () => { currentSlide = i; updateSlide(); };
    dotsEl.appendChild(d);
  }
}
function updateSlide() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  slides.forEach((s, i) => s.classList.toggle('active', i === currentSlide));
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  document.getElementById('slideProgress').style.width = ((currentSlide + 1) / totalSlides * 100) + '%';
  if(currentSlide === totalSlides - 1) clearInterval(autoTimer);
}
function nextSlide() { if(currentSlide < totalSlides - 1) { currentSlide++; updateSlide(); } }
function prevSlide() { if(currentSlide > 0) { currentSlide--; updateSlide(); } }

// ── HEARTS ──
function launchHearts() {
  const container = document.getElementById('hearts');
  container.innerHTML = '';
  const emojis = ['❤️','🌹','💕','✨','💗','🌸','💖','🥀'];
  for(let i = 0; i < 18; i++) {
    const h = document.createElement('div');
    h.className = 'heart';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.animationDuration = (4 + Math.random() * 6) + 's';
    h.style.animationDelay = (Math.random() * 4) + 's';
    h.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
    container.appendChild(h);
  }
}

// ── INTRO STARFIELD ──
(function initIntroStars() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  const stars = Array.from({length: 200}, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.5 + 0.2,
    speed: Math.random() * 0.0002 + 0.00005,
    phase: Math.random() * Math.PI * 2
  }));
  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(ts * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw(0);
})();
