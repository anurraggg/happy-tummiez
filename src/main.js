import './style.css'
import { getCurrentUser, logout } from './auth.js';
import { initGA, trackEvent, trackGamePlay, trackQuizComplete, trackAuth } from './analytics.js';

// Initialize Google Analytics
initGA();

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  trackEvent('menu_toggle', { action: 'hamburger_click' });
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
  });
});

// Check Auth State
const user = getCurrentUser();

if (user) {
  // If logged in, show user name and logout button
  // We need to find the existing links and append/replace
  // Let's just append for now or replace the last item if it was a login button (which we haven't added yet)
  // Actually, let's just add a Logout link and maybe a welcome message
  const logoutLink = document.createElement('a');
  logoutLink.href = '#';
  logoutLink.textContent = `Logout (${user.name})`;
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
  navLinks.appendChild(logoutLink);
} else {
  // If not logged in, show Login/Signup
  const loginLink = document.createElement('a');
  loginLink.href = '/login.html';
  loginLink.textContent = 'Login';
  navLinks.appendChild(loginLink);

  const signupLink = document.createElement('a');
  signupLink.href = '/signup.html';
  signupLink.textContent = 'Sign Up';
  signupLink.classList.add('btn-primary'); // Make it look like a button
  signupLink.style.marginLeft = '1rem';
  navLinks.appendChild(signupLink);
}

// ========== LOAD DYNAMIC CONTENT FROM CMS ==========

const API_URL = 'https://happy-tummiez-production.up.railway.app/api';

// Load Recipes from Database
async function loadRecipes() {
  try {
    const response = await fetch(`${API_URL}/recipes`);
    const recipes = await response.json();

    const recipeGrid = document.querySelector('.recipe-grid');
    if (recipeGrid && recipes.length > 0) {
      recipeGrid.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
          ${recipe.image_url
          ? `<img src="${recipe.image_url}" alt="${recipe.title}" />`
          : `<div class="placeholder-img" style="background: #FFE082; display: flex; align-items: center; justify-content: center; font-size: 3rem; height: 200px;">🍽️</div>`
        }
          <div class="recipe-info">
            <h3>${recipe.title}</h3>
            <p>${recipe.description}</p>
            <a href="#" class="read-more" onclick="showRecipeDetails(${recipe.id}); return false;">View Recipe →</a>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading recipes:', err);
  }
}

// Show recipe details (you can expand this later)
window.showRecipeDetails = (id) => {
  alert('Recipe details coming soon! Recipe ID: ' + id);
};

// Load recipes when page loads
loadRecipes();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// --- TUMMY RUNNER GAME LOGIC ---
const gameModal = document.getElementById('game-modal');
const startGameBtn = document.getElementById('start-game-btn');
const closeGameBtn = document.getElementById('close-runner');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const finalScoreEl = document.getElementById('final-score');
const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

let gameLoopId;
let score = 0;
let gameSpeed = 5;
let isGameOver = false;

const player = {
  x: 50,
  y: 200,
  width: 40,
  height: 40,
  dy: 0,
  jumpPower: -12,
  gravity: 0.6,
  grounded: false
};

let obstacles = [];

// Event Listeners for Runner
startGameBtn.addEventListener('click', () => {
  gameModal.classList.remove('hidden');
  trackGamePlay('Tummy Runner');
  initGame();
});

closeGameBtn.addEventListener('click', () => {
  gameModal.classList.add('hidden');
  cancelAnimationFrame(gameLoopId);
});

restartBtn.addEventListener('click', () => {
  gameOverEl.classList.add('hidden');
  initGame();
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && player.grounded && !gameModal.classList.contains('hidden')) {
    player.dy = player.jumpPower;
    player.grounded = false;
  }
});

function initGame() {
  score = 0;
  gameSpeed = 4; // Reduced from 5
  isGameOver = false;
  obstacles = [];
  player.y = 200;
  player.dy = 0;
  player.jumpPower = -13; // Increased jump height slightly
  scoreEl.textContent = score;
  loop();
}

