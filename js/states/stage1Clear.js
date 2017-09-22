/**
 * Created by zhuo on 2017/6/8.
 */
var getGame1Clear = (function () {

    function preload() {
    }

    function create() {
        var text = game.add.text(game.world.centerX, game.world.centerY, "Clear Mission 1\nClick To Next",{ font: "32px Courier", fill: "#00ff44" });
        text.anchor.x = 0.5;

        game.input.onDown.add(function () {
            game.state.start('game1');
        })
    }

    return function () {
        return {
            preload: preload,
            create: create
        }
    }
})();
