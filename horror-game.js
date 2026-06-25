// Game Constants
const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;

// Game States
const SCREEN = {
    START: 'start',
    GAME: 'game',
    INSTRUCTIONS: 'instructions',
    GAME_OVER: 'gameover',
    WIN: 'win'
};

// Game Class
class HorrorGame {
    constructor() {
        this.currentScreen = SCREEN.START;
        this.gameRunning = false;
        this.player = null;
        this.entities = [];
        this.items = [];
        this.walls = [];
        this.lights = [];
        this.canvas = document.getElementById('game-canvas');
        this.gameScreen = document.getElementById('game-screen');
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createPlayer();
        this.createMazeWalls();
        this.createEnemies();
        this.createItems();
        this.createLights();
    }

    createPlayer() {
        this.player = {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            speed: 5,
            runSpeed: 8,
            health: 100,
            maxHealth: 100,
            sanity: 100,
            maxSanity: 100,
            isRunning: false,
            hasKey: false,
            element: null
        };

        this.updatePlayerElement();
    }

    createMazeWalls() {
        this.walls = [
            // Outer walls
            { x: 0, y: 0, w: GAME_WIDTH, h: 20 },
            { x: 0, y: GAME_HEIGHT - 20, w: GAME_WIDTH, h: 20 },
            { x: 0, y: 0, w: 20, h: GAME_HEIGHT },
            { x: GAME_WIDTH - 20, y: 0, w: 20, h: GAME_HEIGHT },
            
            // Inner maze walls
            { x: 200, y: 100, w: 300, h: 20 },
            { x: 500, y: 150, w: 20, h: 300 },
            { x: 300, y: 400, w: 400, h: 20 },
            { x: 100, y: 300, w: 20, h: 200 },
            { x: GAME_WIDTH - 300, y: 200, w: 200, h: 20 },
            { x: GAME_WIDTH - 100, y: 350, w: 20, h: 200 }
        ];

        this.renderWalls();
    }

    createEnemies() {
        this.entities = [
            this.createEnemy(200, 200),
            this.createEnemy(GAME_WIDTH - 300, 300),
            this.createEnemy(GAME_WIDTH / 2, 150)
        ];
    }

    createEnemy(x, y) {
        return {
            x: x,
            y: y,
            width: 40,
            height: 50,
            vx: Math.random() > 0.5 ? 1 : -1,
            vy: Math.random() > 0.5 ? 1 : -1,
            speed: 2,
            detectionRange: 300,
            chaseRange: 500,
            element: null,
            isActive: true
        };
    }

    createItems() {
        this.items = [
            { x: GAME_WIDTH - 150, y: GAME_HEIGHT - 150, type: 'key', collected: false, element: null },
            { x: 150, y: 150, type: 'health', collected: false, element: null },
            { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 - 200, type: 'health', collected: false, element: null }
        ];

        this.renderItems();
    }

    createLights() {
        this.lights = [
            { x: 200, y: 200, radius: 150 },
            { x: GAME_WIDTH - 200, y: 200, radius: 150 },
            { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 200, radius: 150 },
            { x: 100, y: GAME_HEIGHT - 100, radius: 120 }
        ];
    }

    renderWalls() {
        this.walls.forEach(wall => {
            const wallEl = document.createElement('div');
            wallEl.className = 'wall';
            wallEl.style.left = wall.x + 'px';
            wallEl.style.top = wall.y + 'px';
            wallEl.style.width = wall.w + 'px';
            wallEl.style.height = wall.h + 'px';
            this.canvas.appendChild(wallEl);
        });
    }

    renderItems() {
        this.items.forEach((item, idx) => {
            if (item.element) item.element.remove();
            if (!item.collected) {
                const itemEl = document.createElement('div');
                itemEl.className = 'item';
                itemEl.style.left = item.x + 'px';
                itemEl.style.top = item.y + 'px';
                itemEl.style.width = '25px';
                itemEl.style.height = '25px';
                this.canvas.appendChild(itemEl);
                item.element = itemEl;
            }
        });
    }

    updatePlayerElement() {
        if (this.player.element) this.player.element.remove();
        
        const playerEl = document.createElement('div');
        playerEl.className = 'player';
        playerEl.style.left = this.player.x + 'px';
        playerEl.style.top = this.player.y + 'px';
        this.canvas.appendChild(playerEl);
        this.player.element = playerEl;
    }

