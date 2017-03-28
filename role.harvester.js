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
	        var targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {noPathFinding: true})
                
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
            else if (creep.room.storage) { // If there is storage in the room
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                    creep.say('Mv storage');
                }
            }
            else {
                //console.log(creep.name + " is idle. Too many harvesters?");
                creep.memory.building = true;
                roleBuilder.run(creep);
            }
            
            
	    }
	    else {
	        creep.getEnergy(true, false, true, false);
	    }
	}
};

module.exports = roleHarvester;
