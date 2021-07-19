var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 550,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('star', 'assets/star.png');
  this.load.image('bomb', 'assets/bomb.png');
  this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
  // define background
  this.add.image(400, 300, 'sky');

  // make ground
  platforms = this.physics.add.staticGroup();

  
  // set scale to game
  platforms.create(400, 550, 'ground').setScale(2).refreshBody();

  // ledges
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // player definition
  player = this.physics.add.sprite(200, 350, 'dude');

  // player physics
  player.setBounce(0.3);
  player.setCollideWorldBounds(true);

  // player animations, turning, walking left and walking right.
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // input events
  cursors = this.input.keyboard.createCursorKeys();

  // stars to collect = 12 total, evenly spaced = 70 pixels apart x axis
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x: 10, y: 0, stepX: 70 }
  });

  stars.children.iterate(function (child) {

  // give each star a different bounce
  child.setBounceY(Phaser.Math.FloatBetween(0.8, 0.3));
});

  bombs = this.physics.add.group();

  // score text
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '40px', fill: 'white' });

  // collide player, stars, platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  // this checks to see if the player overlaps with any of the stars, if he does call the collectStar function
  this.physics.add.overlap(player, stars, collectStar, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update ()
{
  if (gameOver)
  {
    return;
  }

  if (cursors.left.isDown)
  {
    player.setVelocityX(-160);

    player.anims.play('left', true);
  }
  else if (cursors.right.isDown)
  {
    player.setVelocityX(160);

    player.anims.play('right', true);
  }
  else
  {
    player.setVelocityX(0);

    player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down)
  {
    player.setVelocityY(-330);
  }
}

function collectStar (player, star)
{
  star.disableBody(true, true);

  // calulate score 
  score += 5;
  scoreText.setText('score: ' + score);

  if (stars.countActive(true) === 0)
  {
    //  create new batch of stars to collect
    stars.children.iterate(function (child) {

      child.enableBody(true, child.x, 0, true, true);

    });

    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb (player, bomb)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}