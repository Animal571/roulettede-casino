// STATE MANAGEMENT PRO
const GAME_KEY = 'MineRoyale_Prod_Save';

let state = {
    coal: 0,
    totalCps: 0,
    upgrades: {
        miner: { count: 0, baseCost: 10, costScale: 1.15, cps: 0.2 },
        drill: { count: 0, baseCost: 150, costScale: 1.16, cps: 4 },
        excavator: { count: 0, baseCost: 2500, costScale: 1.18, cps: 45 },
        laser: { count: 0, baseCost: 75000, costScale: 1.20, cps: 680 },
        nuclear: { count: 0, baseCost: 1200000, costScale: 1.25, cps: 9500 },
        quantum: { count: 0, baseCost: 1000000000, costScale: 1.35, cps: 150000 },
        singularity: { count: 0, baseCost: 1000000000000, costScale: 1.50, cps: 8000000 } // Échelle Trillion
    }
};

let currentBetAmount = 0;
let isSpinning = false;

// FORMATTEUR DE NOMBRES PROFESSIONNEL (Échelle Financière standard des Clickers)
function formatNumber(num) {
    if (num === 0) return '0';
    const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
    const i = Math.floor(Math.log10(num) / 3);
    if (i >= units.length) return num.toExponential(2);
    if (i === 0) return Math.floor(num).toString();
    return (num / Math.pow(10, i * 3)).toFixed(2) + ' ' + units[i];
}

// CALCULS DES COÛTS EXPONENTIELS
function getUpgradeCost(type) {
    const up = state.upgrades[type];
    return Math.floor(up.baseCost * Math.pow(up.costScale, up.count));
}

function recalculateCps() {
    let total = 0;
    for (const key in state.upgrades) {
        total += state.upgrades[key].count * state.upgrades[key].cps;
    }
    state.totalCps = total;
}

// SYNC INTERFACE GRAPHIQUE
function updateUI() {
    document.getElementById('global-coal').innerText = formatNumber(state.coal);
    document.getElementById('global-cps').innerText = formatNumber(state.totalCps);
    document.getElementById('display-bet-amount').innerText = formatNumber(currentBetAmount);
    renderUpgrades();
}

// RENDU DYNAMIQUE DE LA BOUTIQUE AVEC DESIGN PREMIUM
function renderUpgrades() {
    const container = document.getElementById('upgrades-list');
    container.innerHTML = '';

    const upgradeNames = {
        miner: { name: 'Équipe de Mineurs', desc: 'Pioches manuelles renforcées' },
        drill: { name: 'Foreuse Automatique', desc: 'Forage rotatif continu' },
        excavator: { name: 'Excavatrice Lourde', desc: 'Rendement industriel à godets' },
        laser: { name: 'Rayon de Phase Laser', desc: 'Sublime la roche instantanément' },
        nuclear: { name: 'Réacteur de Mine Atomique', desc: 'Extraction par fission contrôlée' },
        quantum: { name: 'Manipulateur Quantique', desc: 'Téléporte le minerai purifié' },
        singularity: { name: 'Foreuse Singularité', desc: 'Effondrement gravitationnel contrôlé' }
    };

    for (const key in state.upgrades) {
        const up = state.upgrades[key];
        const cost = getUpgradeCost(key);
        const canAfford = state.coal >= cost;

        const row = document.createElement('button');
        row.disabled = !canAfford;
        row.className = `w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${
            canAfford 
                ? 'bg-neutral-900 border-neutral-800 hover:border-amber-500/40 cursor-pointer' 
                : 'bg-neutral-950 border-neutral-900 opacity-50 cursor-not-allowed'
        }`;

        row.onclick = () => {
            if (state.coal >= cost) {
                state.coal -= cost;
                up.count++;
                recalculateCps();
                updateUI();
                saveGame();
            }
        };

        row.innerHTML = `
            <div class="flex-1 pr-4">
                <div class="text-xs font-bold text-neutral-200 group-hover:text-amber-400 transition-colors">${upgradeNames[key].name} <span class="text-amber-500 font-mono text-[11px] ml-1">x${up.count}</span></div>
                <div class="text-[10px] text-neutral-500">${upgradeNames[key].desc}</div>
                <div class="text-[10px] text-emerald-400 mt-0.5 font-medium">+${formatNumber(up.cps * up.count)}/s total</div>
            </div>
            <div class="text-right">
                <div class="text-xs font-mono font-bold ${canAfford ? 'text-amber-500' : 'text-neutral-500'}">${formatNumber(cost)}</div>
                <div class="text-[9px] text-neutral-500 uppercase font-semibold">Charbon</div>
            </div>
        `;
        container.appendChild(row);
    }
}

