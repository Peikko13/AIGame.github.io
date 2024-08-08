class EnemyGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.createMultiple({
      key: 'enemy',
      frameQuantity: 30,
      active: false,
      visible: false,
    });
  }
}

function move(enemy, scene) {
  enemy.setActive(true);
  enemy.setVisible(true);
  enemy.body.enable = true;
  enemy.setPosition(Phaser.Math.Between(0, scene.game.config.width), 0);
  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  enemy.setVelocityX(Math.random() * 200 * randomDirection);
  enemy.setVelocityY(Math.random() * 200);
}

function checkAndDeactivateOutOfBoundsEnemies(enemyGroup, scene) {
  enemyGroup.getChildren().forEach(enemy => {
    if (enemy.y < 0 || enemy.y > scene.game.config.height || enemy.x > scene.game.config.width || enemy.x < 0) {
      move(enemy, scene);
    }
  });
}