/**
 * Created by zhuo on 2017/6/6.
 */
var getLoadingState = (function () {
    function preload() {
        var text = game.add.text(game.world.centerX, game.world.centerY, "Now Loading...",{ font: "32px Courier", fill: "#00ff44" });
        text.anchor.x = 0.5;
        // game.load.atlasJSONArray('dude', 'assets/animals/animal.png', 'assets/animals/animal.json');
        game.load.atlasJSONArray('boss_skill1', 'assets/skill/boss_skill1.png', 'assets/skill/boss_skill1.json');
        game.load.spritesheet('dude','assets/dora/panghu.png',25,38,16);
        game.load.spritesheet('snake','assets/dora/daxiong.png',25,38,16);
        // game.load.spritesheet('snake','assets/animals/snake.png',135,135,16);
        game.load.image('sky', 'assets/sky.png');
        game.load.image('ground', 'assets/platform.png');
        game.load.spritesheet('rabbit', 'assets/baddie.png', 32, 32, 4);
        game.load.image('health', 'assets/firstaid.png');
        // game.load.image('diamond', 'assets/diamond.png');
        game.load.image('bullet0', 'assets/bullet0.png');
    }

    function create() {
        game.time.events.add(1500,function () {
            game.state.start('game1',true,false);
        })
    }

    return function () {
        return {
            preload: preload,
            create: create
        }
    }
})();
