// ゲーム状態管理
const gameState = {
    points: 0,
    playerDice: {
        faces: ['✊', '✊', '✋', '✋', '✌️', '✌️'] // 初期: グー2, パー2, チョキ2
    },
    enemyDice: {
        faces: ['✊', '✊', '✋', '✋', '✌️', '✌️']
    },
    inventory: [], // {type, symbol, rarity, effect, multiplier}
    selectedSlot: null,
    idleRate: 1, // ポイント/秒
    idleProgress: 0
};

// 面の定義
const faceTypes = {
    ROCK: { symbol: '✊', name: 'グー', rarity: 'common', effect: '通常', multiplier: 1 },
    PAPER: { symbol: '✋', name: 'パー', rarity: 'common', effect: '通常', multiplier: 1 },
    SCISSORS: { symbol: '✌️', name: 'チョキ', rarity: 'common', effect: '通常', multiplier: 1 },
    DOUBLE_ROCK: { symbol: '✊✊', name: 'ダブルグー', rarity: 'rare', effect: 'ポイント2倍', multiplier: 2 },
    DOUBLE_PAPER: { symbol: '✋✋', name: 'ダブルパー', rarity: 'rare', effect: 'ポイント2倍', multiplier: 2 },
    DOUBLE_SCISSORS: { symbol: '✌️✌️', name: 'ダブルチョキ', rarity: 'rare', effect: 'ポイント2倍', multiplier: 2 },
    TRIPLE_ROCK: { symbol: '✊✊✊', name: 'トリプルグー', rarity: 'epic', effect: 'ポイント3倍', multiplier: 3 },
    TRIPLE_PAPER: { symbol: '✋✋✋', name: 'トリプルパー', rarity: 'epic', effect: 'ポイント3倍', multiplier: 3 },
    TRIPLE_SCISSORS: { symbol: '✌️✌️✌️', name: 'トリプルチョキ', rarity: 'epic', effect: 'ポイント3倍', multiplier: 3 },
    GOLDEN_ROCK: { symbol: '👑✊', name: 'ゴールデングー', rarity: 'legendary', effect: 'ポイント5倍', multiplier: 5 },
    GOLDEN_PAPER: { symbol: '👑✋', name: 'ゴールデンパー', rarity: 'legendary', effect: 'ポイント5倍', multiplier: 5 },
    GOLDEN_SCISSORS: { symbol: '👑✌️', name: 'ゴールデンチョキ', rarity: 'legendary', effect: 'ポイント5倍', multiplier: 5 }
};

// じゃんけんの判定
function getWinner(player, enemy) {
    // シンボルから基本タイプを抽出
    const getBaseType = (symbol) => {
        if (symbol.includes('✊')) return 'ROCK';
        if (symbol.includes('✋')) return 'PAPER';
        if (symbol.includes('✌️')) return 'SCISSORS';
        return 'ROCK';
    };

    const playerBase = getBaseType(player);
    const enemyBase = getBaseType(enemy);

    if (playerBase === enemyBase) return 'draw';
    if (playerBase === 'ROCK' && enemyBase === 'SCISSORS') return 'win';
    if (playerBase === 'PAPER' && enemyBase === 'ROCK') return 'win';
    if (playerBase === 'SCISSORS' && enemyBase === 'PAPER') return 'win';
    return 'lose';
}

// サイコロを振る
function rollDice(faces) {
    const randomIndex = Math.floor(Math.random() * 6);
    return { face: faces[randomIndex], index: randomIndex };
}

// マルチプライヤーを取得
function getMultiplier(symbol) {
    const faceType = Object.values(faceTypes).find(f => f.symbol === symbol);
    return faceType ? faceType.multiplier : 1;
}

