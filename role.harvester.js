var roleBuilder = require('role.builder');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('get nrg');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('working');
	    }
        
        if(creep.memory.working) {
	        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER ||
                            structure.structureType == STRUCTURE_STORAGE) && structure.energy < structure.energyCapacity;
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                    creep.say('Mv ' + targets[0].structureType);
                }
            }
            else {
                console.log(creep.name + " is idle. Too many harvesters?");
                //roleBuilder.run(creep);
            }
	    }
	    else {
	        creep.getEnergy(true, true, true);
	        /*
	        else {
	            // Backup in case miners die for some reason
	            var source = creep.pos.findClosestByPath(FIND_SOURCES);
    	        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
    	            creep.moveTo(source);
    	        }
	        }
	        */
	    }
	}
};

module.exports = roleHarvester;
