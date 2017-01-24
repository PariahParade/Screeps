var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('need nrg');
        }
        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('working');
        }

        if (creep.memory.working) {
            if (creep.room.name == creep.memory.home) {
                if (!creep.memory.exit) {
                    creep.memory.exit = creep.room.findExitTo(creep.memory.target);
                } else {
                    creep.moveTo(creep.pos.findClosestByRange(exit));
                }
            }
        }
        // Not working--Need Energy
        else {
            if (creep.room.name == creep.memory.target) {

            } else {
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
    }
};

module.exports = roleClaimer;
