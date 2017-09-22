/**
 * Created by zhuo on 2017/6/3.
 */
// var game = new Phaser.Game(800, 450, Phaser.AUTO, '', {preload: preload, create: create, update: update});
var game = new Phaser.Game(1024, 500, Phaser.AUTO);

(function () {
    game.state.add('loading',getLoadingState());
    game.state.add('game1',getStage1());
    game.state.add('game1Over',getStage1Over());
    game.state.add('game1Clear',getGame1Clear());
    game.state.start('loading');
})();