// ---- reveal mechanism ----
function reveal() {
  document.getElementById('glitch-screen').style.display = 'none';
  document.getElementById('hub').hidden = false;
  buildZeroWidthClue();
  updateCanvas();
}
window.reveal = reveal; // call reveal() in the console to proceed
if (location.hash === '#awake') reveal();

// ---- puzzle 1: zero-width unicode ----
function buildZeroWidthClue() {
  const word = "ECHO";
  let bits = '';
  for (const ch of word) bits += ch.charCodeAt(0).toString(2).padStart(8, '0');
  let hidden = '';
  for (const b of bits) hidden += (b === '0') ? '\u200B' : '\u200C';
  document.getElementById('zw-text').textContent =
    "the transmission repeats, waiting for someone paying attention." + hidden;
  // hint for players: paste this paragraph into any zero-width character decoder
}

// ---- color unlock state ----
function getUnlocked() {
  return new Set(JSON.parse(localStorage.getItem('unlockedColors') || '[]'));
}
function saveUnlocked(set) {
  localStorage.setItem('unlockedColors', JSON.stringify([...set]));
}

function tryUnlock(puzzleId, answer, colors) {
  const input = document.querySelector(`#${puzzleId} input`).value.trim();
  if (input.toUpperCase() === answer) {
    const set = getUnlocked();
    colors.forEach(c => set.add(c));
    saveUnlocked(set);
    document.getElementById(puzzleId).style.opacity = '0.4';
    document.querySelector(`#${puzzleId} input`).disabled = true;
    updateCanvas();
  } else {
    alert('not it.');
  }
}

// ---- canvas compositing ----
const LAYER_ORDER = ['white','black','cyan','red','green','blue','magenta','yellow'];

function updateCanvas() {
  const unlocked = getUnlocked();
  const canvas = document.getElementById('composite');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let loaded = 0;
  const toDraw = LAYER_ORDER.filter(c => c === 'white' || unlocked.has(c));
  if (toDraw.length === 0) return;

  toDraw.forEach(color => {
    const img = new Image();
    img.src = `layers/${color}.png`;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      loaded++;
      if (loaded === toDraw.length && unlocked.size === 7) {
        document.getElementById('final-msg').hidden = false;
      }
    };
  });
}

// run once on load in case colors were already unlocked in a previous visit
window.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('hub').hidden) updateCanvas();
});