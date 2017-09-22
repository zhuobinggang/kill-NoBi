/**
 * Created by zhuo on 2017/6/6.
 */
var getStage1 = (function () {
    var myWorld = {
        player: '',
        platforms: '',
        monsters: '',
        cursor: '',
        updateTimes: 0,
        ui: {
            score: '',
            countdown: ''
        },
        loadAssets: function () {
            worldInitUtil.loadAssets();
        },
        initSprites: function () {
            //sky
            var sky = game.add.sprite(0, 0, 'sky');
            sky.scale.x = 2;

            worldInitUtil.initPlatforms();

            worldInitUtil.initPlayer();

            worldInitUtil.initMonsters();

            // worldInitUtil.initWeapon();

            playerUtil.healPlayer(9);
        },
        initControl: function () {
            this.cursor = game.input.keyboard.createCursorKeys();
            this.player.fireBtn = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
        },
        initUi: function () {
            //score
            this.ui.score = game.add.text(0, 0, "score: 0", {fontSize: '30px', fill: '#000'});
            this.ui.score.alignIn(game.camera.view, Phaser.TOP_RIGHT);
            this.ui.score.anchor.x = 0.5;

            //countdown
            //TODO: add countdown ui
        }
    }

    var entry = {
        preload: function () {
            myWorld.loadAssets();
        },
        create: function () {
            //enable physics world
            game.physics.startSystem(Phaser.Physics.ARCADE);

            myWorld.initSprites();
            myWorld.initControl();
            myWorld.initUi();
        },
        update: function () {
            game.physics.arcade.collide(myWorld.platforms, myWorld.player);
            game.physics.arcade.collide(myWorld.platforms, myWorld.monsters);
            game.physics.arcade.collide(myWorld.monsters, myWorld.player, collideCallback.monsterCrash);
            // game.physics.arcade.collide(myWorld.monsters, myWorld.player.weapon.bullets, collideCallback.hitMonster);
            CustomWeaponUtil.weaponCollide();

            playerUtil.updatePlayer();

            // monsterUtil.updateMonsters();
            monsterUtil2.updateMonsters(); //OK
            monsterUtil2.updateMonsterSpwarnLogic();

            CustomWeaponUtil.updateWeapons();

            myWorld.updateTimes++;
        },
        shutdown: function () {
            myWorld.monsters.destroy();
        },
        render: function () {
            // game.debug.spriteBounds(myWorld.player);
            // myWorld.player.weapon.bullets.forEachAlive(function (bullet) {
            //     game.debug.body(bullet);
            // },this);
            // game.debug.body();
        }
    }

    var collideCallback = {
        monsterCrash: function (player, monster) {

            playerUtil.damagePlayer(player);
        },
        hitMonster: function (monster, weapon) {
            monster.damageMe(weapon.strong);
            weapon.kill();
        },
        playerWeaponHitPlatform: function (bullet) {
            bullet.kill();
        }
    }

    var rnd = new Phaser.RandomDataGenerator();

    var CustomWeaponUtil = {
        weapons: [],
        updateWeapons: function () {
            for (var i = 0; i < this.weapons.length; i++) {
                this.weapons[i].updateMe();
            }
        },
        weaponCollide: function () {
            //player weapon
            game.physics.arcade.collide(myWorld.monsters, myWorld.player.weapon.bullets, collideCallback.hitMonster);
            game.physics.arcade.collide(myWorld.player.weapon.bullets, myWorld.platforms, collideCallback.playerWeaponHitPlatform);

            //boss weapon
            //hit monster
            for (var i = 0; i < this.weapons.length; i++) {
                this.weapons[i].bullets.forEachAlive(function (bullet) {
                        game.physics.arcade.overlap(bullet, myWorld.monsters, this.weapons[i].hitMonster)
                        game.physics.arcade.overlap(myWorld.player, bullet, this.weapons[i].hitPlayer);
                        game.physics.arcade.overlap(bullet, myWorld.platforms,this.weapons[i].hitPlatform);
                    }, this
                );
                // game.physics.arcade.overlap(this.weapons[i].bullets, myWorld.monsters, this.weapons[i].hitMonster);
                // game.physics.arcade.overlap(myWorld.player, this.weapons[i].bullets, this.weapons[i].hitPlayer);
            }
        }
    }

    var monsterUtil2 = {
        spwarnerContext: '',
        initSpwarnerAndMonsters: function () {
            this.initMonsters();

            this.initSpwarner();
        },
        initSpwarner: function () {
            this.spwarnerContext = getMonsterSpwarnerContext();
            this.spwarnerContext.setSpwarnState('mission1');
        },
        initMonsters: function () {
            myWorld.monsters = game.add.group();
            myWorld.monsters.enableBody = true;
        },
        updateMonsters: function () {
            myWorld.monsters.forEachAlive(function (monster) {
                monster.updateMe();
            }, this);
        },
        updateMonsterSpwarnLogic: function () {
            this.spwarnerContext.update();
        }
    }

    var playerUtil = {
        playerStateFactory: '',
        initPlayer: function () {
            myWorld.player = game.add.sprite(20, 0, 'dude');
            game.physics.arcade.enable(myWorld.player);
            myWorld.player.body.gravity.y = 300;
            myWorld.player.body.collideWorldBounds = true;
            // myWorld.player.scale.setTo(0.8, 0.8);
            // myWorld.player.animations.add('run', Phaser.Animation.generateFrameNames('sprite', 7, 9), 10, true);
            myWorld.player.animations.add('left', [5, 6, 7, 6], 10, true);
            myWorld.player.animations.add('right', [9, 10, 11, 10], 10, true);
            // myWorld.player.animations.add('spell', ['sprite10', 'sprite6', 'sprite15', 'sprite11'], 10, true);
            myWorld.player.animations.add('spell', [0, 4, 12, 8], 10, true);
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

            //set weapon
            this.initWeapon();
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
            //invincible time
            if (myWorld.updateTimes < player.invincibleTime) {
                return;
            }
            player.invincibleTime = myWorld.updateTimes + 80;

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

                //game over
                this.gameOver();
            }
        },
        updatePlayer: function () {
            if (!myWorld.player.alive)return;

            //update the state
            this.playerStateUpdate();

            this.playerControl();
        },
        playerControl: function () {
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
            myWorld.player.weapon = game.add.weapon(9, 'bullet0');
            myWorld.player.weapon.bullets.forEach(function (bullet) {
                bullet.scale.set(0.5);
                bullet.body.setCircle(0.5*bullet.width,17);
            },this)
            // myWorld.player.weapon.bullets.setAll('scale.x', 0.5);
            // myWorld.player.weapon.bullets.setAll('scale.y', 0.5);
            myWorld.player.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            myWorld.player.weapon.bulletSpeed = 400;
            myWorld.player.weapon.trackSprite(myWorld.player, -15);

            //数值
            // myWorld.player.weapon.bullets.setAll('strong',1);
            myWorld.player.weapon.bullets.forEach(function (bullet) {
                bullet.strong = 1;
            });
        }
        , gameOver: function () {
            game.state.start('game1Over', true, false, {score: 0});
        }
    }

    var worldInitUtil = {
        initPlayer: function () {
            playerUtil.initPlayer();
        },
        initMonsters: function () {
            monsterUtil2.initSpwarnerAndMonsters();
        },
        loadAssets: function () {

        },
        initPlatforms: function () {
            myWorld.platforms = game.add.group();
            myWorld.platforms.enableBody = true;
            var ground = myWorld.platforms.create(0, game.world.height - 70, 'ground');
            ground.scale.setTo(3, 3);
            ground.body.immovable = true;

            //add some platforms
            ground = myWorld.platforms.create(50, 300, 'ground');
            ground.body.immovable = true;
            ground = myWorld.platforms.create(game.world.width - 450, 240, 'ground');
            ground.body.immovable = true;
            ground = myWorld.platforms.create(50, 140, 'ground');
            ground.body.immovable = true;
        }
    }

    var getStateFactory = function () {

        /*******************prototype*******************/

        var PlayerState = function (name, player) {
            this.name = name;
            this.player = player;
        };
        (function () {
            PlayerState.prototype.moveLeft = function () {
                console.log(name + ': I want to move left.');
            }
            PlayerState.prototype.moveRight = function () {
                console.log(name + ': I want to move right.');
            }
            PlayerState.prototype.jump = function () {
                console.log(name + ': I want to jump.');
            }
            PlayerState.prototype.stop = function () {
                console.log(name + ': I want to stop.');
            }
            PlayerState.prototype.fire = function () {
                console.log(name + ': I want to fire.');
            }
            PlayerState.prototype.stand = function () {
                console.log(name + ': I just stand here...');
            }
            PlayerState.prototype.endState = function () {
                //DO noting...
            }
            // console.log('test');
        })();

        /*******************Implements*******************/

        /*******************free state*******************/

        var FreeState = function (name, player) {
            PlayerState.call(this, name, player);
        };
        (function initFreeState() {
            FreeState.prototype = new PlayerState();
            FreeState.prototype.moveLeft = function () {
                this.player.body.velocity.x = -150;
                this.player.animations.play('left');
                this.player.dire = 1;
            }
            FreeState.prototype.moveRight = function () {
                this.player.body.velocity.x = 150;
                this.player.animations.play('right');
                this.player.dire = 2;
            }
            FreeState.prototype.stop = function () {
                this.player.animations.stop();
                this.player.frame = 0;
            }
            FreeState.prototype.stand = function () {
                this.stop();
            }
            FreeState.prototype.fire = function () {
                if (this.player.dire == 1) {
                    this.player.weapon.fireAngle = Phaser.ANGLE_LEFT;
                } else if (this.player.dire == 2) {
                    this.player.weapon.fireAngle = Phaser.ANGLE_RIGHT;
                }
                this.player.weapon.fire();

                //change state
                SPELL_STATE.endTime = myWorld.updateTimes + 60;
                this.player.stateContext.state = SPELL_STATE;
                this.player.animations.play('spell');
            }
            FreeState.prototype.jump = function () {
                this.player.body.velocity.y = -300;
            }
            FreeState.prototype.endState = function () {
            }
        })();

        /*****************spell state*****************/

        var SpellState = function (name, player) {
            PlayerState.call(this, name, player);
            this.endTime = Number.MAX_VALUE;
        };
        (function initSpellState() {
            SpellState.prototype = new PlayerState();
            SpellState.prototype.moveLeft = function () {
                // console.log('I am in a spell time!');
            }
            SpellState.prototype.moveRight = function () {
                // console.log('I am in a spell time!');
            }
            SpellState.prototype.jump = function () {
                // console.log('I am in a spell time!');
            }
            SpellState.prototype.fire = function () {
                // console.log('I am in a spell time!');
            }
            SpellState.prototype.stand = function () {
                // console.log('I am in a spell time!');
                this.player.animations.play('spell');
            }
            SpellState.prototype.endState = function () {
                // console.log('I am in spell time...');
                if (myWorld.updateTimes > this.endTime) {
                    // FREE_STATE.isSpelling = false;
                    this.player.stateContext.state = FREE_STATE;
                }
            }
        })();

        /*******************return*******************/

        var FREE_STATE = new FreeState('freestate', myWorld.player);
        var SPELL_STATE = new SpellState('spellstate', myWorld.player);

        return function (stateName) {
            switch (stateName) {
                case 'freestate' :
                    return FREE_STATE;
                case 'spellstate':
                    return SPELL_STATE;
            }
        }
    }

    /**
     * Created by zhuo on 2017/6/6.
     */
    var getMonsterSpwarnerContext = (function () {
        /**
         * 存活一段时间之后召唤boss
         * @type {{reset: reset, update: update}}
         */
        var mission1Spwarner = {
            rabbitSpwarnTime: Number.MAX_VALUE,
            rabbitCountdown: Number.MAX_VALUE,
            bossSpwarnTime: Number.MAX_VALUE,
            bossCountdown: Number.MAX_VALUE,
            reset: function () {
                //first group monster
                for (var i = 0; i < 4; i++) {
                    // var rabbit = myWorld.monsters.create(game.world.randomX, rnd.integerInRange(320, game.world.height - 100), 'rabbit', 2);
                    var rabbit = Rabbit.rabbitSpwarnOnWorld();
                    this.initRabbit(rabbit);
                }

                //init props
                this.setRabbitCountdown(400);
                this.setBossCountdown(100);
            },
            setBossCountdown: function (countdown) {
                this.bossCountdown = countdown;
                this.bossSpwarnTime = myWorld.updateTimes + countdown;
            },
            setRabbitCountdown: function (countdown) {
                this.rabbitCountdown = countdown;
                this.rabbitSpwarnTime = myWorld.updateTimes + countdown;
            },
            update: function () {
                if (myWorld.updateTimes > this.rabbitSpwarnTime) {
                    this.initRabbit(Rabbit.rabbitSpwarnOnWorld());
                    this.updateRabbitSpwarnTime();
                }
                if (myWorld.updateTimes > this.bossSpwarnTime) {
                    this.initBoss(Snake.spwarnOnWorld());
                    this.updateBossSpwarnTime();
                    this.setRabbitCountdown(myWorld.updateTimes + 9999999);
                }
            },
            updateRabbitSpwarnTime: function () {
                var countdown = (this.rabbitCountdown > 150) ? (this.rabbitCountdown - 50) : 150
                this.setRabbitCountdown(countdown);
            },
            updateBossSpwarnTime: function () {
                // this.setBossCountdown(Number.MAX_VALUE);
                this.bossSpwarnTime = myWorld.updateTimes + 9999999;
            },
            initRabbit: function (rabbit) {
                Rabbit.initRabbitPhysic(rabbit);//OK
                Rabbit.initRabbitAni(rabbit);//OK
                Rabbit.initRabbitKillEvent(rabbit);//OK
                Rabbit.initRabbitAI(rabbit);//OK
                Rabbit.initRabbitUpdateControl(rabbit);//OK
                Rabbit.initDamageSystem(rabbit);
            },
            initBoss: function (boss) {
                Snake.initPhysic(boss);//ok
                Snake.initSnakeAni(boss);
                Snake.initSnakeKillEvent(boss);
                Snake.initSnakeStateContext(boss);
                Snake.initSnakeControlProps(boss);
                Snake.initSnakeAI(boss);
                Snake.initSnakeUpdateControl(boss);
                Snake.initDamageSystem(boss);//ok
                Snake.initSkillWeapons(boss);
            }
        }

        var Rabbit = {
            rabbitSpwarnOnWorld: function () {
                var rabbit = myWorld.monsters.create(game.world.randomX, rnd.integerInRange(320, game.world.height - 100), 'rabbit', 2);
                return rabbit;
            },
            initRabbitPhysic: function (rabbit) {
                rabbit.body.gravity.y = 300;
                rabbit.body.collideWorldBounds = true;
            },
            initRabbitAni: function (rabbit) {
                rabbit.animations.add('left', [0, 1], 10, true);
                rabbit.animations.add('right', [2, 3], 10, true);
            },
            initRabbitKillEvent: function (rabbit) {
                rabbit.events.onKilled.add(function () {
                    console.log('You kill a rabbit...');
                });
            },
            initRabbitUpdateControl: function (rabbit) {
                rabbit.updateMe = function () {
                    rabbit.body.velocity.x = 0;
                    // monsterUtil.monsterControlGenerate(monster);

                    if (rabbit.isPressLeft) {
                        rabbit.body.velocity.x = -200;
                        rabbit.animations.play('left');
                    } else if (rabbit.isPressRight) {
                        rabbit.body.velocity.x = 200;
                        rabbit.animations.play('right');
                    } else {
                        rabbit.animations.stop();
                        rabbit.frame = 2;
                    }

                    rabbit.thinkAndDo();
                }
            },
            initRabbitAI: function (rabbit) {
                this.setPropsForRabbitAI(rabbit);
                this.setLogicForRabbit(rabbit);
            },
            setPropsForRabbitAI: function (rabbit) {
                //set props for AI
                rabbit.isPressLeft = false;
                rabbit.isPressRight = false;
                rabbit.isMoving = true;
                rabbit.restTime = 0;
                rabbit.movePressTime = rnd.integerInRange(2, 6) * 20 + myWorld.updateTimes;
                rabbit.nextJumpTime = rnd.integerInRange(3, 7) * 20 + myWorld.updateTimes;

                rabbit.pressLeft = function () {
                    rabbit.isPressLeft = true;
                    rabbit.isPressRight = false;
                    rabbit.isMoving = true;
                }
                rabbit.pressRight = function () {
                    rabbit.isPressLeft = false;
                    rabbit.isPressRight = true;
                    rabbit.isMoving = true;
                }
                rabbit.pressStop = function () {
                    rabbit.isPressLeft = false;
                    rabbit.isPressRight = false;
                    rabbit.isMoving = false;
                }
                //press start
                if (rnd.integerInRange(0, 1) == 0) {
                    rabbit.pressLeft();
                } else {
                    rabbit.pressRight();
                }
            },
            setLogicForRabbit: function (rabbit) {
                //add AI logic to update
                rabbit.thinkAndDo = function () {
                    //press left & right
                    if (rabbit.isMoving) {
                        if (rabbit.movePressTime < myWorld.updateTimes) {
                            rabbit.pressStop();
                            rabbit.isMoving = false;

                            //random rest time
                            rabbit.restTime = myWorld.updateTimes + rnd.integerInRange(2, 4) * 20;
                        }
                    } else {
                        if (rabbit.restTime < myWorld.updateTimes) {
                            if (rnd.integerInRange(0, 1) == 0) {
                                rabbit.pressLeft();
                            } else {
                                rabbit.pressRight();
                            }
                            rabbit.isMoving = true;

                            //random moving time
                            rabbit.movePressTime = rnd.integerInRange(2, 6) * 20 + myWorld.updateTimes;
                        }
                    }

                    //press jump
                    if (rabbit.nextJumpTime < myWorld.updateTimes) {
                        if (rabbit.body.touching.down) {
                            rabbit.body.velocity.y = -400;
                        }
                        rabbit.nextJumpTime = rnd.integerInRange(3, 7) * 20 + myWorld.updateTimes;
                    }
                }
            },
            initDamageSystem: function (rabbit) {
                rabbit.health = 1;
                rabbit.damageMe = function (damage) {
                    rabbit.health -= damage;
                    if (rabbit.health <= 0) {
                        rabbit.kill();
                    }
                }
            }
        }

        var Snake = {
            spwarnOnWorld: function () {
                var snake = myWorld.monsters.create(game.world.width / 2, 10, 'snake', 1);
                snake.scale.set(1.2, 1.2);
                return snake;
            },
            initPhysic: function (snake) {
                snake.body.gravity.y = 300;
                snake.body.collideWorldBounds = true;
            },
            initSnakeAni: function (snake) {
                snake.animations.add('left', [5, 6, 7, 6], 10, true);
                snake.animations.add('right', [9, 10, 11, 10], 10, true);
                snake.animations.add('spell', [0, 4, 12, 8], 10, true);
            },
            initSnakeKillEvent: function (snake) {
                console.log('You kill a snake! You Win!');
            },
            initSnakeAI: function (snake) {
                snake.thinkAndDo = function () {
                    if (snake.isMoving) {
                        if (myWorld.updateTimes > snake.nextStandTime) {
                            snake.stand();
                            snake.nextMoveTime = myWorld.updateTimes + (rnd.integerInRange(6, 8) * 20);
                            snake.nextSpellTime = snake.nextMoveTime - 60;
                            snake.isMoving = false;
                        }
                    } else if (snake.isStanding) {
                        if (myWorld.updateTimes > snake.nextMoveTime) { //change to move
                            if (rnd.integerInRange(0, 1) == 0) {
                                snake.pressLeft()
                            } else {
                                snake.pressRight();
                            }
                            snake.nextStandTime = myWorld.updateTimes + (rnd.integerInRange(3, 4) * 20);
                            snake.isStanding = false;
                        }
                        //spell
                        if (myWorld.updateTimes == snake.nextSpellTime) {
                            var spellType = rnd.integerInRange(1, 10);
                            if (spellType < 4) {
                                snake.stateContext.skill1();
                            } else if (spellType < 7) {
                                snake.stateContext.skill2();
                            } else {
                                snake.stateContext.skill3();
                            }
                        }
                    }

                    // if (snake.isPressingJump && snake.body.touching.down) {
                    if (myWorld.updateTimes > snake.nextJumpTime && snake.body.touching.down) {
                        // snake.jump();
                        snake.stateContext.jump();
                        snake.nextJumpTime = myWorld.updateTimes + rnd.integerInRange(5, 10) * 20;
                    }
                }
            },
            initSkillWeapons: function (snake) {
                this.initWeapon1(snake);
                this.initWeapon2(snake);
                this.initWeapon3(snake);
            },
            initWeapon1: function (snake) {
                snake.weapon1 = {
                    bullets: game.add.group(),
                    fire: function () {
                        this.resetBullet(snake.x - 100, snake.y - 50);
                        this.resetBullet(snake.x + 100, snake.y - 50);
                        this.resetBullet(snake.x + 250, snake.y - 70);
                        this.resetBullet(snake.x - 250, snake.y - 70);
                        this.resetBullet(snake.x + 400, snake.y - 50);
                        this.resetBullet(snake.x - 400, snake.y - 50);
                    },
                    resetBullet: function (x, y) {
                        var bomb = this.bullets.getFirstDead();
                        if (!bomb)return;
                        bomb.reset(x, y);
                        bomb.lifeTime = myWorld.updateTimes + 50;
                        bomb.update = function () {
                            this.animations.play('fire');
                            if (this.lifeTime < myWorld.updateTimes) {
                                this.kill();
                            }
                        }
                    },
                    updateMe: function () {
                        this.bullets.forEachAlive(function (bullet) {
                            bullet.update();
                            // game.debug.body(bullet);
                        }, this)
                    },
                    hitMonster: function (bullet, monster) {
                        if (monster == snake) { //自己打自己？
                            return;
                        }
                        if (bullet.cooldownTime < myWorld.updateTimes) {
                            monster.damageMe(2);
                        }
                    },
                    hitPlayer: function (player, bullet) {
                        if (bullet.cooldownTime < myWorld.updateTimes) {
                            playerUtil.damagePlayer(player, 2);
                            //cool down
                            bullet.cooldownTime = myWorld.updateTimes + 30;
                        }
                    }
                }

                snake.weapon1.bullets.enableBody = true;

                //pool
                for (var i = 0; i < 10; i++) {
                    var bomb = snake.weapon1.bullets.create(0, 0, 'boss_skill1', 'dark_bomb1.png');
                    bomb.body.immovable = true;

                    bomb.animations.add('fire', Phaser.Animation.generateFrameNames('dark_bomb', 1, 3, '.png'), 10, true);

                    var scale = 0.5;
                    bomb.scale.setTo(scale, scale);
                    bomb.body.setCircle(bomb.width * scale);

                    bomb.cooldownTime = -1;

                    bomb.kill();
                }

                CustomWeaponUtil.weapons.push(snake.weapon1);
            },
            initWeapon2: function (snake) {
                snake.weapon2 = game.add.weapon(30, 'boss_skill1', 'dark_missile1.png');
                snake.weapon2.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
                snake.weapon2.speed = 600;
                snake.weapon2.fireRate = 40;
                snake.weapon2.addBulletAnimation('fire', Phaser.Animation.generateFrameNames('dark_missile', 1, 2, '.png'), 10, true);
                snake.weapon2.bullets.forEach(function (bullet) {
                    var scale = 0.5;
                    bullet.scale.setTo(scale, scale);

                    bullet.body.setCircle(bullet.width * 0.2, 85, 45);
                }, this);

                //custom props
                snake.weapon2.pressingFire = false;
                // snake.weapon2.stopFireTime = -1;
                snake.weapon2.beginFire = function (x, y) {
                    snake.weapon2.pressingFire = true;
                    // snake.weapon2.stopFireTime = myWorld.updateTimes + 100;
                    snake.weapon2.fireFrom.x = x;
                    snake.weapon2.fireFrom.y = y;
                }
                snake.weapon2.stopFire = function () {
                    snake.weapon2.pressingFire = false;
                    // snake.weapon2.stopFireTime = -1;
                }

                snake.weapon2.onFire.add(function () {
                    snake.weapon2.fireAngle += 30;
                    if (snake.weapon2.fireAngle > 350) {
                        snake.weapon2.fireAngle = 0;
                        snake.weapon2.stopFire();
                    }
                })

                CustomWeaponUtil.weapons.push(snake.weapon2);

                snake.weapon2.updateMe = function () {
                    if (snake.weapon2.pressingFire) {
                        snake.weapon2.fire();
                    }
                    snake.weapon2.bullets.forEachAlive(function (bullet) {
                        // game.debug.body(bullet);
                        // game.debug.spriteBounds(bullet);
                    }, this)
                }

                //hit
                snake.weapon2.hitPlayer = function (player, bullet) {
                    bullet.kill();
                    playerUtil.damagePlayer(player, 3);
                }
                snake.weapon2.hitMonster = function (bullet, monster) {
                    if (monster == snake)return;
                    monster.damageMe(3);
                    bullet.kill();
                }
            },
            initWeapon3: function (snake) {
                var weapon3 = game.add.weapon(30, 'boss_skill1', 'sword_exploding1.png');
                snake.weapon3 = weapon3;
                weapon3.bulletKillType = Phaser.Weapon.KILL_CAMERA_BOUNDS;
                weapon3.speed = 400;
                weapon3.fireRate = 200;
                weapon3.fireAngle = 90;
                weapon3.addBulletAnimation('fire', Phaser.Animation.generateFrameNames('sword_exploding', 1, 3, '.png'), 20, true);

                weapon3.bullets.forEach(function (bullet) {
                    bullet.scale.set(0.5);
                    bullet.body.setCircle(bullet.width * 0.5, 20, 30);
                })

                weapon3.beginFire = function () {
                    var minX = game.camera.x;
                    var maxX = minX + game.camera.width;
                    weapon3.fireFrom.x = minX + 30;
                    weapon3.fireFrom.y = 30;
                    weapon3.maxX = maxX;
                    weapon3.pressingFire = true;
                }
                weapon3.updateMe = function () {
                    if (weapon3.pressingFire) {
                        weapon3.fire();
                    }
                    weapon3.bullets.forEachAlive(function (bullet) {
                        // game.debug.body(bullet);
                    })
                }
                weapon3.onFire.add(function () {
                    weapon3.fireFrom.x += 150;
                    if (weapon3.fireFrom.x > weapon3.maxX) {
                        weapon3.pressingFire = false;
                    }
                }, this);
                weapon3.hitPlayer = function(player,bullet){
                    playerUtil.damagePlayer(player,3);
                    bullet.kill();
                }
                weapon3.hitMonster = function (bullet,monster) {
                    if(monster == snake)return;
                    monster.damageMe(3);
                    bullet.kill();
                }
                // weapon3.hitPlatform = function (bullet,platform) {
                // }

                CustomWeaponUtil.weapons.push(weapon3);
            },
            initSnakeStateContext: function (snake) {
                var getSnakeContext = (function () {
                    var freeState = {
                        reset: function () {
                        },
                        left: function () {
                            snake.animations.play('left', 10, true);
                            snake.body.velocity.x = -200;
                        },
                        stand: function () {
                            snake.animations.stop();
                            snake.frame = 1;
                        },
                        right: function () {
                            snake.animations.play('right', 10, true);
                            snake.body.velocity.x = 200;
                        },
                        jump: function () {
                            snake.body.velocity.y = -400;
                        },
                        skill1: function () {
                            // snake.weapon1
                            // console.log('I spell skill1 !');
                            // snake.weapon2.beginFire(snake.x, snake.y);
                            snake.weapon1.fire();
                            // snake.weapon3.beginFire();
                        },
                        skill2: function () {
                            // console.log('I spell skill2 !');
                            snake.weapon2.beginFire(snake.x, snake.y);
                            // snake.weapon3.beginFire();
                            // snake.weapon1.fire();
                        },
                        skill3: function () {
                            // console.log('I spell skill3 !');
                            // snake.weapon1.fire();
                            snake.weapon3.beginFire();
                            // snake.weapon2.beginFire(snake.x,snake.y);
                        }
                    }

                    return function () {
                        return {
                            state: '',
                            left: function () {
                                this.state.left();
                            },
                            right: function () {
                                this.state.right();
                            },
                            jump: function () {
                                this.state.jump();
                            },
                            skill1: function () {
                                this.state.skill1();
                            },
                            skill2: function () {
                                this.state.skill2();
                            },
                            skill3: function () {
                                this.state.skill3();
                            },
                            stand: function () {
                                this.state.stand();
                            },
                            setState: function (statename) {
                                switch (statename) {
                                    case 'freestate' :
                                        freeState.reset();
                                        this.state = freeState;
                                        break;
                                }
                            }
                        }
                    }
                })();

                snake.stateContext = getSnakeContext();
                snake.stateContext.setState('freestate');
            },
            initSnakeUpdateControl: function (snake) {
                snake.updateMe = function () {
                    snake.body.velocity.x = 0;//stop

                    if (snake.isPressingLeft) {
                        snake.stateContext.left();
                    } else if (snake.isPressingRight) {
                        snake.stateContext.right();
                    } else {
                        snake.stateContext.stand();
                    }

                    snake.thinkAndDo();
                }
            },
            initSnakeControlProps: function (snake) {
                snake.isPressingLeft = false;
                snake.isPressingRight = false;
                snake.isPressingJump = false;
                snake.isStanding = true;
                snake.isMoving = true;
                // snake.isPressingSkill1 = false;
                // snake.isPressingSkill2 = false;
                // snake.isPressingSkill3 = false;

                snake.dire = 1;//1:left,2:right
                snake.nextMoveTime = myWorld.updateTimes + 20;
                snake.nextJumpTime = myWorld.updateTimes + 30;
                snake.nextStandTime = myWorld.updateTimes + 60;

                snake.pressLeft = function () {
                    snake.isPressingLeft = true;
                    snake.isPressingRight = false;
                    snake.isMoving = true;
                    snake.isStanding = false;
                    snake.dire = 1;
                }
                snake.pressRight = function () {
                    snake.isPressingLeft = false;
                    snake.isPressingRight = true;
                    snake.isMoving = true;
                    snake.isStanding = false;
                    snake.dire = 2;
                }
                snake.stand = function () {
                    snake.isPressingLeft = false;
                    snake.isPressingRight = false;
                    snake.isMoving = false;
                    snake.isStanding = true;
                }
                snake.jump = function () {
                    snake.isPressingJump = true;
                }

                snake.pressLeft();
            },
            initDamageSystem: function (snake) {
                snake.health = 10;
                snake.damageMe = function (damege) {
                    snake.health -= damege;
                    if (snake.health <= 0) {
                        snake.kill();
                        game.state.start('game1Clear');
                    }
                }
            }
        }

        return function () {
            return {
                spwarnState: '',
                update: function () {
                    this.spwarnState.update();
                },
                setSpwarnState: function (stateName) {
                    switch (stateName) {
                        case 'mission1' :
                            mission1Spwarner.reset();
                            this.spwarnState = mission1Spwarner;
                            break;
                    }
                }
            }
        }
    })();

    return function () {
        return {
            preload: entry.preload,
            create: entry.create,
            update: entry.update,
            shutdown: entry.shutdown,
            render: entry.render
        }
    }
})();
