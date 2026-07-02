// SYSTÈME DE ROULETTE OFFICIELLE EUROPÉENNE
const WHEEL_NUMBERS = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

// INITIALISATION DU SOLDE DE DÉPART
const STARTING_BALANCE = 1000;
let balance = parseInt(localStorage.getItem('roulette_canvas_balance')) || STARTING_BALANCE;
let currentBet = 0;
let isSpinning = false;
let history = [];

// ÉLÉMENTS DE L'INTERFACE
const balanceDisplay = document.getElementById('global-balance');
const statusDisplay = document.getElementById('roulette-status');
const canvas = document.getElementById('roulette-canvas');
const betTargetInput = document.getElementById('bet-target');
const betAmountDisplay = document.getElementById('display-bet-amount');
const spinButton = document.getElementById('spin-btn');
const clearBetButton = document.getElementById('clear-bet-btn');
const chipButtons = document.querySelectorAll('.chip-btn');
const historyContainer = document.getElementById('history-container');

// CONFIGURATION DU CANVAS HAUTE DÉFINITION (ANTI-ALIASING)
const ctx = canvas.getContext('2d');
const size = 800; // Résolution interne élevée pour éviter tout flou visuel
canvas.width = size;
canvas.height = size;
const center = size / 2;

// DÉTERMINATION DE LA COULEUR OFFICIELLE D'UN NUMÉRO
function getNumberColor(num) {
    if (num === 0) return '#15803d'; // Vert Casino
    const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return reds.includes(num) ? '#b91c1c' : '#171717'; // Rouge vif ou Noir Onyx
}

