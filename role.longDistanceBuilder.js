var roleLongDistanceHarvester = require('role.longDistanceHarvester');

var roleLongDistanceBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('need nrg');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('working');
	    }
        
        if(creep.memory.working) {
            // If we're in the target room, get building!
            if (creep.room.name == creep.memory.target) {
                var spawnInQueue = false;
                var spawn;
	            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length) {
                    for (let target in targets) {
                        if (target.structureType == STRUCTURE_SPAWN) {
                            spawnInQueue = true;
                            spawn = target;
                        }
                    }
                    console.log(spawninQueue);
                    if (spawnInQueue) {
                        if(creep.build(spawn) == ERR_NOT_IN_RANGE) {
                            console.log('moving to spawn to build');
                            creep.moveTo(spawn);
                        }
                    }
                    else {
                        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                        }
                    }
                    
                }
                else {
                   //console.log("Nothing to build so " + creep.name + " is becoming a longDistanceHarvester");
                    //roleLongDistanceHarvester.run(creep);
                }
	        }
	        else {
	            var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say("chg rooms");
	        }
        }
        // Not working--Need Energy
	    else {
	        if (creep.room.name == creep.memory.home) {
	            creep.getEnergy(true, true, false);
	        }
	        else {
	            var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say("need nrg");
	        }
	    }
	}
};

module.exports = roleLongDistanceBuilder;
