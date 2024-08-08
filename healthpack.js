class HealthGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.createMultiple({
      key: 'health',
      frameQuantity: 1,
      active: false,
      visible: false,
    });
  }
}

function moveHealth(health, scene) {
  health.setActive(true);
  health.setVisible(true);
  health.body.enable = true;
  health.setPosition(Phaser.Math.Between(0, scene.game.config.width), 0);
  health.setVelocityY(Phaser.Math.Between(100, 200));
}

function checkAndDeactivateOutOfBoundsHealthpack(healthGroup, scene) {
  healthGroup.getChildren().forEach(health => {
    if (health.y < 0 || health.y > scene.game.config.height) {
      moveHealth(health, scene);
    }
  });
}