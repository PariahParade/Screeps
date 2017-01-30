var roleUpgrader = require('role.upgrader');

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
	        //console.log(creep.name + " is repairing");
	    }

	    if(creep.memory.walling) {
	        if (!creep.memory.wallToRepair) {
	            var walls = creep.room.find(FIND_STRUCTURES, {
	                filter: (structure) => structure.structureType == STRUCTURE_WALL && structure.hits < 100000
	            });
	            if (walls.length > 0) {
	                walls.sort(function(a, b){return a.hits - b.hits});
	                creep.memory.wallToRepair = walls[0].id;
	            }
	            else {
	                //console.log(creep.name + "has no walls to repair up; upgrading");
	                roleUpgrader.run(creep);
	            }
	        }
	        else {
	            let wall = Game.getObjectById(creep.memory.wallToRepair);
	            if (creep.repair(wall) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(wall);
	                console.log("Wall at " + wall.pos + " is being repaired by " + creep.name + ". Hits: " + wall.hits + "/" + wall.hitsMax);
	            }
	        }
	        /*
	        var walls = creep.room.find(FIND_STRUCTURES, {
	            filter: (structure) => structure.structureType == STRUCTURE_WALL
	        });
	        
            if(walls) {
                walls.sort(function(a, b){return a.hits - b.hits});
                if (creep.repair(walls[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(walls[0]);
                    creep.say(walls[0].hits)
                }
            }
            */
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
	           filter: structure => ((structure.structureType == STRUCTURE_STORAGE  
                                    || structure.structureType == STRUCTURE_CONTAINER)
	                                && structure.store[RESOURCE_ENERGY] > 200) 
	        });

	        if (container) {
	            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(container);
	                creep.say("wall nrg");
	            }
	        }
	    }
	}
};

module.exports = roleWaller;
