// DOM Elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");
const loadingScreen = document.getElementById("loading-screen");
const loadingText = document.getElementById("loading-text");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const menuBtn = document.getElementById("menu-btn");
const questionEl = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const totalTimeEl = document.getElementById("total-time");
const cocktailImage = document.getElementById("cocktail-image");
const categorySelect = document.getElementById("category-select");
const timerEl = document.getElementById("timer");
const nextBtn = document.getElementById("next-btn");
const hintBtn = document.getElementById("hint-btn");

// API
const API_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// Kenyan Cocktails //
const kenyanCocktails = [
    {
      idDrink: "1",
      strDrink: "Dawa",
      strGlass: "Highball Glass",
      strAlcoholic: "Alcoholic",
      strDrinkThumb: "assets/images/dawa.jpeg",
      strIngredient1: "Vodka",
      strIngredient2: "Honey",
      strIngredient3: "Lime",
      strIngredient4: "Sugar"
    },
    {
      idDrink: "2",
      strDrink: "Kenya Cane",
      strGlass: "Collins Glass",
      strAlcoholic: "Alcoholic",
      strDrinkThumb: "assets/images/kenya-cane.jpg",
      strIngredient1: "Cane Spirit",
      strIngredient2: "Pineapple Juice",
      strIngredient3: "Lemon",
      strIngredient4: "Mint"
    },
    {
      idDrink: "3",
      strDrink: "Tusker Mojito",
      strGlass: "Pint Glass",
      strAlcoholic: "Alcoholic",
      strDrinkThumb: "assets/images/tusker-mojito.jpg",
      strIngredient1: "Tusker Lager",
      strIngredient2: "Mint",
      strIngredient3: "Lime",
      strIngredient4: "Sugar"
    },
    {
      idDrink: "4",
      strDrink: "Virgin Dawa",
      strGlass: "Highball Glass",
      strAlcoholic: "Non-Alcoholic",
      strDrinkThumb: "assets/images/virgin-dawa.jpeg",
      strIngredient1: "Honey",
      strIngredient2: "Lime",
      strIngredient3: "Sugar",
      strIngredient4: "Soda Water"
    },
    {
      idDrink: "5",
      strDrink: "Masala Chai",
      strGlass: "Tea Cup",
      strAlcoholic: "Non-Alcoholic",
      strDrinkThumb: "assets/images/masala-chai.webp",
      strIngredient1: "Tea Leaves",
      strIngredient2: "Milk",
      strIngredient3: "Ginger",
      strIngredient4: "Cardamom",
      strIngredient5: "Cinnamon"
    }
  ];
// Glassware Types
const ALL_GLASS_TYPES = [
  "Martini Glass", 
  "Highball Glass", 
  "Hurricane Glass",
  "Coupe Glass",
  "Pint Glass",
  "Collins Glass",
  "Shot Glass",
  "Champagne Flute",
  "Margarita Glass"
];

// Game State
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timer;
let timeRemaining = 15;
let totalTime = 0;
let quizStartTime;
let selectedMode = "api";
let hintUsed = false;
let allIngredients = [];

// Initialize the questions
function initQuiz() {
  // Event listeners
  startBtn.addEventListener("click", startQuiz);
  restartBtn.addEventListener("click", restartQuiz);
  menuBtn.addEventListener("click", goToMainMenu);
  nextBtn.addEventListener("click", nextQuestion);
  hintBtn.addEventListener("click", showHint);
  categorySelect.addEventListener("change", (e) => {
    selectedMode = e.target.value;
  });
  
  // Preload ingredients list
  fetchIngredientsList().then(ingredients => {
    allIngredients = ingredients;
  });
}

