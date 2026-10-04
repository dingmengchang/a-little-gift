document.addEventListener('DOMContentLoaded', () => {
    // ---------- 本地状态：记住 TA 的选择和盖章，刷新/重开不丢 ----------
    const STORAGE_KEY = 'friend_gift_v1';
    let state = { no: '', meal: null, revealed: false, stamped: false };
    try {
        Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch (e) { /* localStorage 不可用就当无状态，不影响展示 */ }
    const save = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    };
    if (!state.no) {
        state.no = 'NO.2026-' + Math.floor(1000 + Math.random() * 9000);
        save();
    }

    // ---------- 基础 UI ----------
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // 手机端适配
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
    }

    // ---------- 请客券交互 ----------
    const giftCard = document.getElementById('giftCard');
    const revealBtn = document.getElementById('revealBtn');
    const coupon = document.getElementById('coupon');
    const couponNo = document.getElementById('couponNo');
    const optionBtns = Array.from(document.querySelectorAll('.coupon-option'));
    const couponHint = document.getElementById('couponHint');
    const stampBtn = document.getElementById('stampBtn');

    couponNo.textContent = state.no;

    const markStamped = () => {
        coupon.classList.add('stamped');
        stampBtn.disabled = true;
        stampBtn.classList.add('done');
        stampBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px;vertical-align:middle;">check</span> 已收下，就这么说定了';
    };

    // 恢复之前的状态
    if (state.revealed || state.stamped) giftCard.classList.add('revealed');
    optionBtns.forEach(b => b.classList.toggle('selected', b.dataset.meal === state.meal));
    if (state.stamped) markStamped();

    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.meal = btn.dataset.meal;
            save();
            optionBtns.forEach(b => b.classList.toggle('selected', b === btn));
            couponHint.classList.remove('show');
        });
    });

    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            state.revealed = true;
            save();
            giftCard.classList.add('revealed');
            launchCelebration(10); // 发射 10 次组合烟花
        });
    }

    if (stampBtn) {
        stampBtn.addEventListener('click', () => {
            if (state.stamped) return;
            if (!state.meal) {
                // 没选就想盖章：晃一下提醒
                coupon.classList.remove('shake');
                void coupon.offsetWidth; // 重置动画
                coupon.classList.add('shake');
                couponHint.classList.add('show');
                setTimeout(() => couponHint.classList.remove('show'), 2600);
                return;
            }
            state.stamped = true;
            save();
            markStamped();
            launchCelebration(14);
        });
    }

    // ---------- 背景音乐控制 ----------
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let isMusicPlaying = false;

    if (bgMusic) {
        bgMusic.volume = 0.3;

        const toggleMusic = () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicToggle.classList.remove('playing');
                musicToggle.querySelector('.material-symbols-rounded').innerText = 'music_off';
                isMusicPlaying = false;
            } else {
                bgMusic.play().then(() => {
                    musicToggle.classList.add('playing');
                    musicToggle.querySelector('.material-symbols-rounded').innerText = 'music_note';
                    isMusicPlaying = true;
                }).catch(e => {
                    console.log("播放失败:", e);
                    isMusicPlaying = false;
                    musicToggle.classList.remove('playing');
                });
            }
        };

        if (musicToggle) {
            musicToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMusic();
            });
        }

        // 尝试自动播放（需要用户交互）
        const startMusicOnFirstInteraction = () => {
            if (!isMusicPlaying) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    if (musicToggle) {
                        musicToggle.classList.add('playing');
                        musicToggle.querySelector('.material-symbols-rounded').innerText = 'music_note';
                    }
                }).catch(e => {
                    // 等待用户交互以播放音乐
                });
            }
            document.removeEventListener('click', startMusicOnFirstInteraction);
        };
        document.addEventListener('click', startMusicOnFirstInteraction);
    }

    // ==========================================
    // 烟花逻辑
    // ==========================================
    let isFireworksActive = false;
    const fwCanvas = document.getElementById('fireworksCanvas');
    if (!fwCanvas) return;

    const fwCtx = fwCanvas.getContext('2d');
    let fwWidth = window.innerWidth;
    let fwHeight = window.innerHeight;
    fwCanvas.width = fwWidth;
    fwCanvas.height = fwHeight;

    const fireworks = [];
    const particles = [];

    function launchCelebration(count) {
        if (!isFireworksActive) {
            initFireworks();
            isFireworksActive = true;
            fwCanvas.style.display = 'block';
        }
        autoLaunch(count);
    }

    function initFireworks() {
        resizeFw();
        window.addEventListener('resize', resizeFw);
        fwLoop();

        window.addEventListener('mousedown', (e) => {
            if (!isFireworksActive) return;
            launchComboFirework(e.clientX, e.clientY);
        });
    }

    function resizeFw() {
        fwWidth = fwCanvas.width = window.innerWidth;
        fwHeight = fwCanvas.height = window.innerHeight;
    }

    function autoLaunch(count) {
        let i = 0;
        const timer = setInterval(() => {
            launchComboFirework(fwWidth / 2 + (Math.random() - 0.5) * 400, fwHeight * 0.3 + (Math.random() - 0.5) * 200);
            i++;
            if (i >= count) clearInterval(timer);
        }, 300);
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function launchComboFirework(targetX, targetY) {
        const effects = [0, 1, 2];
        fireworks.push(new Firework(fwWidth / 2, fwHeight, targetX, targetY, effects));
    }

    class Firework {
        constructor(sx, sy, tx, ty, effects) {
            this.x = sx; this.y = sy;
            this.sx = sx; this.sy = sy;
            this.tx = tx; this.ty = ty;
            this.distanceToTarget = Math.hypot(tx - sx, ty - sy);
            this.distanceTraveled = 0;
            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 12;
            this.acceleration = 0.95;
            this.brightness = random(50, 70);
            this.effects = effects;
            this.coordinates = [];
            this.coordinateCount = 3;
            while(this.coordinateCount--) this.coordinates.push([this.x, this.y]);
        }
        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.speed *= this.acceleration;
            const vx = Math.cos(this.angle) * this.speed;
            const vy = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = Math.hypot(this.sx - this.x + vx, this.sy - this.y + vy);

            if (this.distanceTraveled >= this.distanceToTarget || this.speed < 1) {
                this.explode();
                fireworks.splice(index, 1);
            } else {
                this.x += vx; this.y += vy;
            }
        }
        draw() {
            fwCtx.beginPath();
            fwCtx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            fwCtx.lineTo(this.x, this.y);
            fwCtx.strokeStyle = `hsl(${random(0, 360)}, 100%, ${this.brightness}%)`;
            fwCtx.stroke();
        }
        explode() {
            const count = 80;
            const hue = random(0, 360);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(this.x, this.y, hue));
            }
        }
    }

    class Particle {
        constructor(x, y, hue) {
            this.x = x; this.y = y;
            this.angle = random(0, Math.PI * 2);
            this.speed = random(1, 10);
            this.friction = 0.95;
            this.gravity = 0.2;
            this.hue = hue + random(-20, 20);
            this.brightness = random(50, 80);
            this.alpha = 1;
            this.decay = random(0.015, 0.03);
        }
        update(index) {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            if (this.alpha <= this.decay) particles.splice(index, 1);
        }
        draw() {
            fwCtx.save();
            fwCtx.globalAlpha = this.alpha;
            fwCtx.beginPath();
            fwCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            fwCtx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            fwCtx.fill();
            fwCtx.restore();
        }
    }

    function fwLoop() {
        if (!isFireworksActive) {
            requestAnimationFrame(fwLoop);
            return;
        }
        requestAnimationFrame(fwLoop);

        fwCtx.globalCompositeOperation = 'destination-out';
        fwCtx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // 拖尾
        fwCtx.fillRect(0, 0, fwWidth, fwHeight);

        fwCtx.globalCompositeOperation = 'lighter';

        let i = fireworks.length;
        while(i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }
        let j = particles.length;
        while(j--) {
            particles[j].draw();
            particles[j].update(j);
        }
    }
});
