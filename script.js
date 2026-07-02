// CONFIGURATION DU JEU
const STARTING_BALANCE = 1000;
let balance = parseInt(localStorage.getItem('routte_royale_balance')) || STARTING_BALANCE;
let currentBet = 0;
let isSpinning = false;

// SÉLECTION DES ÉLÉMENTS DU DOM
const balanceDisplay = document.getElementById('global-balance');
const statusDisplay = document.getElementById('roulette-status');
const casinoWheel = document.getElementById('casino-wheel');
const betTargetInput = document.getElementById('bet-target');
const betAmountDisplay = document.getElementById('display-bet-amount');
const spinButton = document.getElementById('spin-btn');
const clearBetButton = document.getElementById('clear-bet-btn');
const chipButtons = document.querySelectorAll('.chip-btn');

// MISE À JOUR DE L'INTERFACE AU CHARGEMENT
function updateUI() {
    balanceDisplay.innerText = balance.toLocaleString();
    betAmountDisplay.innerText = currentBet.toLocaleString();
    localStorage.setItem('routte_royale_balance', balance);
}

// GESTION DES JETONS DE MISE
chipButtons.forEach(chip => {
    chip.onclick = () => {
        if (isSpinning) return;
        const amount = parseInt(chip.getAttribute('data-amount'));
        
        if (balance >= amount) {
            balance -= amount;
            currentBet += amount;
            updateUI();
            statusDisplay.innerText = `Mise augmentée (+${amount})`;
            statusDisplay.className = "px-6 py-2 bg-neutral-950 border border-neutral-800 rounded-full text-sm font-mono font-bold text-amber-500";
        } else {
            statusDisplay.innerText = "Solde insuffisant pour ce jeton !";
            statusDisplay.className = "px-6 py-2 bg-neutral-950 border border-red-900 rounded-full text-sm font-mono font-bold text-red-500";
        }
    };
});

// EFFACER LA MISE
clearBetButton.onclick = () => {
    if (isSpinning) return;
    balance += currentBet;
    currentBet = 0;
    updateUI();
    statusDisplay.innerText = "Mises récupérées.";
    statusDisplay.className = "px-6 py-2 bg-neutral-950 border border-neutral-800 rounded-full text-sm font-mono font-bold text-neutral-400";
};

// LANCER LA ROULETTE
spinButton.onclick = () => {
    if (isSpinning) return;
    
    const targetNumber = parseInt(betTargetInput.value);
    
    // Vérifications de sécurité
    if (isNaN(targetNumber) || targetNumber < 0 || targetNumber > 36) {
        alert("Veuillez choisir un numéro valide entre 0 et 36 !");
        return;
    }
    if (currentBet <= 0) {
        statusDisplay.innerText = "Placez des jetons avant de lancer !";
        statusDisplay.className = "px-6 py-2 bg-neutral-950 border border-red-900 rounded-full text-sm font-mono font-bold text-red-500";
        return;
    }

    // Verrouillage du jeu pendant la rotation
    isSpinning = true;
    statusDisplay.innerText = "La roue tourne... Les jeux sont faits !";
    statusDisplay.className = "px-6 py-2 bg-neutral-950 border border-amber-600 rounded-full text-sm font-mono font-bold text-amber-400 animate-pulse";

    // Calcul de la rotation physique (style Casino)
    const randomDegree = Math.floor(Math.random() * 360);
    const totalRotation = 1800 + randomDegree; // Fait au moins 5 tours complets + angle aléatoire
    
    casinoWheel.style.transition = "transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)";
    casinoWheel.style.transform = `rotate(${totalRotation}deg)`;

    // Résultat après l'arrêt de la roue (4 secondes)
    setTimeout(() => {
        const winningNumber = Math.floor(Math.random() * 37); // Génère un chiffre entre 0 et 36
        
        if (targetNumber === winningNumber) {
            // Gain légendaire à la roulette : 36 fois la mise !
            const winnings = currentBet * 36;
            balance += winnings;
            statusDisplay.innerText = `GAGNÉ ! Le ${winningNumber} est sorti. Vous remportez ${winnings} jetons !`;
            statusDisplay.className = "px-6 py-2 bg-emerald-950 border border-emerald-500 rounded-full text-sm font-mono font-bold text-emerald-400";
        } else {
            statusDisplay.innerText = `PERDU ! Le ${winningNumber} est sorti. Retentez votre chance !`;
            statusDisplay.className = "px-6 py-2 bg-red-950 border border-red-500 rounded-full text-sm font-mono font-bold text-red-400";
        }

        // Réinitialisation de la mise sur table
        currentBet = 0;
        isSpinning = false;
        
        // Remise à zéro invisible de l'angle pour pouvoir relancer à l'infini
        casinoWheel.style.transition = "none";
        casinoWheel.style.transform = `rotate(${randomDegree}deg)`;
        
        updateUI();
    }, 4000);
};

// Initialisation au démarrage
updateUI();
