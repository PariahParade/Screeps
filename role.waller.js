var roleUpgrader = require('role.upgrader');
//var roleBuilder = require('role.builder');

var roleWaller = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.walling && creep.carry.energy == 0) {
            creep.memory.walling = false;
            creep.memory.wallToRepair = null;
            creep.say('gatherin');
	    }
	    if(!creep.memory.walling && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.walling = true;
	        creep.say('buildin wall');
	    }

	    if(creep.memory.walling) {
	        if (!creep.memory.wallToRepair) {
	            var walls = creep.room.find(FIND_STRUCTURES, {
	                filter: (structure) => (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 3000000
	            });
	            if (walls.length > 0) {
	                var lowestTarget = _.min(walls, 'hits');
	                //walls.sort(function(a, b){return a.hits - b.hits});
	                creep.memory.wallToRepair = lowestTarget.id;
	            }
	            else {
	                roleUpgrader.run(creep);
	            }
	        }
	        else {
	            let wall = Game.getObjectById(creep.memory.wallToRepair);
	            if (creep.repair(wall) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(wall);
	                //console.log("Wall at " + wall.pos + " is being repaired by " + creep.name + ". Hits: " + wall.hits + "/" + wall.hitsMax);
	            }
	            /*
	            var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter: (structure) => 
                        structure.structureType != STRUCTURE_RAMPART
                });
                
                if (targets.length > 0) {
                    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
                */
	        }
	    }
	    else {
	        creep.getEnergy(true, true, true, false);
	    }
	}
};

module.exports = roleWaller;
