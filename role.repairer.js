var roleBuilder = require('role.builder');

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('repairing');
	        //console.log(creep.name + " is repairing");
	    }

	    if(creep.memory.repairing) {
	        var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
                });
            if(closestDamagedStructure) {
                if (creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDamagedStructure);
                }
            }
            else {
                //creep.say("->Builder");
                roleBuilder.run(creep);
            }
	    }
	    else {
	        //Pickup any energy that might be dropped around the creep
	        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
	        if (droppedEnergy.length) {
	            console.log(creep.name + "found " + droppedEnergy[0].energy + " energy to pick up.");
	            creep.pickup(droppedEnergy[0]);
	        }
	        
	        // Otherwide move to the nearest container and pickup energy
	        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
	           filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0 
	        });
	        if (container) {
	            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(container);
	                creep.say("pickup nrg");
	            }
	        }
	    }
	}
};

module.exports = roleRepairer;