    updateEnemyElements() {
        this.entities.forEach(entity => {
            if (entity.element) entity.element.remove();
            
            const entityEl = document.createElement('div');
            entityEl.className = 'entity';
            entityEl.style.left = entity.x + 'px';
            entityEl.style.top = entity.y + 'px';
            this.canvas.appendChild(entityEl);
            entity.element = entityEl;
        });
    }

    updateDarkness() {
        let overlay = document.querySelector('.darkness-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'darkness-overlay';
            this.canvas.appendChild(overlay);
        }
        
        const px = ((this.player.x + this.player.width / 2) / GAME_WIDTH) * 100;
        const py = ((this.player.y + this.player.height / 2) / GAME_HEIGHT) * 100;
        
        overlay.style.setProperty('--px', px + '%');
        overlay.style.setProperty('--py', py + '%');
    }

    setupEventListeners() {
        // Screen buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('instructions-btn').addEventListener('click', () => this.showScreen(SCREEN.INSTRUCTIONS));
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen(SCREEN.START));
        document.getElementById('restart-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('menu-btn').addEventListener('click', () => this.showScreen(SCREEN.START));
        document.getElementById('restart-btn-win').addEventListener('click', () => this.resetGame());
        document.getElementById('menu-btn-win').addEventListener('click', () => this.showScreen(SCREEN.START));

        // Keyboard controls
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Window resize
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    handleKeyDown(e) {
        if (!this.gameRunning) return;

        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.player.vy = -1;
                break;
            case 'arrowdown':
            case 's':
                this.player.vy = 1;
                break;
            case 'arrowleft':
            case 'a':
                this.player.vx = -1;
                break;
            case 'arrowright':
            case 'd':
                this.player.vx = 1;
                break;
            case 'shift':
                this.player.isRunning = true;
                break;
            case 'e':
                this.checkInteractions();
                break;
        }
    }

