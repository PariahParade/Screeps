var roleUpgrader = require('role.upgrader');

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.room.name == creep.memory.target) {
            // We're in the target room. Find the controller.
            let roomController = creep.room.controller;
            
            if (creep.reserveController(roomController) == ERR_NOT_IN_RANGE) {
                creep.moveTo(roomController, {maxRooms: 1});
                creep.say('mv controller');
            }
            else if (creep.room.name == 'E85N33') {
                console.log('claim');
                errcode = creep.claimController(roomController);
                console.log(errcode);
            }
            
            if (creep.ticksToLive <= 5) {
                let reservationEnd = Game.time + roomController.reservation.ticksToEnd;
                Game.spawns[creep.memory.sourceSpawn].memory.expansionReservationEnd = reservationEnd
            }
            
        }
        else {
            var errnum = creep.moveTo(Game.flags[creep.memory.target]);
        }
    }
};

module.exports = roleClaimer;
