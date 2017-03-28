var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.fullEnergy && creep.carry.energy == 0) {
            creep.memory.fullEnergy = false;
            creep.memory.targetContainer = '';
            creep.say('need nrg');
	    }
	    if(!(creep.memory.fullEnergy) && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.fullEnergy = true;
	        creep.say('fullEnergy');
	    }

        if(creep.memory.fullEnergy) {
            var towerTargets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_TOWER) && structure.energy < (TOWER_CAPACITY * 0.75)
                    );
                }
            });
            
            if (towerTargets.length > 0) {
                if (creep.transfer(towerTargets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(towerTargets[0], {noPathFinding: true});
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(towerTargets[0]);
                    }
                    creep.say('fill twr');
                }
            }
            else {
                var targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
                    }
                });
                if (targets.length > 0) {
                    if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(targets[0], {reusePath: 10});
                        }
                        creep.say('fill nrg');
                    }
                }
                else if (creep.room.terminal && Game.rooms[creep.room.name].terminal.store.energy < 10000) {
                    if (creep.transfer(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.terminal, {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(creep.room.terminal, {reusePath: 10});
                        }
                        creep.say('fill term');
                    }
                }
                else if (creep.room.storage){
                    if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(creep.room.storage, {reusePath: 10});
                        }
                        //console.log(targets[0]);
                        creep.say('fill strg');
                    }
                }
            }

	    }
	    // Need to pick up energy
	    else {
	        // Otherwise move to the most full container and pickup energy
	        // If creep has no container in memory, grab one
	        if (!creep.memory.targetContainer || creep.memory.targetContainer == '') {
	            // Find all containers in the room.
	            var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) > 0
                });
                //console.log(creep.name + containers[0]);
                
                if (containers.length > 0) {
                    //console.log(creep.name);
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
	                creep.say('ctnr');
	            }
	        }
	        
	        //Pickup any energy that might be dropped around the creep
            var droppedEnergy = creep.room.find(FIND_DROPPED_ENERGY, {filter: (resource) => {resource.resourceType == RESOURCE_ENERGY}});
            if (droppedEnergy.length > 0) {
                droppedEnergy.sort(function(a, b){return b.energy - a.energy});
                //console.log(droppedEnergy[0].energy);
                if (true) { //droppedEnergy.energy > (creep.carryCapacity - creep.carry.energy)) {
                    if (creep.pickup(droppedEnergy[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(droppedEnergy[0]);
                        creep.say("nrg");
                        //ableToHarvest = false;
                    }   
                }
                
            }
	    }
	}
};

module.exports = roleHauler;
