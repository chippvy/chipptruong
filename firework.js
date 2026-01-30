'use strict';

// Canvas setup - KHÔNG chờ load
const trailsCanvas = document.getElementById('trails-canvas');
const mainCanvas = document.getElementById('main-canvas');
const trailsCtx = trailsCanvas.getContext('2d');
const mainCtx = mainCanvas.getContext('2d');

// Set canvas size IMMEDIATELY
trailsCanvas.width = mainCanvas.width = window.innerWidth;
trailsCanvas.height = mainCanvas.height = window.innerHeight;

// Colors for fireworks
const COLORS = ['#ff0043', '#14fc56', '#1e7fff', '#e60aff', '#ffbf36', '#ffffff'];

// Store all particles
const particles = {
    stars: [],
    sparks: [],
    flashes: []
};

// Star particle
class Star {
    constructor(x, y, color, angle, speed, life) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.color = color;
        this.speedX = Math.sin(angle) * speed;
        this.speedY = Math.cos(angle) * speed;
        this.life = life;
        this.maxLife = life;
        this.visible = true;
        this.onDeath = null;
    }
    
    update(deltaTime) {
        this.prevX = this.x;
        this.prevY = this.y;
        
        // Move
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Gravity
        this.speedY += 0.001 * deltaTime;
        
        // Air resistance
        this.speedX *= 0.99;
        this.speedY *= 0.99;
        
        // Life decay
        this.life -= deltaTime;
        
        return this.life > 0;
    }
}

// Spark particle
class Spark {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.prevX = x;
        this.prevY = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.3 + 0.2;
        this.speedX = Math.sin(angle) * speed;
        this.speedY = Math.cos(angle) * speed;
        this.life = Math.random() * 200 + 200;
    }
    
    update(deltaTime) {
        this.prevX = this.x;
        this.prevY = this.y;
        
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Gravity and resistance
        this.speedY += 0.0005 * deltaTime;
        this.speedX *= 0.95;
        this.speedY *= 0.95;
        
        this.life -= deltaTime;
        return this.life > 0;
    }
}

// Flash effect
class Flash {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.life = 150;
        this.maxLife = 150;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        return this.life > 0;
    }
}

// Create particles
function createStar(x, y, color, angle, speed, life) {
    const star = new Star(x, y, color, angle, speed, life);
    particles.stars.push(star);
    return star;
}

function createSpark(x, y, color) {
    const spark = new Spark(x, y, color);
    particles.sparks.push(spark);
    return spark;
}

function createFlash(x, y, radius) {
    const flash = new Flash(x, y, radius);
    particles.flashes.push(flash);
    return flash;
}

// Create firework burst - SIMPLIFIED for speed
function createBurst(x, y, color) {
    const count = 60 + Math.random() * 40;
    const size = 200 + Math.random() * 200;
    const life = 700 + Math.random() * 300;
    
    // Main burst
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = size / 100 * Math.random();
        createStar(x, y, color, angle, speed, life);
    }
    
    // Flash effect
    createFlash(x, y, size / 8);
    
    // Some sparks
    for (let i = 0; i < 15; i++) {
        createSpark(x, y, color);
    }
}

// Launch a firework - ULTRA FAST
function launchFirework(x, y) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Target position (higher on screen)
    const targetX = x * window.innerWidth;
    const targetY = y * window.innerHeight * 0.7;
    
    // Launch from bottom
    const launchX = targetX;
    const launchY = window.innerHeight;
    
    // Calculate trajectory - SIMPLIFIED
    const distance = launchY - targetY;
    const velocity = Math.sqrt(distance * 0.003);
    
    // Rising star - FAST
    const star = createStar(
        launchX,
        launchY,
        color,
        -Math.PI / 2,
        velocity * 1.2, // Faster
        distance / velocity * 7 // Shorter time
    );
    
    // When star reaches top, burst - IMMEDIATE
    star.onDeath = () => {
        createBurst(targetX, targetY, color);
    };
}

// Launch multiple fireworks IMMEDIATELY
function launchInitialFireworks() {
    // Launch 5 fireworks immediately at different positions
    launchFirework(0.5, 0.3);  // Center
    launchFirework(0.3, 0.4);  // Left
    launchFirework(0.7, 0.4);  // Right
    launchFirework(0.2, 0.5);  // Far left
    launchFirework(0.8, 0.5);  // Far right
}

