/**
 * Created by zhuo on 2017/6/6.
 */
var getMonsterSpwarnerContext = (function () {
    /**
     * 存活一段时间之后召唤boss
     * @type {{reset: reset, update: update}}
     */
    var mission1Spwarner = {
        reset : function () {
            for(var i=0;i<4;i++){
                var rabbit = game.add.sprite(game.world.randomX,rnd.integerInRange(320,game.world.height-100),'rabbit',2);
                this.initRabbit(rabbit);
            }
        },
        update : function () {
            //TODO: 关卡1生怪
        },
        initRabbit: function (rabbit) {

        }
    }

    return function () {
        return {
            spwarnState : '',
            update: function () {
                this.spwarnState.update();
            },
            setSpwarnState: function (stateName) {
                switch (stateName){
                    case 'mission1' :
                        mission1Spwarner.reset();
                        this.spwarnState = mission1Spwarner;
                        break;
                }
            }
        }
    }
})();
