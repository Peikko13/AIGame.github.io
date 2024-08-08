// Initialize Phaser
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let playerSpeed = 200;
let laserGroup;
let laserSpeed = 300;
let enemyGroup;
let emitter;
let score = 0;
let scoreText;
let lives = 3;
let livesText;
let laserSound;
let enemydestroyedSound;
let playerSound;
let healthGroup;

function preload() {
  this.load.image('player', 'assets/player.png'); // Load player image
  this.load.image('laser', 'assets/laser.png'); // Load laser image
  this.load.image('enemy', 'assets/enemy.png'); // Load enemy image
  this.load.image('star', 'assets/star.png'); // Load star image
  this.load.image('health', 'assets/healthpack.png'); // Load health pack image
  this.load.audio('laserSound', 'assets/sounds/laser_player.ogg'); // Load laser sound
  this.load.audio('enemydestroyedSound', 'assets/sounds/enemy_destroyed.ogg');// Load enemy sound
  this.load.audio('playerSound', 'assets/sounds/player_destroyed.ogg');
  this.load.atlas('explosion', 'assets/explosion.png', 'assets/explosion.json');
}

function create() {
  this.add.particles(0, 0, 'star', {
    x: { min: 0, max: 600 },
    y: { min: 0, max: 800 },
    frequency: 100,
    lifespan: 10000,
    speedY: { min: 100, max: 300 },
    scale: { min: 0.4, max: 0.6 },
    alpha: { min: 0.4, max: 0.6 },
    advance: 5000
  });
  player = this.physics.add.sprite(100, 450, 'player'); // Create player sprite
  player.setBounce(0.2); // Add bounce to the player
  player.setCollideWorldBounds(true); // Set world bounds for the player

  laserGroup = new LaserGroup(this); // Create laser group
  enemyGroup = new EnemyGroup(this); // Create enemy group
  healthGroup = new HealthGroup(this); // Create health pack group
  enemyGroup.getChildren().forEach(enemy => move(enemy, this));
  healthGroup.getChildren().forEach(health => moveHealth(health, this));

  emitter = this.add.particles(0, 0, 'explosion',
                              {
                                frame: ['red', 'yellow', 'blue', 'green', 'purple', 'orange', 'rose'],
                                lifespan: 1000,
                                speed: { min: 50, max: 100 },
                                emitting: false
                              });
  
  this.physics.add.overlap(enemyGroup, laserGroup, (enemy, laser) => {
    laserCollision(enemy, laser, this);
  });
  this.physics.add.overlap(player, enemyGroup, (player, enemy) => {
    playerEnemyCollision(player, enemy, this);
  });
  this.physics.add.overlap(player, healthGroup, (player, health) => {
    playerHealthCollision(player, health, this);
  });
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });
  livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#fff' });
  
  laserSound = this.sound.add('laserSound');
  enemydestroyedSound = this.sound.add('enemydestroyedSound');
  playerSound = this.sound.add('playerSound');
}

function update() {
  const cursors = this.input.keyboard.createCursorKeys();
  if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  } 
  else if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else {
    player.setVelocityX(0);
  }
  if (cursors.space.isDown && Phaser.Input.Keyboard.JustDown(cursors.space)&& lives > 0) {
    laserSound.play();
  fireLaser(laserGroup, player);
  }
  checkAndDeactivateOutOfBoundsLasers(laserGroup, this);
  checkAndDeactivateOutOfBoundsEnemies(enemyGroup, this);
  checkAndDeactivateOutOfBoundsHealthpack(healthGroup, this);
}

function laserCollision(enemy, laser, scene) {
  enemydestroyedSound.play();
  emitter.explode(40, laser.x, laser.y)
  laser.setActive(false);
  laser.setVisible(false);
  laser.disableBody(true, true);
  move(enemy, scene);
  score += 10;
  scoreText.setText(`Score: ${score}`);
}

    function playerEnemyCollision(player, enemy, scene) {
      playerSound.play();
      lives--;
      livesText.setText(`Lives: ${lives}`);
      enemyGroup.getChildren().forEach(enemy => move(enemy, scene));
      if (lives <= 0){
        gameOverText = scene.add.text(200, 300, 'Game Over', { fontSize: '64px', fill: '#fff' });
        player.setActive(false);
        player.setVisible(false);
        player.disableBody(true, true);
  }
}

function playerHealthCollision(player, health, scene) {
  moveHealth(health, scene);
  playerSound.play();
  lives++;
  livesText.setText(`Lives: ${lives}`);
}