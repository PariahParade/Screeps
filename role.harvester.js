var roleBuilder = require('role.builder');
var roleHarvester = {

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
                    creep.say('Mv ' + targets[0].structureType);
                }
            }
            else {
                //console.log(creep.name + "[harvester] is now building");
                roleBuilder.run(creep);
            }
	    }
	    else {
	        //Pickup any energy that might be dropped around the creep
	        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
	        if (droppedEnergy.length) {
	            console.log(creep.name + "[" + creep.memory.role + "] found " + droppedEnergy[0].energy + " energy to pick up.");
	            creep.pickup(droppedEnergy[0]);
	        }
	        
	        // Otherwide move to the nearest container and pickup energy
	        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
	           filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0 
	        });
	        if (container) {
	            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(container);
	                creep.say("hvstr nrg");
	            }
	        }
	        else {
	            var source = creep.pos.findClosestByPath(FIND_SOURCES);
    	        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
    	            creep.moveTo(source);
    	        }
	        }
	    }
        
        /*
        
	    if(creep.carry.energy < creep.carryCapacity) {
	        //Pickup any energy that might be dropped around the creep
	        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
	        if (droppedEnergy.length) {
	            console.log(creep.name + "[" + creep.memory.role + "] found " + droppedEnergy[0].energy + " energy to pick up.");
	            creep.pickup(droppedEnergy[0]);
	        }
	        
	        // Otherwide move to the nearest container and pickup energy
	        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
	           filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0 
	        });
	        if (container) {
	            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(container);
	                creep.say("hvstr nrg");
	            }
	        }
        }
        else {
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
                    creep.say('Mv ' + targets[0].structureType);
                }
            }
            else {
                //console.log(creep.name + "[harvester] is now building");
                roleBuilder.run(creep);
            }
        }
        */
	}
};

module.exports = roleHarvester;