// Fetch with timeout
async function fetchWithTimeout(url, timeout = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

// Fetch random cocktail
async function fetchRandomCocktail() {
  if (selectedMode === "local") {
    return kenyanCocktails[Math.floor(Math.random() * kenyanCocktails.length)];
  }

  try {
    loadingText.textContent = "Fetching global cocktails...";
    const response = await fetchWithTimeout(`${API_URL}/random.php`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.drinks[0];
  } catch (error) {
    console.error("API failed:", error);
    loadingText.textContent = "Using Kenyan cocktails...";
    return kenyanCocktails[Math.floor(Math.random() * kenyanCocktails.length)];
  }
}

// Get all ingredients
async function fetchIngredientsList() {
  try {
    const response = await fetch(`${API_URL}/list.php?i=list`);
    const data = await response.json();
    return data.drinks.map(item => item.strIngredient1);
  } catch (error) {
    console.error("Failed to fetch ingredients:", error);
    return ["Vodka", "Gin", "Rum", "Tequila", "Whiskey", "Honey", "Lime"];
  }
}

// Get unique glass options
function getUniqueGlassOptions(correctGlass) {
  const incorrectGlasses = ALL_GLASS_TYPES.filter(g => g !== correctGlass);
  const selected = [];
  
  while (selected.length < 3 && incorrectGlasses.length > 0) {
    const randomIndex = Math.floor(Math.random() * incorrectGlasses.length);
    selected.push(incorrectGlasses.splice(randomIndex, 1)[0]);
  }
  
  return [...selected, correctGlass].sort(() => Math.random() - 0.5);
}

// Get wrong ingredient
function getWrongIngredient(ingredients) {
  const availableIngredients = allIngredients.filter(i => !ingredients.includes(i));
  return availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
}

// Generate questions
async function generateQuestions() {
  const generatedQuestions = [];
  const questionCount = selectedMode === "local" ? 5 : 3; // Fewer API questions
  
  for (let i = 0; i < questionCount; i++) {
    const cocktail = await fetchRandomCocktail();
    
    // Get ingredients
    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      if (cocktail[`strIngredient${i}`]) {
        ingredients.push(cocktail[`strIngredient${i}`]);
      }
    }

    // Ingredient question
    if (ingredients.length >= 3) {
      const wrongIngredient = getWrongIngredient(ingredients);
      generatedQuestions.push({
        type: "ingredient",
        text: `Which ingredient is NOT in a ${cocktail.strDrink}?`,
        options: [...ingredients.slice(0, 3), wrongIngredient].sort(() => Math.random() - 0.5),
        correctAnswer: wrongIngredient,
        image: cocktail.strDrinkThumb || `assets/images/fallback.jpg`
      });
    }

    // Glass question
    generatedQuestions.push({
      type: "glass",
      text: `Which glass is used for a ${cocktail.strDrink}?`,
      options: getUniqueGlassOptions(cocktail.strGlass),
      correctAnswer: cocktail.strGlass,
      image: cocktail.strDrinkThumb || `assets/images/fallback.jpg`
    });
  }
  
  return generatedQuestions;
}


function showLoadingScreen() {
  startScreen.classList.add("hidden");
  quizScreen.classList.add("hidden");
  resultsScreen.classList.add("hidden");
  loadingScreen.classList.remove("hidden");
}


function hideLoadingScreen() {
  loadingScreen.classList.add("hidden");
}

// Start questions
async function startQuiz() {
  showLoadingScreen();
  
  try {
    questions = await generateQuestions();
    
    if (questions.length === 0) {
      throw new Error("No questions generated");
    }
    
    currentQuestionIndex = 0;
    score = 0;
    hintUsed = false;
    quizStartTime = Date.now();
    hideLoadingScreen();
    showQuestion();
  } catch (error) {
    console.error("Start error:", error);
    loadingText.textContent = "Loading failed. Using backup questions...";
    
questions = [
    {
      type: "ingredient",
      text: "Which ingredient is NOT in a Dawa?",
      options: ["Vodka", "Honey", "Lime", "Soda"],
      correctAnswer: "Soda",
      image: "assets/images/dawa.jpeg"
    },
    {
      type: "glass",
      text: "Which glass is used for Masala Chai?",
      options: ["Tea Cup", "Martini Glass", "Highball Glass", "Shot Glass"],
      correctAnswer: "Tea Cup",
      image: "assets/images/masala-chai.webp"
    },
    {
      type: "ingredient",
      text: "Which ingredient is NOT in Virgin Dawa?",
      options: ["Honey", "Lime", "Vodka", "Soda Water"],
      correctAnswer: "Vodka",
      image: "assets/images/virgin-dawa.jpeg"
    }
  ];
    
    setTimeout(() => {
      hideLoadingScreen();
      showQuestion();
    }, 1000);
  }
}


function showQuestion() {
  const question = questions[currentQuestionIndex];
  questionEl.textContent = question.text;
  cocktailImage.src = question.image;
  cocktailImage.alt = question.text;
  
  // Clear previous options
  optionsContainer.innerHTML = '';
  
  // Create new options
  question.options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = option;
    button.classList.add('option-btn');
    button.addEventListener('click', () => selectAnswer(option));
    optionsContainer.appendChild(button);
  });
  
  // Reset timer and UI
  timeRemaining = 15;
  updateTimer();
  startTimer();
  nextBtn.style.display = 'none';
  hintUsed = false;
  
  // Show quiz screen
  startScreen.classList.add('hidden');
  resultsScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  scoreEl.textContent = `Score: ${score}`;
}

