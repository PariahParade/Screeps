var roleScout = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.memory.scouting && creep.carry.energy == 0) {
            creep.memory.scouting = false;
            creep.say('need nrg');
        }
        if (!creep.memory.scouting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.scouting = true;
            creep.say('scouting');
        }

        if (creep.memory.scouting) {
            if (creep.room.name == creep.memory.home) {
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));

            } else {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say('going home');
            }
        }
        // Not scouting--Need Energy
        else {
            if (creep.room.name == creep.memory.target) {
                var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target) {
                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            } else {
                var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
            }
        }
    }
};

module.exports = roleScout;