// ROUTINE DE DESSIN ULTRA-RÉALISTE DU CYLINDRE
function drawWheel() {
    ctx.clearRect(0, 0, size, size);
    
    const totalSegments = WHEEL_NUMBERS.length;
    const arcLength = (Math.PI * 2) / totalSegments;

    // 1. LE BORD EXTÉRIEUR : EFFET BOIS D'ACAJOU VERNI MULTI-COUCHES
    const woodGradient = ctx.createRadialGradient(center, center, size * 0.42, center, center, size * 0.5);
    woodGradient.addColorStop(0, '#291303');
    woodGradient.addColorStop(0.4, '#451a03');
    woodGradient.addColorStop(0.8, '#78350f');
    woodGradient.addColorStop(0.95, '#451a03');
    woodGradient.addColorStop(1, '#1c0d02');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = woodGradient;
    ctx.fill();

    // 2. COURONNE EN OR INTERNE
    ctx.beginPath();
    ctx.arc(center, center, size * 0.42, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.8)'; // Incrustation dorée
    ctx.stroke();

    // 3. ENCEINTE DES CASES NUMÉROTÉES
    // Décale le départ pour centrer parfaitement le "0" en haut à 12h00 précises
    let startAngle = -Math.PI / 2 - (arcLength / 2);

    for (let i = 0; i < totalSegments; i++) {
        const currentAngle = startAngle + (i * arcLength);

        // Dessin de la part colorée (Rouge/Noir/Vert)
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, size * 0.41, currentAngle, currentAngle + arcLength);
        ctx.closePath();
        ctx.fillStyle = getNumberColor(WHEEL_NUMBERS[i]);
        ctx.fill();

        // Séparateurs de cases dorés en relief
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + Math.cos(currentAngle) * size * 0.41, center + Math.sin(currentAngle) * size * 0.41);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.stroke();

        // ÉCRITURE DES NUMÉROS (Orientés vers le centre)
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(currentAngle + arcLength / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px monospace";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 4;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Place le texte à la distance parfaite du rayon
        ctx.fillText(WHEEL_NUMBERS[i], 0, -size * 0.35);
        ctx.restore();
    }

    // 4. BAGUE DORÉE COMPTE-TOURS POUR LA BILLE
    ctx.beginPath();
    ctx.arc(center, center, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#0f0f0f';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // 5. LE CÔNE DE LA TOUPIE CENTRALE (EFFET CHROMÉ DE FONDERIE ROULETTE)
    const coneGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.22);
    coneGradient.addColorStop(0, '#ffffff');
    coneGradient.addColorStop(0.2, '#d4d4d8');
    coneGradient.addColorStop(0.5, '#52525b');
    coneGradient.addColorStop(0.8, '#27272a');
    coneGradient.addColorStop(0.9, '#d97706'); // Touche dorée d'embase
    coneGradient.addColorStop(1, '#18181b');
    
    ctx.beginPath();
    ctx.arc(center, center, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = coneGradient;
    ctx.fill();

    // Étoile centrale de préhension en relief
    ctx.beginPath();
    ctx.arc(center, center, size * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#71717a';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.fill();
}

// COMPACTAGE DE LA SYNCHRONISATION APPLICATIVE
function updateUI() {
    balanceDisplay.innerText = balance.toLocaleString();
    betAmountDisplay.innerText = currentBet.toLocaleString();
    localStorage.setItem('roulette_canvas_balance', balance);
    renderHistory();
}

// RENDU DU PANNEAU HISTORIQUE PREMIUM
function renderHistory() {
    if (history.length === 0) return;
    historyContainer.innerHTML = '';
    history.forEach(num => {
        const bg = getNumberColor(num);
        const badge = document.createElement('span');
        badge.className = "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black font-mono shadow border border-white/10 text-white shrink-0 transform scale-0 animate-bounce";
        badge.style.backgroundColor = bg;
        badge.style.animationFillMode = "forwards";
        badge.style.animationDuration = "0.3s";
        badge.innerText = num;
        historyContainer.appendChild(badge);
    });
}

// INCRÉMENTATION DE LA MISE VIA JETONS
chipButtons.forEach(chip => {
    chip.onclick = () => {
        if (isSpinning) return;
        const amount = parseInt(chip.getAttribute('data-amount'));
        
        if (balance >= amount) {
            balance -= amount;
            currentBet += amount;
            updateUI();
            statusDisplay.innerText = `MISE EN PLACE : +${amount}`;
            statusDisplay.className = "px-6 py-2.5 bg-neutral-950 border border-amber-600/50 rounded-full text-xs font-mono font-bold text-amber-400 tracking-wider shadow-md text-center";
        } else {
            statusDisplay.innerText = "SOLDE INSUFFISANT !";
            statusDisplay.className = "px-6 py-2.5 bg-red-950/40 border border-red-500/50 rounded-full text-xs font-mono font-bold text-red-400 tracking-wider shadow-md text-center";
        }
    };
});

// REMISE A ZÉRO DE LA MISE
clearBetButton.onclick = () => {
    if (isSpinning) return;
    balance += currentBet;
    currentBet = 0;
    updateUI();
    statusDisplay.innerText = "MISES REPRISES.";
    statusDisplay.className = "px-6 py-2.5 bg-neutral-950 border border-neutral-800 rounded-full text-xs font-mono font-bold text-neutral-400 tracking-wider shadow-md text-center";
};

// ALGORITHME DE SÉLECTION ET CINÉMATIQUE DE ROTATION RATIONNELLE
spinButton.onclick = () => {
    if (isSpinning) return;

    const targetNumber = parseInt(betTargetInput.value);
    if (isNaN(targetNumber) || targetNumber < 0 || targetNumber > 36) {
        alert("Numéro invalide ! Choisissez entre 0 et 36.");
        return;
    }
    if (currentBet <= 0) {
        statusDisplay.innerText = "ENGAGEZ UNE MISE AVANT DE LANCER !";
        statusDisplay.className = "px-6 py-2.5 bg-red-950/40 border border-red-500/50 rounded-full text-xs font-mono font-bold text-red-400 tracking-wider shadow-md text-center";
        return;
    }

    isSpinning = true;
    statusDisplay.innerText = "LES JEUX SONT FAITS. RIEN NE VA PLUS...";
    statusDisplay.className = "px-6 py-2.5 bg-neutral-950 border border-amber-500 rounded-full text-xs font-mono font-bold text-amber-500 tracking-wider shadow-md text-center animate-pulse";

    // 1. TIRAGE DU NUMÉRO GAGNANT ALEATOIRE
    const winningNumber = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
    
    // 2. CALCUL PHYSIQUE DE L'ANGLE DE DESTINATION EXAC-PIXEL
    const winningIndex = WHEEL_NUMBERS.indexOf(winningNumber);
    const segmentAngle = 360 / WHEEL_NUMBERS.length;
    
    // Calcul de la rotation : Nombre de tours (8 complets) + recalage inverse de la position de l'index
    const extraSpins = 8;
    const targetDegrees = (extraSpins * 360) + (360 - (winningIndex * segmentAngle));

    // Déclenchement de la physique CSS fluide (Courbe d'amortissement de freinage réaliste)
    canvas.style.transition = "transform 5s cubic-bezier(0.08, 0.8, 0.15, 1)";
    canvas.style.transform = `rotate(${targetDegrees}deg)`;

    // ÉXÉCUTION DU CALCUL DU COMPTE DE GAIN APRÈS L'ARRÊT DU CYLINDRE (5 Secondes)
    setTimeout(() => {
        if (targetNumber === winningNumber) {
            const winnings = currentBet * 36; // Multiplicateur officiel de la roulette européenne
            balance += winnings;
            statusDisplay.innerText = `NUMÉRO GAGNANT : ${winningNumber} ! VOUS GAGNEZ ${winnings} JETONS !`;
            statusDisplay.className = "px-6 py-2.5 bg-emerald-950 border border-emerald-500 rounded-full text-xs font-mono font-bold text-emerald-400 tracking-wider shadow-md text-center";
        } else {
            statusDisplay.innerText = `NUMÉRO GAGNANT : ${winningNumber}. LE CASINO EMBORQUE LA MISE !`;
            statusDisplay.className = "px-6 py-2.5 bg-red-950 border border-red-500 rounded-full text-xs font-mono font-bold text-red-400 tracking-wider shadow-md text-center";
        }

        // Enregistrement dans l'historique VIP (Garde les 6 derniers numéros max)
        history.unshift(winningNumber);
        if (history.length > 6) history.pop();

        // Reset de sécurité
        currentBet = 0;
        isSpinning = false;

        // Réalignement transparent de la roue pour pouvoir rejouer sans saut visuel brusque
        const finalAngleNormalized = targetDegrees % 360;
        canvas.style.transition = "none";
        canvas.style.transform = `rotate(${finalAngleNormalized}deg)`;

        updateUI();
    }, 5000);
};

// RENDU DES GRAPHIQUES AU CHARGEMENT DE LA PAGE
drawWheel();
updateUI();
