/**
 * Created by zhuo on 2017/6/5.
 */
//region Utils
var rnd = new Phaser.RandomDataGenerator();

var monsterUtil = {
    monsterKilledNum : 0,
    monsterSpwarner: {
        spwarnTime: Number.MAX_VALUE,
        spwarnDelay: 400,
        spwarn: '',
        spwarnUpdate: ''
    },
    initMonsters: function () {
        myWorld.monsters = game.add.group();
        myWorld.monsters.enableBody = true;

        for(var i=0;i<4;i++){
            this.rabbitMonsterInit(
                myWorld.monsters.create(game.world.randomX,rnd.integerInRange(250,game.world.height-90),'monster',2)
            )
        }

        this.monsterKilledNum = 0;
    },
    initRabbitSpwarner: function () {
        var me = this;
        this.monsterSpwarner.spwarnTime = myWorld.updateTimes + this.monsterSpwarner.spwarnDelay;
        this.monsterSpwarner.spwarn = function () {
            var monster = myWorld.monsters.create(game.world.randomX, rnd.integerInRange(250,game.world.height-90), 'monster', 2);
            me.rabbitMonsterInit(monster);
        }
        this.monsterSpwarner.spwarnUpdate = function () {
            if (myWorld.updateTimes > me.monsterSpwarner.spwarnTime) {
                me.monsterSpwarner.spwarnTime = myWorld.updateTimes + me.monsterSpwarner.spwarnDelay;
                me.monsterSpwarner.spwarn();
                if (me.monsterSpwarner.spwarnDelay > 120) {
                    me.monsterSpwarner.spwarnDelay -= 50;
                }
            }
        }
    },
    //init monster divide
    rabbitMonsterInit: function (monster) {
        //monster kill event
        monster.events.onKilled.add(function () {
            monsterUtil.monsterKilledNum ++;
            myWorld.ui.score.text = 'score: '+monsterUtil.monsterKilledNum;
        });

        //monster animation init
        monster.body.gravity.y = 300;
        monster.body.collideWorldBounds = true;
        monster.animations.add('left', [0, 1], 10, true);
        monster.animations.add('right', [2, 3], 10, true);

        //monster AI init
        monster.isPressLeft = false;
        monster.isPressRight = false;
        monster.isMoving = true;
        monster.restTime = 0;
        monster.movePressTime = rnd.integerInRange(2, 6) * 20 + myWorld.updateTimes;
        monster.nextJumpTime = rnd.integerInRange(3, 7) * 20 + myWorld.updateTimes;

        monster.pressLeft = function () {
            monster.isPressLeft = true;
            monster.isPressRight = false;
            monster.isMoving = true;
        }
        monster.pressRight = function () {
            monster.isPressLeft = false;
            monster.isPressRight = true;
            monster.isMoving = true;
        }
        monster.pressStop = function () {
            monster.isPressLeft = false;
            monster.isPressRight = false;
            monster.isMoving = false;
        }

        //press start
        if (rnd.integerInRange(0, 1) == 0) {
            monster.pressLeft();
        } else {
            monster.pressRight();
        }
    },
    //update monster divide
    monsterUpdate: function (monster) {
        monster.body.velocity.x = 0;
        monsterUtil.monsterControlGenerate(monster);

        if (monster.isPressLeft) {
            monster.body.velocity.x = -200;
            monster.animations.play('left');
        } else if (monster.isPressRight) {
            monster.body.velocity.x = 200;
            monster.animations.play('right');
        } else {
            monster.animations.stop();
            monster.frame = 2;
        }

    },
    updateMonsters: function () {
        myWorld.monsters.forEach(monsterUtil.monsterUpdate);

        this.monsterSpwarner.spwarnUpdate();
    },
    monsterControlGenerate: function (monster) {
        //press left & right
        if (monster.isMoving) {
            if (monster.movePressTime < myWorld.updateTimes) {
                monster.pressStop();
                monster.isMoving = false;

                //random rest time
                monster.restTime = myWorld.updateTimes + rnd.integerInRange(2, 4) * 20;
            }
        } else {
            if (monster.restTime < myWorld.updateTimes) {
                if (rnd.integerInRange(0, 1) == 0) {
                    monster.pressLeft();
                } else {
                    monster.pressRight();
                }
                monster.isMoving = true;

                //random moving time
                monster.movePressTime = rnd.integerInRange(2, 6) * 20 + myWorld.updateTimes;
            }
        }

        //press jump
        if (monster.nextJumpTime < myWorld.updateTimes) {
            if (monster.body.touching.down) {
                monster.body.velocity.y = -400;
            }
            monster.nextJumpTime = rnd.integerInRange(3, 7) * 20 + myWorld.updateTimes;
        }
    }
}