// バトル処理
async function battle() {
    const battleBtn = document.getElementById('battle-btn');
    const playerDiceEl = document.getElementById('player-dice');
    const enemyDiceEl = document.getElementById('enemy-dice');
    const resultEl = document.getElementById('battle-result');

    battleBtn.disabled = true;
    resultEl.textContent = '';
    resultEl.className = 'battle-result';

    // サイコロ回転アニメーション
    playerDiceEl.classList.add('rolling');
    enemyDiceEl.classList.add('rolling');

    await sleep(600);

    // サイコロを振る
    const playerRoll = rollDice(gameState.playerDice.faces);
    const enemyRoll = rollDice(gameState.enemyDice.faces);

    // 結果を表示
    document.getElementById('player-result').textContent = playerRoll.face;
    document.getElementById('enemy-result').textContent = enemyRoll.face;

    playerDiceEl.classList.remove('rolling');
    enemyDiceEl.classList.remove('rolling');

    await sleep(200);

    // 勝敗判定
    const result = getWinner(playerRoll.face, enemyRoll.face);

    if (result === 'win') {
        const basePoints = 10;
        const multiplier = getMultiplier(playerRoll.face);
        const earnedPoints = basePoints * multiplier;

        gameState.points += earnedPoints;
        resultEl.textContent = `勝利! +${earnedPoints}ポイント`;
        resultEl.className = 'battle-result win';
        playerDiceEl.classList.add('winner');

        // パーティクルエフェクト
        createParticleBurst(window.innerWidth / 3, window.innerHeight / 2, 'gold');

        setTimeout(() => playerDiceEl.classList.remove('winner'), 2000);
    } else if (result === 'lose') {
        resultEl.textContent = '敗北...';
        resultEl.className = 'battle-result lose';
        enemyDiceEl.classList.add('winner');
        setTimeout(() => enemyDiceEl.classList.remove('winner'), 2000);
    } else {
        resultEl.textContent = '引き分け';
        resultEl.className = 'battle-result draw';
    }

    updateUI();
    battleBtn.disabled = false;
}

// ガチャ処理
function gacha() {
    const gachaCost = 100;

    if (gameState.points < gachaCost) {
        alert('ポイントが足りません!');
        return;
    }

    gameState.points -= gachaCost;

    // ランダムで面を獲得
    const roll = Math.random();
    let acquiredFace;

    if (roll < 0.5) { // 50% - Common
        const commons = [faceTypes.ROCK, faceTypes.PAPER, faceTypes.SCISSORS];
        acquiredFace = commons[Math.floor(Math.random() * commons.length)];
    } else if (roll < 0.8) { // 30% - Rare
        const rares = [faceTypes.DOUBLE_ROCK, faceTypes.DOUBLE_PAPER, faceTypes.DOUBLE_SCISSORS];
        acquiredFace = rares[Math.floor(Math.random() * rares.length)];
    } else if (roll < 0.95) { // 15% - Epic
        const epics = [faceTypes.TRIPLE_ROCK, faceTypes.TRIPLE_PAPER, faceTypes.TRIPLE_SCISSORS];
        acquiredFace = epics[Math.floor(Math.random() * epics.length)];
    } else { // 5% - Legendary
        const legendaries = [faceTypes.GOLDEN_ROCK, faceTypes.GOLDEN_PAPER, faceTypes.GOLDEN_SCISSORS];
        acquiredFace = legendaries[Math.floor(Math.random() * legendaries.length)];
    }

    // インベントリに追加
    const existingItem = gameState.inventory.find(item => item.symbol === acquiredFace.symbol);
    if (existingItem) {
        existingItem.count++;
    } else {
        gameState.inventory.push({...acquiredFace, count: 1});
    }

    // パーティクルエフェクト
    const rarityColors = {
        common: '#95a5a6',
        rare: '#3498db',
        epic: '#9370db',
        legendary: '#ffd700'
    };
    createParticleBurst(window.innerWidth / 2, window.innerHeight / 2, rarityColors[acquiredFace.rarity]);

    alert(`${acquiredFace.name}を獲得しました!\n${acquiredFace.effect}`);
    updateUI();
    updateInventory();
}