function spawnObstacle() {
  // Minimum distance check could be added here, but lowering chance helps
  const type = Math.random() > 0.5 ? 'junk' : 'healthy';
  const obstacle = {
    x: canvas.width,
    y: type === 'junk' ? 360 : Math.random() * 200 + 100,
    width: 30,
    height: 30,
    type: type,
    color: type === 'junk' ? '#FF6B6B' : '#4CAF50',
    emoji: type === 'junk' ? '🍔' : '🥦'
  };
  obstacles.push(obstacle);
}

function update() {
  player.dy += player.gravity;
  player.y += player.dy;

  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.dy = 0;
    player.grounded = true;
  }

  // Reduced spawn rate from 0.02 to 0.01
  if (Math.random() < 0.01) {
    spawnObstacle();
  }

  obstacles.forEach((obs, index) => {
    obs.x -= gameSpeed;

    // Forgiving Collision Detection (Hitbox reduction)
    const padding = 5;
    if (
      player.x + padding < obs.x + obs.width - padding &&
      player.x + player.width - padding > obs.x + padding &&
      player.y + padding < obs.y + obs.height - padding &&
      player.y + player.height - padding > obs.y + padding
    ) {
      if (obs.type === 'junk') {
        gameOver();
      } else {
        score += 10;
        scoreEl.textContent = score;
        obstacles.splice(index, 1);
      }
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(index, 1);
    }
  });

  gameSpeed += 0.0005; // Slower acceleration
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f0f8ff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ddd';
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

  ctx.fillStyle = '#FF8C42';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(player.x + 25, player.y + 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(player.x + 27, player.y + 10, 2, 0, Math.PI * 2);
  ctx.fill();

  obstacles.forEach(obs => {
    ctx.font = '30px Arial';
    ctx.fillText(obs.emoji, obs.x, obs.y + 25);
  });
}

function loop() {
  if (isGameOver) return;
  update();
  draw();
  gameLoopId = requestAnimationFrame(loop);
}

function gameOver() {
  isGameOver = true;
  finalScoreEl.textContent = score;
  gameOverEl.classList.remove('hidden');
  trackEvent('game_over', { game_name: 'Tummy Runner', score: score });
}

// --- SPIN THE WHEEL GAME LOGIC ---
const wheelModal = document.getElementById('wheel-modal');
const startWheelBtn = document.getElementById('start-wheel-btn');
const closeWheelBtn = document.getElementById('close-wheel');
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('center-spin-btn');
const wheelResult = document.getElementById('wheel-result');
const resultText = document.getElementById('result-text');

const segments = [
  "No Sugar", "Eat Fiber", "Drink Water", "Walk 10m", "Sleep 8h", "Eat Yogurt"
];

startWheelBtn.addEventListener('click', () => {
  wheelModal.classList.remove('hidden');
  wheelResult.classList.add('hidden');
  wheel.style.transform = 'rotate(0deg)';
  trackGamePlay('Habit Wheel');
});

closeWheelBtn.addEventListener('click', () => {
  wheelModal.classList.add('hidden');
});

spinBtn.addEventListener('click', () => {
  // Random spins between 5 and 10 full rotations plus a random offset
  const spins = Math.floor(Math.random() * 5) + 5;
  const degrees = Math.floor(Math.random() * 360);
  const totalDeg = (spins * 360) + degrees;

  wheel.style.transform = `rotate(${totalDeg}deg)`;

  // Disable button while spinning
  spinBtn.disabled = true;

  setTimeout(() => {
    spinBtn.disabled = false;
    wheelResult.classList.remove('hidden');

    // Calculate result based on angle
    // Pointer is at Top (0deg).
    // Wheel background is offset by -30deg (so 0deg is center of Seg 0).
    // Formula: (360 - (totalDeg % 360) + 30) % 360
    // This normalizes the angle so that 0-60 is Seg 0, 60-120 is Seg 1, etc.

    const finalRot = totalDeg % 360;
    // Add 30deg because the gradient starts at -30deg.
    // If rotation is 0, we want angle to be 30 (center of Seg 0 which is -30 to 30? No wait).
    // Gradient: Seg 0 is -30 to 30.
    // If Rot=0, Pointer(0) is at 0 relative to wheel. 0 is inside -30 to 30.
    // So if Rot=0, we want index 0.
    // (0 + 30) % 360 = 30. 30/60 = 0.5 -> floor is 0. Correct.

    // If Rot=60 (Clockwise). Wheel moves right.
    // Top pointer is now at 300deg relative to wheel.
    // 300deg is center of Seg 5 (270 to 330).
    // Formula: (360 - 60 + 30) % 360 = (330) % 360 = 330.
    // 330 / 60 = 5.5 -> floor is 5. Correct.

    const normalizedAngle = (360 - finalRot + 30) % 360;
    const index = Math.floor(normalizedAngle / 60);

    const result = segments[index];
    resultText.textContent = result;

  }, 4000); // Match CSS transition time
});

