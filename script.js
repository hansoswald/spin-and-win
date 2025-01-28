const services = [
  { name: 'Logo Design', slogan: 'Your brand identity!', price: '10,000', features: 'High-quality vector logo' },
  { name: 'Flyer Design', slogan: 'Attractive promotions!', price: '10,000', features: 'Custom, eye-catching design' },
  { name: 'Poster Design', slogan: 'Catch attention anywhere!', price: '10,000', features: 'Large-scale, impactful design' },
  { name: 'Business Card Design', slogan: 'Professional networking!', price: '10,000', features: 'Sleek and memorable cards' },
];

let isGameUnlocked = false;
let spinHistory = [];

// Multi-language support
const languages = {
  en: {
    instructions: "How to Play:",
    steps: [
      "Click the 'Share on WhatsApp' button to share the game link with a friend.",
      "Once shared, the spin feature will be unlocked.",
      "Click 'Spin the Wheel' to win exciting prizes!",
      "Take a screenshot of your result.",
      "Send the screenshot to our WhatsApp to claim your prize.",
      "Make sure to include your name and contact details."
    ],
    spinButton: "Spin the Wheel",
    shareButton: "Share on WhatsApp",
    historyButton: "View Spin History",
    unlockedMessage: " Share on WhatsApp to spin the wheel!"
  },
  sw: {
    instructions: "Jinsi ya Kucheza:",
    steps: [
      "Bonyeza kitufe cha 'Shiriki kwenye WhatsApp' kushiriki kiungo cha mchezo na rafiki.",
      "Ukishiriki, kipengele cha kuzungusha kitawekwa wazi.",
      "Bonyeza 'Zungusha Gurudumu' kushinda zawadi za kusisimua!",
      "Chukua picha ya skrini ya matokeo yako.",
      "Tuma picha ya skrini kwenye WhatsApp yetu kudai zawadi yako.",
      "Hakikisha umejumuisha jina na maelezo yako ya mawasiliano."
    ],
    spinButton: "Zungusha Gurudumu",
    shareButton: "Shiriki kwenye WhatsApp",
    historyButton: "Angalia Historia ya Gurudumu",
    unlockedMessage: "Shiriki kwenye WhatsApp kuzungusha gurudumu!"
  }
};

let currentLanguage = "en";

function setLanguage(language) {
  currentLanguage = language;
  updateTexts();
}

function updateTexts() {
  const lang = languages[currentLanguage];
  document.getElementById("instructions").querySelector("h2").textContent = lang.instructions;
  const steps = document.getElementById("instructions").querySelector("ol");
  steps.innerHTML = lang.steps.map(step => `<li>${step}</li>`).join("");

  document.getElementById("spin-btn").textContent = lang.spinButton;
  document.getElementById("share-btn").textContent = lang.shareButton;
  document.getElementById("history-btn").textContent = lang.historyButton;
  document.getElementById("share-status").textContent = lang.unlockedMessage;
}

// Sound effects
const spinSound = new Audio("32.wav");
const winSound = new Audio("win.wav");

// Share on WhatsApp
function shareOnWhatsApp() {
  const message = encodeURIComponent(
    "Check out this amazing spinning game and win exciting prizes! [Your Game Link]"
  );
  const url = `https://api.whatsapp.com/send?text=${message}`;
  window.open(url, '_blank');

  isGameUnlocked = true;
  document.getElementById('share-status').textContent = 'Game unlocked! You can now spin the wheel!';
  document.getElementById('spin-btn').disabled = false;
}

// Toggle Instructions
document.getElementById('instructions-btn').addEventListener('click', () => {
  const instructions = document.getElementById('instructions');
  instructions.classList.toggle('hidden');
  const ariaHidden = instructions.classList.contains('hidden');
  instructions.setAttribute('aria-hidden', ariaHidden.toString());
});

