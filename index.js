// DOM Elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultsScreen = document.getElementById("results-screen");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const questionEl = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const scoreEl = document.getElementById("score");
const finalScoreEl = document.getElementById("final-score");
const cocktailImage = document.getElementById("cocktail-image");

// Kenyan Cocktail Data
const kenyanCocktails = [
  {
    name: "Dawa",
    ingredients: ["Vodka", "Honey", "Lime", "Sugar"],
    glass: "Highball Glass",
    image: "dawa.jpeg"
  },
  {
    name: "Kenya Cane",
    ingredients: ["Cane Spirit", "Pineapple Juice", "Lemon", "Mint"],
    glass: "Collins Glass",
    image: "kenya-cane.jpg"
  },
  {
    name: "Tusker Mojito",
    ingredients: ["Tusker Lager", "Mint", "Lime", "Sugar"],
    glass: "Pint Glass",
    image: "tusker-mojito.jpg"
  },
  {
    name: "Masala Chai Martini",
    ingredients: ["Chai Tea", "Vodka", "Honey", "Cinnamon"],
    glass: "Martini Glass",
    image: "masala-chai.webp"
  }
];

// Wrong ingredients (Kenyan context)
const wrongIngredients = [
  "Whiskey", "Tequila", "Blue Curacao", 
  "Soya Sauce", "Ketchup", "Coffee",
  "Milk", "Egg White", "Worcestershire Sauce"
];

// Game State
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Generate questions with no duplicate choices
function generateQuestions() {
  const generatedQuestions = [];
  
  kenyanCocktails.forEach(cocktail => {
    // Create ingredient question
    const ingredientOptions = [...cocktail.ingredients];
    let wrongIngredient;
    
    // Ensure wrong ingredient isn't already in the cocktail
    do {
      wrongIngredient = wrongIngredients[Math.floor(Math.random() * wrongIngredients.length)];
    } while (ingredientOptions.includes(wrongIngredient));
    
    // Select 3 random actual ingredients + 1 wrong
    const selectedIngredients = [];
    while (selectedIngredients.length < 3 && ingredientOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * ingredientOptions.length);
      selectedIngredients.push(ingredientOptions.splice(randomIndex, 1)[0]);
    }
    
    generatedQuestions.push({
      type: "ingredient",
      text: `Which ingredient is NOT in a ${cocktail.name}?`,
      options: [...selectedIngredients, wrongIngredient].sort(() => Math.random() - 0.5),
      correctAnswer: wrongIngredient,
      image: cocktail.image
    });
    
    // Create glass question
    const glassOptions = ["Martini Glass", "Highball Glass", "Hurricane Glass", "Shot Glass"];
    // Ensure correct glass is included and others are different
    if (!glassOptions.includes(cocktail.glass)) {
      glassOptions[0] = cocktail.glass;
    }
    
    generatedQuestions.push({
      type: "glass",
      text: `Which glass is used for a ${cocktail.name}?`,
      options: glassOptions.sort(() => Math.random() - 0.5),
      correctAnswer: cocktail.glass,
      image: cocktail.image
    });
  });
  
  // Return 5 random questions (2 per cocktail x 4 cocktails = 8 possible)
  return generatedQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
}

// Start quiz
function startQuiz() {
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  questions = generateQuestions();
  currentQuestionIndex = 0;
  score = 0;
  showQuestion();
}

// Display current question
function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionEl.textContent = currentQuestion.text;
  
  // Set image
  cocktailImage.src = `assets/images/${currentQuestion.image}`;
  cocktailImage.alt = `${currentQuestion.text} image`;
  
  // Clear previous options
  optionsContainer.innerHTML = "";
  
  // Create new options
  currentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.addEventListener("click", () => selectAnswer(option));
    optionsContainer.appendChild(button);
  });
  
  // Update score display
  scoreEl.textContent = `Score: ${score}`;
}

// Handle answer selection
function selectAnswer(selectedOption) {
  const currentQuestion = questions[currentQuestionIndex];
  const options = document.querySelectorAll(".option-btn");
  
  // Disable all buttons and show correct/wrong
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
  
  // Move to next question or end quiz
  setTimeout(() => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      endQuiz();
    }
  }, 1500);
}

// End quiz
function endQuiz() {
  quizScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
  
  // Add emoji based on performance
  let emoji = "😐";
  if (score === questions.length) emoji = "🎉";
  else if (score >= questions.length/2) emoji = "👍";
  
  finalScoreEl.textContent = `Your score: ${score}/${questions.length} ${emoji}`;
}

// Restart quiz
function restartQuiz() {
  resultsScreen.classList.add("hidden");
  startQuiz();
}

// Event listeners
startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", restartQuiz);

// Debug image loading
cocktailImage.onerror = function() {
  console.error("Failed to load image:", this.src);
  this.style.display = "none";
};