// --- DQ QUIZ LOGIC ---
const dqQuestions = [
  {
    question: "How often do you feel bloated after meals?",
    options: [
      { text: "Rarely", score: 10 },
      { text: "Sometimes", score: 5 },
      { text: "Often", score: 0 }
    ]
  },
  {
    question: "How many glasses of water do you drink daily?",
    options: [
      { text: "8 or more", score: 10 },
      { text: "4 to 7", score: 5 },
      { text: "Less than 4", score: 0 }
    ]
  },
  {
    question: "Do you include fruits and vegetables in your diet?",
    options: [
      { text: "Daily", score: 10 },
      { text: "Occasionally", score: 5 },
      { text: "Rarely", score: 0 }
    ]
  },
  {
    question: "How would you rate your sleep quality?",
    options: [
      { text: "Good (7-8 hrs)", score: 10 },
      { text: "Average (5-6 hrs)", score: 5 },
      { text: "Poor (<5 hrs)", score: 0 }
    ]
  },
  {
    question: "How often do you exercise?",
    options: [
      { text: "Regularly", score: 10 },
      { text: "Sometimes", score: 5 },
      { text: "Never", score: 0 }
    ]
  }
];

let currentQuestionIndex = 0;
let totalScore = 0;

const questionText = document.getElementById('dq-question-text');
const optionsContainer = document.getElementById('dq-options');
const resultContainer = document.getElementById('dq-result');
const tummyScoreEl = document.getElementById('tummy-score');
const scoreMessageEl = document.getElementById('score-message');
const restartDqBtn = document.getElementById('restart-dq');

function loadQuestion(index) {
  const q = dqQuestions[index];
  questionText.textContent = `Q${index + 1}: ${q.question}`;
  optionsContainer.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt.text;
    btn.onclick = () => handleAnswer(opt.score);
    optionsContainer.appendChild(btn);
  });
}

function handleAnswer(score) {
  totalScore += score;
  currentQuestionIndex++;

  if (currentQuestionIndex < dqQuestions.length) {
    // Add a small fade effect or just load next
    loadQuestion(currentQuestionIndex);
  } else {
    showResult();
  }
}

function showResult() {
  questionText.classList.add('hidden');
  optionsContainer.classList.add('hidden');
  resultContainer.classList.remove('hidden');

  tummyScoreEl.textContent = totalScore;

  let message = "";
  if (totalScore >= 40) message = "Amazing! Your tummy is very happy! 🌟";
  else if (totalScore >= 25) message = "Good job! A few tweaks and you'll be perfect. 👍";
  else message = "Your tummy needs some love. Let's start healthy habits! 💚";

  scoreMessageEl.textContent = message;

  // Track quiz completion
  trackQuizComplete(totalScore);
}

restartDqBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  totalScore = 0;
  resultContainer.classList.add('hidden');
  questionText.classList.remove('hidden');
  optionsContainer.classList.remove('hidden');
  loadQuestion(0);
});

// Initialize first question logic (replace static HTML listeners)
// We need to attach listeners to the existing buttons or just reload the first question
loadQuestion(0);
