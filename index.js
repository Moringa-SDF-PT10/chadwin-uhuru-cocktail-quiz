// DOM functions
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");
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

// Game features
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timer;
let timeRemaining = 15;
let totalTime = 0;
let quizStartTime;
let selectedCategory = "all";
let hintUsed = false;

// Kenyan Cocktail list
const kenyanCocktails = [
  {
    name: "Dawa",
    ingredients: ["Vodka", "Honey", "Lime", "Sugar"],
    glass: "Highball Glass",
    image: "dawa.jpeg",
    alcoholic: true
  },
  {
    name: "Kenya Cane",
    ingredients: ["Cane Spirit", "Pineapple Juice", "Lemon", "Mint"],
    glass: "Collins Glass",
    image: "kenya-cane.jpg",
    alcoholic: true
  },
  {
    name: "Tusker Mojito",
    ingredients: ["Tusker Lager", "Mint", "Lime", "Sugar"],
    glass: "Pint Glass",
    image: "tusker-mojito.jpg",
    alcoholic: true
  },
  {
    name: "Masala Chai Martini",
    ingredients: ["Chai Tea", "Milk", "Honey", "Cinnamon"],
    glass: "Martini Glass",
    image: "masala-chai.webp",
    alcoholic: false
  },
  {
    name: "Virgin Dawa",
    ingredients: ["Honey", "Lime", "Sugar", "Soda Water"],
    glass: "Highball Glass",
    image: "virgin-dawa.jpeg",
    alcoholic: false
  }
];

// cocktail Glass Types
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

// Wrong ingredients
const wrongIngredients = [
  "Whiskey", "Tequila", "Blue Curacao", 
  "Soya Sauce", "Ketchup", "Coffee",
  "Milk", "Egg White", "Worcestershire Sauce"
];

// Categories
const categories = {
  all: "All Questions",
  ingredients: "Ingredients Quiz",
  glassware: "Glassware Quiz",
  alcoholic: "Alcoholic/Non-Alcoholic",
  image: "Guess the Cocktail"
};

// Initialize the questions
function initQuiz() {
  // Set up category selection
  for (const [id, name] of Object.entries(categories)) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = name;
    categorySelect.appendChild(option);
  }
  
  // Event listeners
  startBtn.addEventListener("click", startQuiz);
  restartBtn.addEventListener("click", restartQuiz);
  menuBtn.addEventListener("click", goToMainMenu);
  nextBtn.addEventListener("click", nextQuestion);
  hintBtn.addEventListener("click", showHint);
  categorySelect.addEventListener("change", (e) => {
    selectedCategory = e.target.value;
  });
}

// have unique glass options
function getUniqueGlassOptions(correctGlass) {
  const incorrectGlasses = ALL_GLASS_TYPES.filter(g => g !== correctGlass);
  const selected = [];
  
  // Select 3 unique incorrect glasses
  while (selected.length < 3 && incorrectGlasses.length > 0) {
    const randomIndex = Math.floor(Math.random() * incorrectGlasses.length);
    selected.push(incorrectGlasses.splice(randomIndex, 1)[0]);
  }
  
  return [...selected, correctGlass].sort(() => Math.random() - 0.5);
}

// Get wrong ingredient not in the cocktail
function getWrongIngredient(ingredients) {
  let wrongIngredient;
  do {
    wrongIngredient = wrongIngredients[Math.floor(Math.random() * wrongIngredients.length)];
  } while (ingredients.includes(wrongIngredient));
  return wrongIngredient;
}

// Start the quiz
function startQuiz() {
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  questions = generateQuestions();
  currentQuestionIndex = 0;
  score = 0;
  hintUsed = false;
  quizStartTime = Date.now();
  showQuestion();
}

// Generate questions based on category
function generateQuestions() {
  let pool = [...kenyanCocktails];
  if (selectedCategory === "non-alcoholic") {
    pool = pool.filter(drink => !drink.alcoholic);
  } else if (selectedCategory === "alcoholic") {
    pool = pool.filter(drink => drink.alcoholic);
  }

  const generatedQuestions = [];
  
  pool.forEach(cocktail => {
    // Image recognition question
    if (selectedCategory === "image" || selectedCategory === "all") {
      generatedQuestions.push({
        type: "image",
        text: `What is this cocktail called?`,
        options: [
          ...kenyanCocktails.filter(d => d.name !== cocktail.name)
                           .map(d => d.name)
                           .slice(0, 3),
          cocktail.name
        ].sort(() => Math.random() - 0.5),
        correctAnswer: cocktail.name,
        image: cocktail.image
      });
    }
    
    // Ingredients question
    if (selectedCategory === "ingredients" || selectedCategory === "all") {
      const wrongIngredient = getWrongIngredient(cocktail.ingredients);
      generatedQuestions.push({
        type: "ingredient",
        text: `Which ingredient is NOT in a ${cocktail.name}?`,
        options: [
          ...cocktail.ingredients.slice(0, 3),
          wrongIngredient
        ].sort(() => Math.random() - 0.5),
        correctAnswer: wrongIngredient,
        image: cocktail.image
      });
    }
    
    // Cocktail Glassware question
    if (selectedCategory === "glassware" || selectedCategory === "all") {
      generatedQuestions.push({
        type: "glass",
        text: `Which glass is used for a ${cocktail.name}?`,
        options: getUniqueGlassOptions(cocktail.glass),
        correctAnswer: cocktail.glass,
        image: cocktail.image
      });
    }
    
    // Alcoholic question
    if (selectedCategory === "alcoholic" || selectedCategory === "all") {
      generatedQuestions.push({
        type: "alcoholic",
        text: `Is ${cocktail.name} alcoholic?`,
        options: ["Yes", "No"],
        correctAnswer: cocktail.alcoholic ? "Yes" : "No",
        image: cocktail.image
      });
    }
  });
  
  return generatedQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
}

