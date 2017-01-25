var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // If we're at home, we need to move to our target room.
        if (creep.room.name == creep.memory.home) {
            if (!creep.memory.exit) {
                creep.memory.exit = creep.room.findExitTo(creep.memory.target);
            } else {
                creep.moveTo(creep.pos.findClosestByRange(creep.memory.exit));
                creep.say("mv to room");
            }
        }
        else {
            // We're in the target room. Find the controller.
            let roomController = creep.room.controller;
            console.log(roomController);
            if (creep.reserveController(roomController) == ERR_NOT_IN_RANGE) {
                creep.moveTo(roomController);
                creep.say('mv controller');
            }
        }
    }
};

module.exports = roleClaimer;
