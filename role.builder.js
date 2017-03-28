var roleUpgrader = require('role.upgrader');
var roleWaller = require('role.waller');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
	        
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);//, {
            
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {maxRooms: 1});
                }
            }
            else {
                //creep.say('upgrader');
                roleUpgrader.run(creep);
            }
            
	    }
	    else {
	        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE ||
                            structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] > 50);
                }
            });
	        if (targets.length > 0){
	            creep.getEnergy(true, true, false, false);
	        }
	        else {
	            creep.getEnergy(true, true, true, false);
	        }
	        
	    }
	}
};

module.exports = roleBuilder;