// Show current question
function showQuestion() {
  clearInterval(timer);
  timeRemaining = 15;
  hintUsed = false;
  hintBtn.disabled = false;
  hintBtn.textContent = "Get Hint";
  
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.textContent = currentQuestion.text;
  
  // Set image
  cocktailImage.src = `assets/images/${currentQuestion.image}`;
  cocktailImage.alt = `${currentQuestion.text} image`;
  
  // Create options
  optionsContainer.innerHTML = "";
  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.addEventListener("click", () => selectAnswer(option));
    optionsContainer.appendChild(button);
  });
  
  // Update UI
  scoreEl.textContent = `Score: ${score}`;
  nextBtn.style.display = "none";
  timerEl.textContent = `Time: ${timeRemaining}s`;
  
  // Start timer
  timer = setInterval(updateTimer, 1000);
}

// Update timer
function updateTimer() {
  timeRemaining--;
  timerEl.textContent = `Time: ${timeRemaining}s`;
  if (timeRemaining <= 0) {
    clearInterval(timer);
    handleTimeOut();
  }
}

// Handle timeout
function handleTimeOut() {
  const currentQuestion = questions[currentQuestionIndex];
  const options = document.querySelectorAll(".option-btn");
  
  options.forEach(option => {
    option.disabled = true;
    if (option.textContent === currentQuestion.correctAnswer) {
      option.classList.add("correct");
    }
  });
  
  nextBtn.style.display = "block";
}

// Show hint
function showHint() {
  if (hintUsed) return;
  
  const currentQuestion = questions[currentQuestionIndex];
  let hint = "";
  
  switch(currentQuestion.type) {
    case "ingredient":
      hint = `Contains: ${currentQuestion.options
        .filter(opt => opt !== currentQuestion.correctAnswer)
        .slice(0, 2)
        .join(", ")}`;
      break;
    case "glass":
      hint = `It's a ${currentQuestion.correctAnswer.toLowerCase()}`;
      break;
    case "image":
      hint = `Starts with: ${currentQuestion.correctAnswer.charAt(0)}`;
      break;
    default:
      hint = "Think carefully!";
  }
  
  alert(`Hint: ${hint}`);
  hintUsed = true;
  hintBtn.textContent = "Hint Used";
  hintBtn.disabled = true;
}

// Handle answer selection
function selectAnswer(selectedOption) {
  clearInterval(timer);
  const currentQuestion = questions[currentQuestionIndex];
  const options = document.querySelectorAll(".option-btn");
  
  options.forEach(option => {
    option.disabled = true;
    if (option.textContent === currentQuestion.correctAnswer) {
      option.classList.add("correct");
    } else if (option.textContent === selectedOption) {
      option.classList.add("wrong");
    }
  });
  
  // Update score if correct
  if (selectedOption === currentQuestion.correctAnswer) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
  }
  
  nextBtn.style.display = "block";
}

// Next question
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

// End quiz
function endQuiz() {
  clearInterval(timer);
  quizScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
  
  totalTime = Math.floor((Date.now() - quizStartTime) / 1000);
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;
  
  totalTimeEl.textContent = `Total time: ${minutes}m ${seconds}s`;
  
  // Add emoji based on your final score
  let emoji = "😐";
  if (score === questions.length) emoji = "🎉";
  else if (score >= questions.length/2) emoji = "👍";
  
  finalScoreEl.textContent = `Score: ${score}/${questions.length} ${emoji}`;
}

// Restart quiz
function restartQuiz() {
  resultsScreen.classList.add("hidden");
  startQuiz();
}

// Go to main menu
function goToMainMenu() {
  resultsScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  // Reset category selection
  categorySelect.value = "all";
  selectedCategory = "all";
}

// Initialize the quiz when loaded
document.addEventListener("DOMContentLoaded", initQuiz);