var roleLongDistanceHarvester = {

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
            if (creep.room.name == creep.memory.home) {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_CONTAINER ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                        creep.say('LD mv ' + targets[0].structureType);
                    }
                }
            }
            else {
                var exit = creep.room.findExitTo(creep.memory.home);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say("going home");
            }
        }
        // Not working--Need Energy
	    else {
	        if (creep.room.name == creep.memory.target) {
	            var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceId];
    	        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
    	            creep.moveTo(source);
    	            creep.say("mv target");
    	        }
	        }
	        else {
	            var exit = creep.room.findExitTo(creep.memory.target);
                creep.moveTo(creep.pos.findClosestByRange(exit));
                creep.say("chg rooms");
	        }
	    }
	}
};

module.exports = roleLongDistanceHarvester;