var playerUtil = {
    playerStateFactory: '',
    initPlayer: function () {
        myWorld.player = game.add.sprite(20, 0, 'dude');
        game.physics.arcade.enable(myWorld.player);
        myWorld.player.body.gravity.y = 300;
        myWorld.player.body.collideWorldBounds = true;
        myWorld.player.scale.setTo(0.5, 0.5);
        myWorld.player.animations.add('run', Phaser.Animation.generateFrameNames('sprite', 7, 9), 10, true);
        myWorld.player.animations.add('spell', ['sprite10', 'sprite6', 'sprite15', 'sprite11'], 10, true);
        myWorld.player.dire = 1;//1:left,2:right

        //set the cursor for player
        myWorld.player.cursor = myWorld.cursor;

        this.playerStateFactory = getStateFactory();

        //set states
        myWorld.player.stateContext = {
            state: playerUtil.playerStateFactory('freestate'),
            stand: function () {
                this.state.stand();
            },
            moveLeft: function () {
                this.state.moveLeft();
            },
            moveRight: function () {
                this.state.moveRight();
            },
            jump: function () {
                this.state.jump();
                // this.state = playerUtil.playerStateFactory('freestate');
            },
            fire: function () {
                this.state.fire();
            },
            stop: function () {
                this.state.stop();
            },
            endState: function () {
                this.state.endState();
            }
        }
    },
    playerStateUpdate: function () {
        myWorld.player.stateContext.state.endState();
    },
    healPlayer: function (healthNum) {

        myWorld.player.health = healthNum;

        var health = game.add.group();
        var heart = health.create(10, 10, 'health');
        heart.scale.setTo(0.5, 0.5);
        for (var i = 1; i < healthNum; i++) {
            heart = health.create(0, 0, 'health').alignTo(heart, Phaser.RIGHT_TOP, 10);
            heart.scale.setTo(0.5, 0.5);
        }

        if (!myWorld.player.exists) {
            myWorld.player.reset(100, 0);
        }
        myWorld.player.healthShow = health;
    },
    damagePlayer: function (player, damage) {
        if (!damage) {
            damage = 1;
        }
        while (damage-- > 0 && player.health > 0) {
            var top = player.healthShow.getTop();
            // top.kill();
            top.destroy();
            top = null;
            player.health--;
        }
        if (player.health <= 0) {
            player.kill();
            player.healthShow.destroy();
        }
    },
    updatePlayer: function () {
        if (!myWorld.player.alive)return;

        //update the state
        this.playerStateUpdate();

        this.playerControl();
    },
    playerControl : function () {
        //reset player speed
        myWorld.player.body.velocity.x = 0;


        //control
        if (myWorld.cursor.left.isDown) {
            myWorld.player.stateContext.moveLeft();
        } else if (myWorld.cursor.right.isDown) {
            myWorld.player.stateContext.moveRight();
        } else {
            //play stand animation
            myWorld.player.stateContext.stand();
        }

        //jump
        if (myWorld.cursor.up.isDown && myWorld.player.body.touching.down) {
            myWorld.player.stateContext.jump();
        }

        //fire
        if (myWorld.player.fireBtn.isDown) {
            myWorld.player.stateContext.fire();
        }
    },
    initWeapon: function () {
        myWorld.player.weapon = game.add.weapon(1, 'bullet0');
        myWorld.player.weapon.bullets.setAll('scale.x',0.5);
        myWorld.player.weapon.bullets.setAll('scale.y',0.5);
        myWorld.player.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        myWorld.player.weapon.bulletSpeed = 400;
        myWorld.player.weapon.trackSprite(myWorld.player, 0, 0);
    }
}

var worldInitUtil = {
    initPlayer: function () {
        playerUtil.initPlayer();
    },
    initMonsters: function () {
        monsterUtil.initMonsters();
        monsterUtil.initRabbitSpwarner();
    },
    initWeapon: function () {
        playerUtil.initWeapon();
    },
    loadAssets: function () {
        game.load.atlasJSONArray('dude', 'assets/animals/animal.png', 'assets/animals/animal.json');
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.spritesheet('monster', 'assets/baddie.png', 32, 32, 4);
        game.load.image('health', 'assets/firstaid.png');
        // game.load.image('diamond', 'assets/diamond.png');
        game.load.image('bullet0', 'assets/bullet0.png');
    },
    initPlatforms: function () {
        myWorld.platforms = game.add.group();
        myWorld.platforms.enableBody = true;
        var ground = myWorld.platforms.create(0, game.world.height - 70, 'ground');
        ground.scale.setTo(2, 3);
        ground.body.immovable = true;

        //add some platforms
        ground = myWorld.platforms.create(-50, 240, 'ground');
        ground.body.immovable = true;
        ground = myWorld.platforms.create(game.world.width - 300, 150, 'ground');
        ground.body.immovable = true;
    }
}
