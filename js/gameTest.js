/**
 * Created by zhuo on 2017/6/3.
 */
var game = new Phaser.Game(800, 500, Phaser.AUTO, '', {preload: preload, create: create, update: update});

function preload() {
    // game.load.spritesheet('dude', 'assets/dude.png', 192, 192, 23);
    // game.load.spritesheet('dude', 'assets/animals', 192, 192, 23);
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.atlasJSONArray('dude','assets/animals/animal.png','assets/animals/animal.json');
    // game.load.image('dude','assets/animals/02.png');
}
var player;
var platform;
var cursor;
function create() {
    //enable physics world
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //
    //sky
    game.add.sprite(0, 0, 'sky');
    //
    // //platform
    platform = game.add.group();
    platform.enableBody = true;
    var ground = platform.create(0, game.world.height - 70, 'ground');
    ground.scale.setTo(2, 1);
    ground.body.immovable = true;

    //spwarn player
    player = game.add.sprite(20, 0, 'dude');
    player.frameName = 'sprite2';
    game.physics.arcade.enable(player);
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    // player.scale.setTo(0.4,0.4);

    // player.animations.add('run', [4, 5, 6, 7], 10, true);

    // test
    var test = player.animations.add('test');
    test.play(10,true);

    //control
    // cursor = game.input.keyboard.createCursorKeys();
}
function update() {
    var crashWall = game.physics.arcade.collide(platform, player);
    // player.body.velocity.x = 0;
    //
    // if (cursor.left.isDown) {
    //     player.body.velocity.x = -150;
    //     player.animations.play('run');
    // } else if (cursor.right.isDown) {
    //     player.body.velocity.x = 150;
    //     player.animations.play('run');
    // }
    // else {
    //     player.animations.stop();
    //     // player.animations.play('test');
    //     player.frame = 0;
    // }
    //
    // if (cursor.up.isDown && player.body.touching.down) {
    //     player.body.velocity.y = -300;
    // }
}
/**
 * Created by zhuo on 2017/6/4.
 */
