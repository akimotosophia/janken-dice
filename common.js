// 背景アニメーション
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class BackgroundParticle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // 画面端で折り返し
        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    resizeCanvas();
    particles = [];
    const particleCount = Math.floor((width * height) / 15000);

    for (let i = 0; i < particleCount; i++) {
        particles.push(new BackgroundParticle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // パーティクルを更新・描画
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // パーティクル間に線を描画
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.strokeStyle = `rgba(102, 126, 234, ${(1 - distance / 150) * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });

    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    // パーティクル数を調整
    const targetCount = Math.floor((width * height) / 15000);
    while (particles.length < targetCount) {
        particles.push(new BackgroundParticle());
    }
    while (particles.length > targetCount) {
        particles.pop();
    }
});

// 初期化とアニメーション開始
init();
animate();