    handleKeyUp(e) {
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
            case 'arrowdown':
            case 's':
                this.player.vy = 0;
                break;
            case 'arrowleft':
            case 'a':
            case 'arrowright':
            case 'd':
                this.player.vx = 0;
                break;
            case 'shift':
                this.player.isRunning = false;
                break;
        }
    }

    checkInteractions() {
        // Check if player can pick up items
        this.items.forEach(item => {
            const dist = Math.hypot(
                this.player.x - item.x,
                this.player.y - item.y
            );

            if (dist < 50 && !item.collected) {
                item.collected = true;
                if (item.type === 'key') {
                    this.player.hasKey = true;
                    this.showMessage('Found the KEY! Head to the exit!');
                } else if (item.type === 'health') {
                    this.player.health = Math.min(this.player.health + 50, this.player.maxHealth);
                    this.showMessage('Collected health potion!');
                }
                this.renderItems();
            }
        });

        // Check if player reaches exit
        if (this.player.hasKey && 
            this.player.x > GAME_WIDTH - 50 && 
            this.player.y > GAME_HEIGHT - 50) {
            this.winGame();
        }
    }

    showMessage(text) {
        const prompt = document.getElementById('interaction-prompt');
        prompt.textContent = text;
        setTimeout(() => {
            if (prompt.textContent === text) prompt.textContent = '';
        }, 3000);
    }

    update() {
        if (!this.gameRunning) return;

        // Update player position
        const speed = this.player.isRunning ? this.player.runSpeed : this.player.speed;
        this.player.x += this.player.vx * speed;
        this.player.y += this.player.vy * speed;

        // Keep player in bounds and collide with walls
        this.player.x = Math.max(20, Math.min(this.player.x, GAME_WIDTH - 50));
        this.player.y = Math.max(20, Math.min(this.player.y, GAME_HEIGHT - 60));

        // Check wall collisions
        this.walls.forEach(wall => {
            if (this.isColliding(
                this.player.x, this.player.y, this.player.width, this.player.height,
                wall.x, wall.y, wall.w, wall.h
            )) {
                // Push player back
                this.player.x -= this.player.vx * speed;
                this.player.y -= this.player.vy * speed;
            }
        });

        // Update enemies
        this.updateEnemies();

        // Update player sanity based on darkness and enemies
        this.updateSanity();

        // Check game over conditions
        if (this.player.health <= 0 || this.player.sanity <= 0) {
            this.gameOver('You did not survive the night...');
        }

        // Render
        this.updatePlayerElement();
        this.updateEnemyElements();
        this.updateDarkness();
        this.updateHUD();
    }

    updateEnemies() {
        this.entities.forEach(entity => {
            const dist = Math.hypot(
                this.player.x - entity.x,
                this.player.y - entity.y
            );

            // Chase player if close enough
            if (dist < entity.chaseRange) {
                const angle = Math.atan2(this.player.y - entity.y, this.player.x - entity.x);
                entity.vx = Math.cos(angle) * entity.speed;
                entity.vy = Math.sin(angle) * entity.speed;
            } else {
                // Random movement
                if (Math.random() < 0.02) {
                    entity.vx = (Math.random() - 0.5) * entity.speed;
                    entity.vy = (Math.random() - 0.5) * entity.speed;
                }
            }

            // Update position
            entity.x += entity.vx;
            entity.y += entity.vy;

            // Keep in bounds
            entity.x = Math.max(20, Math.min(entity.x, GAME_WIDTH - 60));
            entity.y = Math.max(20, Math.min(entity.y, GAME_HEIGHT - 70));

            // Check collision with walls
            this.walls.forEach(wall => {
                if (this.isColliding(
                    entity.x, entity.y, entity.width, entity.height,
                    wall.x, wall.y, wall.w, wall.h
                )) {
                    entity.vx *= -1;
                    entity.vy *= -1;
                }
            });

            // Check if entity catches player
            if (dist < 60) {
                this.player.health -= 2;
                this.player.sanity -= 5;
            }
        });
    }

    updateSanity() {
        // Decrease sanity in darkness
        let inDarkness = true;
        this.lights.forEach(light => {
            const dist = Math.hypot(
                this.player.x - light.x,
                this.player.y - light.y
            );
            if (dist < light.radius) {
                inDarkness = false;
            }
        });

        if (inDarkness) {
            this.player.sanity -= 0.2;
        } else {
            this.player.sanity += 0.1;
        }

        // Decrease sanity when enemies are close
        this.entities.forEach(entity => {
            const dist = Math.hypot(
                this.player.x - entity.x,
                this.player.y - entity.y
            );
            if (dist < 250) {
                this.player.sanity -= 0.5;
            }
        });

        this.player.sanity = Math.max(0, Math.min(this.player.sanity, this.player.maxSanity));
    }

    isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 &&
               x1 + w1 > x2 &&
               y1 < y2 + h2 &&
               y1 + h1 > y2;
    }

    updateHUD() {
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = healthPercent + '%';
        document.getElementById('health-text').textContent = `Health: ${Math.ceil(this.player.health)}`;
        document.getElementById('sanity-text').textContent = `Sanity: ${Math.ceil(this.player.sanity)}`;

        // Update interaction prompt
        if (this.player.hasKey) {
            document.getElementById('interaction-prompt').textContent = 'KEY ACQUIRED - Go to bottom-right corner to exit!';
        }
    }

    showScreen(screenName) {
        // Hide all screens
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('instructions-screen').style.display = 'none';
        document.getElementById('gameover-screen').style.display = 'none';
        document.getElementById('win-screen').style.display = 'none';
        this.gameScreen.classList.remove('game-active');

        // Show selected screen
        switch(screenName) {
            case SCREEN.START:
                document.getElementById('start-screen').style.display = 'flex';
                break;
            case SCREEN.INSTRUCTIONS:
                document.getElementById('instructions-screen').style.display = 'flex';
                break;
            case SCREEN.GAME_OVER:
                document.getElementById('gameover-screen').style.display = 'flex';
                break;
            case SCREEN.WIN:
                document.getElementById('win-screen').style.display = 'flex';
                break;
            case SCREEN.GAME:
                this.gameScreen.classList.add('game-active');
                break;
        }

        this.currentScreen = screenName;
    }

    startGame() {
        this.gameRunning = true;
        this.showScreen(SCREEN.GAME);
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver(message) {
        this.gameRunning = false;
        document.getElementById('gameover-message').textContent = message;
        this.showScreen(SCREEN.GAME_OVER);
    }

    winGame() {
        this.gameRunning = false;
        this.showScreen(SCREEN.WIN);
    }

    resetGame() {
        // Clear canvas
        this.canvas.innerHTML = '';
        
        // Reset game state
        this.currentScreen = SCREEN.START;
        this.gameRunning = false;
        
        // Reinitialize
        this.initializeGame();
        this.showScreen(SCREEN.START);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new HorrorGame();
});