// Start timer
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeRemaining--;
    updateTimer();
    
    if (timeRemaining <= 0) {
      clearInterval(timer);
      timeUp();
    }
  }, 1000);
}

// Update timer display
function updateTimer() {
  timerEl.textContent = `Time: ${timeRemaining}s`;
  if (timeRemaining <= 5) {
    timerEl.style.color = 'red';
  } else {
    timerEl.style.color = 'inherit';
  }
}

// Handle time up
function timeUp() {
  const options = document.querySelectorAll('.option-btn');
  options.forEach(option => {
    option.disabled = true;
  });
  nextBtn.style.display = 'block';
}

// Handle answer selection
function selectAnswer(selectedAnswer) {
  clearInterval(timer);
  const question = questions[currentQuestionIndex];
  const options = document.querySelectorAll('.option-btn');
  
  options.forEach(option => {
    option.disabled = true;
    
    if (option.textContent === question.correctAnswer) {
      option.classList.add('correct');
    } else if (option.textContent === selectedAnswer && selectedAnswer !== question.correctAnswer) {
      option.classList.add('wrong');
    }
  });
  
  if (selectedAnswer === question.correctAnswer) {
    score += hintUsed ? 5 : 10; // this removes points if you use the hint option
  }
  
  scoreEl.textContent = `Score: ${score}`;
  nextBtn.style.display = 'block';
}

// Show hint
function showHint() {
  if (hintUsed) return;
  
  const question = questions[currentQuestionIndex];
  const options = document.querySelectorAll('.option-btn');
  
  // Remove two incorrect options
  let removed = 0;
  options.forEach(option => {
    if (removed < 2 && 
        option.textContent !== question.correctAnswer && 
        !option.classList.contains('disabled-hint')) {
      option.style.visibility = 'hidden';
      option.classList.add('disabled-hint');
      removed++;
    }
  });
  
  hintUsed = true;
}

// Next question
function nextQuestion() {
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// Show results
function showResults() {
  totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
  finalScoreEl.textContent = `Your final score: ${score}/${questions.length * 10}`;
  totalTimeEl.textContent = `Total time: ${totalTime} seconds`;
  
  quizScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
}

// Restart the questions
function restartQuiz() {
  startQuiz();
}

// Go to main menu
function goToMainMenu() {
  resultsScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
}

// Initialize the questions
document.addEventListener("DOMContentLoaded", initQuiz);
