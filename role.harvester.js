var roleBuilder = require('role.builder');
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.working && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
            creep.say('get nrg');
	    }
	    if(!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
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
            
            let currentlyCarrying = _.findKey(creep.carry);
            
            if(targets.length > 0 && currentlyCarrying == RESOURCE_ENERGY) {
                var returnCode = creep.transfer(targets[0], currentlyCarrying);
                
                if(returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {noPathFinding: true})
                
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
            else if (creep.room.storage) { // If there is storage in the room, and if carrying something other than energy
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage, {noPathFinding: true})
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(creep.room.storage);
                    }
                }
            }
            else {
                //console.log(creep.name + " is idle. Too many harvesters?");
                creep.memory.building = true;
                roleBuilder.run(creep);
            }
            
            
	    }
	    else {
	        creep.getEnergy(true, true, true, false);
	    }
	}
};

module.exports = roleHarvester;