// カスタマイズUI更新
function updateCustomizeGrid() {
    const grid = document.getElementById('customize-grid');
    grid.innerHTML = '';

    gameState.playerDice.faces.forEach((face, index) => {
        const slot = document.createElement('div');
        slot.className = 'face-slot';
        slot.dataset.index = index;
        slot.textContent = face;

        slot.addEventListener('click', () => {
            document.querySelectorAll('.face-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
            gameState.selectedSlot = index;
        });

        grid.appendChild(slot);
    });
}

// インベントリUI更新
function updateInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    if (gameState.inventory.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">ガチャを回して面を獲得しよう!</p>';
        return;
    }

    gameState.inventory.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `inventory-item rarity-${item.rarity}`;
        itemEl.innerHTML = `
            <div>${item.symbol}</div>
            ${item.count > 1 ? `<div class="item-count">x${item.count}</div>` : ''}
        `;
        itemEl.title = `${item.name}\n${item.effect}`;

        itemEl.addEventListener('click', () => {
            if (gameState.selectedSlot !== null) {
                gameState.playerDice.faces[gameState.selectedSlot] = item.symbol;
                item.count--;
                if (item.count === 0) {
                    gameState.inventory = gameState.inventory.filter(i => i !== item);
                }
                updateCustomizeGrid();
                updateInventory();
                updateDiceFaces();
            } else {
                alert('まず、サイコロのスロットを選択してください!');
            }
        });

        grid.appendChild(itemEl);
    });
}

// サイコロの面表示更新
function updateDiceFaces() {
    const playerFacesEl = document.getElementById('player-faces');
    const enemyFacesEl = document.getElementById('enemy-faces');

    playerFacesEl.innerHTML = '';
    enemyFacesEl.innerHTML = '';

    gameState.playerDice.faces.forEach(face => {
        const card = document.createElement('div');
        card.className = 'face-card';
        const faceType = Object.values(faceTypes).find(f => f.symbol === face);
        if (faceType && faceType.rarity !== 'common') {
            card.classList.add('special');
        }
        card.textContent = face;
        card.title = faceType ? faceType.name : '';
        playerFacesEl.appendChild(card);
    });

    gameState.enemyDice.faces.forEach(face => {
        const card = document.createElement('div');
        card.className = 'face-card';
        card.textContent = face;
        enemyFacesEl.appendChild(card);
    });
}

// UI更新
function updateUI() {
    document.getElementById('points').textContent = gameState.points;
    document.getElementById('idle-rate').textContent = gameState.idleRate;
}

// パーティクルシステム
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10 - 5;
        this.life = 1;
        this.decay = 0.01 + Math.random() * 0.02;
        this.size = 5 + Math.random() * 5;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // 重力
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() {
        return this.life <= 0;
    }
}

const particles = [];
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createParticleBurst(x, y, color) {
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw(ctx);

        if (particle.isDead()) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animateParticles);
}

animateParticles();

// 放置システム
function idleUpdate() {
    gameState.idleProgress += gameState.idleRate / 60; // 60fps想定

    if (gameState.idleProgress >= 1) {
        gameState.points += Math.floor(gameState.idleProgress);
        gameState.idleProgress = gameState.idleProgress % 1;
        updateUI();
    }

    const progressPercent = (gameState.idleProgress % 1) * 100;
    document.getElementById('idle-bar').style.width = progressPercent + '%';
}

setInterval(idleUpdate, 1000 / 60); // 60fps

// ユーティリティ
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// イベントリスナー
document.getElementById('battle-btn').addEventListener('click', battle);
document.getElementById('gacha-btn').addEventListener('click', gacha);
document.getElementById('save-dice-btn').addEventListener('click', () => {
    alert('サイコロの設定を保存しました!');
    gameState.selectedSlot = null;
    document.querySelectorAll('.face-slot').forEach(s => s.classList.remove('selected'));
});

// 初期化
function init() {
    // 初期インベントリ(チュートリアル用)
    gameState.inventory.push({...faceTypes.ROCK, count: 3});
    gameState.inventory.push({...faceTypes.PAPER, count: 3});
    gameState.inventory.push({...faceTypes.SCISSORS, count: 3});
    gameState.inventory.push({...faceTypes.DOUBLE_ROCK, count: 1});

    updateUI();
    updateCustomizeGrid();
    updateInventory();
    updateDiceFaces();
}

init();
