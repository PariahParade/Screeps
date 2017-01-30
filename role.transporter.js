var roleTransporter = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.fullEnergy && creep.carry.energy == 0) {
            creep.memory.fullEnergy = false;
            creep.say('need nrg');
	    }
	    if(!(creep.memory.fullEnergy) && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.fullEnergy = true;
	        creep.memory.atDropOffArea = false;
	        creep.memory.targetContainer = null;
	        creep.memory.storageArea = JSON.stringify(Game.flags.StorageArea.pos);
	        creep.say('fullEnergy');
	    }

        if(creep.memory.fullEnergy) {
            var depositTargets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE);
                }
            });

            //if(creep.room.storage.store[RESOURCE_ENERGY] == 0) {
               // replenish the storage!
            //}

            if (depositTargets.length){
                //console.log("transporter deposit target: " + depositTargets[0]);
               // console.log(JSON.stringify(depositTargets));
                if (creep.transfer(depositTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(depositTargets[0]);
                }
            }

            /*
            if (creep.memory.atDropOffArea = false) {
                creep.MoveTo(Game.flags.StorageArea);
            }

            if (creep.memory.atDropOffArea = true) {
                // We've arrived! Find the nearest most empty vessel. Storage > Container
                var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE
                        || structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] < structure.energyCapacity);
                }
                });

                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                        creep.say('Mv ' + targets[0].structureType);
                    }
                }
            }

            */

	    }
	    // Need to pick up energy
	    else {
	        //Pickup any energy that might be dropped around the creep
	        var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 3);
	        if (droppedEnergy.length > 0) {
	            
	            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
	                //console.log(creep.name + " tryin to get dropped energy");
	                creep.moveTo(droppedEnergy[0]);
	            }
	            else {
	                creep.moveTo(droppedEnergy);
	                console.log(creep.name + "[" + creep.memory.role + "] found " + droppedEnergy[0].energy + " energy to pick up.");
	            }
	        }

	        // Otherwise move to the most full container and pickup energy
	        // If creep has no container in memory, grab one
	        if (!creep.memory.targetContainer) {
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
	                //console.log(creep.name + "[transporter] moving to container");
	                creep.moveTo(Game.getObjectById(creep.memory.targetContainer));
	            }
	        }
	    }
	}
};

module.exports = roleTransporter;