// Check localStorage availability
function isLocalStorageAvailable() {
  try {
    localStorage.setItem('_test', 'test');
    localStorage.removeItem('_test');
    return true;
  } catch (e) {
    return false;
  }
}

// Spin the Wheel
function spinWheel() {
  if (!isGameUnlocked) {
    alert('You must share the game to unlock the spin feature!');
    return;
  }

  spinSound.play(); // Play spin sound

  // Hide the popup result before spinning
  const popup = document.getElementById('popup-result');
  popup.classList.add('hidden');

  const wheel = document.getElementById('wheel');
  const ctx = wheel.getContext('2d');
  const totalSegments = services.length;
  const segmentAngle = (2 * Math.PI) / totalSegments;
  const spinDuration = 3000; 
  const spinAngle = Math.random() * 2 * Math.PI;

  let startTime = null;

  function animateSpin(timestamp) {
    if (!startTime) startTime = timestamp;

    const progress = (timestamp - startTime) / spinDuration;
    const currentAngle = spinAngle + progress * 10 * Math.PI;

    ctx.clearRect(0, 0, wheel.width, wheel.height);
    drawWheel(ctx, totalSegments, segmentAngle, currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      const winnerIndex = Math.floor(((spinAngle + currentAngle) / segmentAngle) % totalSegments);
      const winner = services[winnerIndex];

      winSound.play(); // Play win sound

      spinHistory.push({ ...winner, id: Date.now() });
      if (isLocalStorageAvailable()) {
        localStorage.setItem('spinHistory', JSON.stringify(spinHistory));
      }
      showResult(winner);
    }
  }

  requestAnimationFrame(animateSpin);
}

// Draw Wheel
function drawWheel(ctx, segments, segmentAngle, rotation = 0) {
  const colors = ['#ff6f61', '#6b8e23', '#3b9f9f', '#ffc107'];
  const radius = 200;

  ctx.save();
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.rotate(rotation);
  for (let i = 0; i < segments; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const color = colors[i % colors.length];

    ctx.beginPath();
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.lineTo(0, 0);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.save();
    ctx.translate(
      Math.cos(startAngle + segmentAngle / 2) * radius * 0.7,
      Math.sin(startAngle + segmentAngle / 2) * radius * 0.7
    );
    ctx.rotate(startAngle + segmentAngle / 2 + Math.PI / 2);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(services[i].name, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// Show Result
function showResult(service) {
  const popup = document.getElementById('popup-result');
  popup.innerHTML = `
    🎉 You Won ${service.name}! 🎉<br>
    <strong>Offer Price:</strong> ${service.price}
  `;
  popup.classList.remove('hidden');

  setTimeout(() => {
    popup.classList.add('hidden');
  }, 5000);
}

// Generate Falling Effects
function generateEffects() {
  const effectsContainer = document.getElementById("effects-container");
  effectsContainer.innerHTML = "";

  for (let i = 0; i < 100; i++) { // Increased confetti count
    const effect = document.createElement("div");
    effect.className = "effect";
    effect.style.left = `${Math.random() * 100}%`;
    effect.style.animationDuration = `${2 + Math.random() * 3}s`;
    effect.style.transform = `rotate(${Math.random() * 360}deg)`;
    effect.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    effectsContainer.appendChild(effect);
  }
}


// View Spin History
function viewHistory() {
  const savedHistory = localStorage.getItem('spinHistory');
  spinHistory = savedHistory ? JSON.parse(savedHistory) : [];

  if (spinHistory.length === 0) {
    alert('No spin history found.');
    return;
  }

  const historyText = spinHistory
    .map(
      (entry, index) =>
        `Spin #${index + 1}\nService: ${entry.name}\nWinning ID: ${entry.id}\n---`
    )
    .join('\n');

  alert(historyText);
}

document.getElementById('share-btn').addEventListener('click', shareOnWhatsApp);
document.getElementById('spin-btn').addEventListener('click', spinWheel);
document.getElementById('history-btn').addEventListener('click', viewHistory);
