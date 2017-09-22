/**
 * Created by zhuo on 2017/6/6.
 */
var getStage1Over = (function () {
    var score = 0;

    function preload() {
    }

    function create() {
        var text = game.add.text(game.world.centerX, game.world.centerY, "Game Over!\nScore: "+score+"\nClick to restart", {
            align : 'center',
            font: "32px Courier",
            fill: "#A52A2A"
        });
        text.anchor.x = 0.5;
        text.anchor.y = 0.5;

        game.input.onDown.add(function () {
            game.state.start('game1');
        })
    }



    return function () {
        return {
            init : function (msg) {
                if(msg){
                    score = msg.score;
                }
            },
            preload: preload,
            create: create
        }
    }
})();