// Auto fire fireworks - START IMMEDIATELY
let autoFireTimer;
function startAutoFire() {
    // Clear any existing timer
    if (autoFireTimer) clearInterval(autoFireTimer);
    
    // Fire at regular intervals
    autoFireTimer = setInterval(() => {
        // Random position
        const x = Math.random() * 0.8 + 0.1;
        const y = Math.random() * 0.4 + 0.2;
        launchFirework(x, y);
    }, 800); // Every 0.8 seconds - MORE FREQUENT
}

// Render everything - OPTIMIZED
function render() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Fade effect for trails - LIGHTER for faster rendering
    trailsCtx.globalCompositeOperation = 'source-over';
    trailsCtx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Darker fade
    trailsCtx.fillRect(0, 0, width, height);
    
    // Clear main canvas
    mainCtx.clearRect(0, 0, width, height);
    
    // Draw flashes
    trailsCtx.globalCompositeOperation = 'lighten';
    particles.flashes.forEach(flash => {
        const alpha = flash.life / flash.maxLife;
        const radius = flash.radius * alpha;
        
        trailsCtx.beginPath();
        trailsCtx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
        trailsCtx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.5})`;
        trailsCtx.fill();
    });
    
    // Draw stars (thick trails)
    trailsCtx.lineWidth = 3;
    trailsCtx.lineCap = 'round';
    
    particles.stars.forEach(star => {
        if (star.visible) {
            trailsCtx.strokeStyle = star.color;
            trailsCtx.beginPath();
            trailsCtx.moveTo(star.x, star.y);
            trailsCtx.lineTo(star.prevX, star.prevY);
            trailsCtx.stroke();
        }
    });
    
    // Draw sparks (thin trails)
    trailsCtx.lineWidth = 1.5;
    particles.sparks.forEach(spark => {
        trailsCtx.strokeStyle = spark.color;
        trailsCtx.beginPath();
        trailsCtx.moveTo(spark.x, spark.y);
        trailsCtx.lineTo(spark.prevX, spark.prevY);
        trailsCtx.stroke();
    });
}

// Update all particles - OPTIMIZED
function updateParticles(deltaTime) {
    // Update stars
    for (let i = particles.stars.length - 1; i >= 0; i--) {
        const star = particles.stars[i];
        if (!star.update(deltaTime)) {
            if (star.onDeath) star.onDeath();
            particles.stars.splice(i, 1);
        }
    }
    
    // Update sparks
    for (let i = particles.sparks.length - 1; i >= 0; i--) {
        if (!particles.sparks[i].update(deltaTime)) {
            particles.sparks.splice(i, 1);
        }
    }
    
    // Update flashes
    for (let i = particles.flashes.length - 1; i >= 0; i--) {
        if (!particles.flashes[i].update(deltaTime)) {
            particles.flashes.splice(i, 1);
        }
    }
}

// Animation loop - START IMMEDIATELY
let lastTime = 0;
function animate(currentTime) {
    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = Math.min(currentTime - lastTime, 32); // Cap at 30fps
    lastTime = currentTime;
    
    updateParticles(deltaTime);
    render();
    requestAnimationFrame(animate);
}

// Initialize IMMEDIATELY - NO WAITING
function init() {
    // Set canvas size
    trailsCanvas.width = mainCanvas.width = window.innerWidth;
    trailsCanvas.height = mainCanvas.height = window.innerHeight;
    
    // Handle resize
    window.addEventListener('resize', () => {
        trailsCanvas.width = mainCanvas.width = window.innerWidth;
        trailsCanvas.height = mainCanvas.height = window.innerHeight;
    });
    
    // LAUNCH FIREWORKS IMMEDIATELY - NO DELAY
    launchInitialFireworks();
    startAutoFire();
    
    // Start animation IMMEDIATELY
    animate(0);
}

// START EVERYTHING RIGHT NOW - DON'T WAIT FOR LOAD
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // Page already loaded, start immediately
    init();
}

// Also start immediately (double safety)
setTimeout(init, 10);