var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // If we're at home, we need to move to our target room.
        if (creep.room.name == creep.memory.home) {
            // Find the exit that leads closer to our target
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
            if (creep.reserveController(roomController) == ERR_NOT_IN_RANGE) {
                creep.moveTo(roomController);
                creep.say('mv controller');
            }
            // Claim if we can
            else {
                try {
                    creep.claimController(roomController)    
                }
                catch (err){
                    
                }
                
            }
        }
    }
};

module.exports = roleClaimer;
