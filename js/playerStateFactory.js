/**
 * Created by zhuo on 2017/6/5.
 */
/**
 * player = {
 *   dire : 1, // 1: left , 2: right.
 *   healthShow : Phaser.Group, //show hearts
 *   health : 3,
 *   weapon : '',
 *   fireBtn : Phaser.keyboard.SPACEBAR,
 *   stateContext : '',
 *   cursor : myWorld.cursor
 * }
 */

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
            this.player.animations.play('run');
            this.player.dire = 1;
        }
        FreeState.prototype.moveRight = function () {
            this.player.body.velocity.x = 150;
            this.player.animations.play('run');
            this.player.dire = 2;
        }
        FreeState.prototype.stop = function () {
            this.player.animations.stop();
            this.player.frameName = 'sprite2';
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