// SYSTÈME DE CASINO ROULETTE PREMIUM
function setupCasino() {
    const chips = document.querySelectorAll('.chip-btn');
    chips.forEach(chip => {
        chip.onclick = () => {
            if (isSpinning) return;
            chips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            currentBetAmount = parseInt(chip.getAttribute('data-amount'));
            updateUI();
        };
    });

    document.getElementById('clear-bet-btn').onclick = () => {
        if (isSpinning) return;
        chips.forEach(c => c.classList.remove('selected'));
        currentBetAmount = 0;
        updateUI();
    };

    document.getElementById('spin-btn').onclick = () => {
        if (isSpinning) return;
        const targetInput = document.getElementById('bet-target');
        const targetNumber = parseInt(targetInput.value);

        if (isNaN(targetNumber) || targetNumber < 0 || targetNumber > 36) {
            alert('Veuillez sélectionner un numéro valide entre 0 et 36.');
            return;
        }
        if (currentBetAmount <= 0) {
            alert('Sélectionnez un jeton pour miser.');
            return;
        }
        if (state.coal < currentBetAmount) {
            alert('Ressources insuffisantes pour cette mise.');
            return;
        }

        // LOCK ENGINE
        isSpinning = true;
        state.coal -= currentBetAmount;
        updateUI();

        const statusDisplay = document.getElementById('roulette-status');
        const wheel = document.getElementById('casino-wheel');
        statusDisplay.innerText = "Roue en rotation...";
        statusDisplay.className = "text-xs text-amber-500 font-bold animate-pulse";

        // CALCUL DE ROTATION PHYSIQUE (Min 5 tours complets + angle aléatoire)
        const randomDegree = Math.floor(Math.random() * 360) + 1800; 
        wheel.style.transform = `rotate(${randomDegree}deg)`;

        setTimeout(() => {
            // Calcul mathématique du numéro gagnant en fonction du résidu de l'angle
            const normalizedDegree = randomDegree % 360;
            const separation = 360 / 37;
            const winningIndex = Math.floor(normalizedDegree / separation);
            
            // Simulation simplifiée indexée sur le modèle européen standard
            const engineResult = Math.floor(Math.random() * 37);

            isSpinning = false;
            wheel.style.transition = 'none';
            wheel.style.transform = `rotate(${normalizedDegree}deg)`;
            setTimeout(() => wheel.style.transition = 'transform 4s cubic-bezier(0.1, 0.8, 0.1, 1)', 50);

            if (engineResult === targetNumber) {
                const payout = currentBetAmount * 36;
                state.coal += payout;
                statusDisplay.innerText = `GAGNÉ (N° ${engineResult}) ! +${formatNumber(payout)}`;
                statusDisplay.className = "text-xs text-emerald-400 font-black";
            } else {
                statusDisplay.innerText = `PERDU (N° ${engineResult})`;
                statusDisplay.className = "text-xs text-red-500 font-bold";
            }
            updateUI();
            saveGame();
        }, 4000);
    };
}

// ENGINES INTERNES : CLICS & TICKER AUTOMATIQUE
document.getElementById('main-click-btn').onclick = () => {
    state.coal += 1 + (state.totalCps * 0.05); // Bonus de clic indexé sur 5% de la puissance globale
    updateUI();
    saveGame();
};

// LOOP DE PRODUCTION ET SAUVEGARDE AUTOMATIQUE MICRO-CADENCÉE
setInterval(() => {
    state.coal += state.totalCps / 10;
    updateUI();
}, 100);

// PERSISTENCE DES DONNÉES (STORAGE POOL)
function saveGame() {
    localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

function loadGame() {
    const raw = localStorage.getItem(GAME_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (parsed.upgrades) {
                state.coal = parsed.coal || 0;
                for (const key in parsed.upgrades) {
                    if (state.upgrades[key]) state.upgrades[key].count = parsed.upgrades[key].count || 0;
                }
            }
        } catch (e) {
            console.error("Échec de la désérialisation de la sauvegarde. Pool corrompu.", e);
        }
    }
    recalculateCps();
    updateUI();
}

// INITIALISATION DU ENGINE APRES CHARGEMENT DU DOM
window.onload = () => {
    loadGame();
    setupCasino();
};
