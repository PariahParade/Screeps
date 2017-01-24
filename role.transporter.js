var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.fullEnergy && creep.carry.energy == 0) {
            creep.memory.fullEnergy = false;
            creep.say('need nrg');
	    }
	    if(!(creep.memory.fullEnergy) && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.fullEnergy = true;
	        creep.memory.dropOffArea = false;
	        creep.memory.targetContainer = null;
	        creep.memory.storageArea = JSON.stringify(Game.flags.StorageArea.pos);
	        creep.say('fullEnergy');
	    }

        if(creep.memory.fullEnergy) {
            // We have full energy now, so lets move to storage area flag
            
            console.log("flag: " + creep.memory.storageArea);
            console.log("creep: " + JSON.stringify(creep.pos));
            if (JSON.stringify(creep.pos) == creep.memory.storageArea && creep.memory.dropOffArea) {
                console.log("testerson");
                creep.moveTo(creep.memory.storageArea);
                creep.say("mv StorageArea");
            }
            // We've arrived! Find the nearest most empty vessel. Storage > Container
            else {
                creep.memory.dropOffArea = true;

                var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE ||
                            structure.structureType == STRUCTURE_CONTAINER) && structure.energy < structure.energyCapacity;
                }
                });
                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                        creep.say('Mv ' + targets[0].structureType);
                    }
                }

            }
	    }
	    // Need to pick up energy
	    else {
	        //Pickup any energy that might be dropped around the creep
	        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 3);
	        if (droppedEnergy.length > 0) {
	            console.log("found dropped");
	            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(droppedEnergy);
	            }
	            else {
	                console.log(creep.name + "[" + creep.memory.role + "] found " + droppedEnergy[0].energy + " energy to pick up.");
	            }
	        }

	        // Otherwise move to the most full container and pickup energy
	        // If creep has no container in memory, grab one
	        //console.log("test");
	        if (!creep.memory.targetContainer) {
	            console.log("In memory");
	            // Find all containers in the room.
	            var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
                });
                if (containers.length > 0) {
                    // Sort the containers in Descending order so that [0] is the fullest one.
                    containers.sort(function(a, b){return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]});
                    creep.memory.targetContainer = containers[0].id;
                }
	        }
	        // We have a container in memory. Go to it.
	        else {
	            if (creep.withdraw(Game.getObjectById(creep.memory.targetContainer), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                console.log("in move");
	                creep.moveTo(Game.getObjectById(creep.memory.targetContainer));
	                creep.say("get nrg");
	            }
	        }
	    }
	}
};

module.exports = roleTransporter;
