var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (!creep.memory.ticksWaiting){
            creep.memory.ticksWaiting = 0;
        }

        if(creep.memory.fullEnergy && _.sum(creep.carry) == 0 && creep.ticksToLive >= 50) {
            creep.memory.fullEnergy = false;
            creep.memory.targetContainer = '';
            creep.say('need nrg');
	    }
	    
	    if(!(creep.memory.fullEnergy) && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.fullEnergy = true;
	        creep.say('fullEnergy');
	    }
	    
	    // Get to work if about to die
        if (!creep.memory.fullEnergy && creep.ticksToLive <= 50 && _.sum(creep.carry) > 0) {
            creep.memory.fullEnergy = true;
            creep.memory.spawnRoom = ''; //Causes room to spawn another.
        }
        
        if (creep.ticksToLive < 30 && _.sum(creep.carry) > 0 && creep.room.terminal) {
            creep.memory.fullEnergy = false;
            creep.depositAnything();
        }
        else if (creep.ticksToLive < 20 && _.sum(creep.carry) == 0) {
            creep.memory.spawnRoom = ''
            creep.memory.fullEnergy = true; // Keeps the creep from doing anything. No 0.2cpu to suicide needed.
        }
	    

        if(creep.memory.fullEnergy) {
            
            let currentlyCarrying = _.findKey(creep.carry);
            if (currentlyCarrying != RESOURCE_ENERGY) {
                creep.depositAnything();
                return;
            }
            
            var containersInRoom = Game.rooms[creep.room.name].memory.containers;
            var upgraderContainer = Game.getObjectById(_(containersInRoom).filter('upgraderContainer').pluck('id').first())
            
            var productLabIDs = _.pluck(_.filter(creep.room.memory.labs, function(n) {return n.seedLab == false;}), 'id');
            var productLabs = _.map(productLabIDs, Game.getObjectById);
            var productLabToFill = _.min(productLabs, 'energy'); 
            if (productLabToFill && productLabToFill.energy == productLabToFill.energyCapacity) { 
                productLabToFill = undefined; 
            }
            
            
        

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
                // Spawn And Extensions
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
                // Terminal
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
                // Upgrader Containers
                else if (upgraderContainer) {
                    if (creep.transfer(upgraderContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(upgraderContainer, {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(upgraderContainer, {reusePath: 10});
                        }
                        creep.say('fill cntr');
                    }
                }
                // Product Labs
                else if (productLabToFill) {
                    if (creep.transfer(productLabToFill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(productLabToFill, {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(productLabToFill, {reusePath: 10});
                        }
                        creep.say('fill lab');
                    }
                }
                // Only drop off to storage if about to die.
                else if (creep.room.storage && creep.ticksToLive <= 50){
                    if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {noPathFinding: true});
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(creep.room.storage, {reusePath: 10});
                        }
                        creep.say('fill strg');
                    }
                }
                
            }

	    }
	    // Need to pick up energy
	    else {
	        // If creep has no container/storage in memory, grab one
	        if (!creep.memory.targetContainer || creep.memory.targetContainer == '') {

                // Find all containers in the room.
                //var containers = creep.room.find(FIND_STRUCTURES, {
                //    filter: (structure) => structure.structureType == STRUCTURE_CONTAINER 
                //            && _.sum(structure.store) >= (creep.carryCapacity - creep.carry.energy)
                //});
                
                var containersInRoom = _.pluck(creep.room.memory.containers, 'id');
                var upgraderContainer = _.pluck(_.filter(creep.room.memory.containers, function(n) {return n.upgraderContainer == true;}), 'id');
                var filteredContainers = containersInRoom.filter(val => !upgraderContainer.includes(val));
                
                var containers = _.map(filteredContainers, Game.getObjectById);
                let fullestContainer = _.max(containers, 'store.energy')
                
                if (_.size(fullestContainer) > 0 && fullestContainer.store.energy > creep.carryCapacity - _.sum(creep.carry) || (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] < (creep.carryCapacity - creep.carry.energy))) {
                    creep.memory.targetContainer = fullestContainer.id;
                }
                // If no storage or terminal, go ahead and just wait by containers as they fill.
                else if (!creep.room.storage && !creep.room.terminal) {
                    creep.memory.targetContainer = fullestContainer.id;
                }
                // If storage has enough to fill us up, lets use that.
                else if (creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] >= (creep.carryCapacity - creep.carry.energy)) {
                    creep.memory.targetContainer = creep.room.storage.id;
                }
                // Use terminal in emergency
                else if (creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] >= (creep.carryCapacity - creep.carry.energy)) {
                    console.log(creep.name + ' using terminal to get energy!');
                    creep.memory.targetContainer = creep.room.terminal.id;
                }
                
	        }
	        // We have a container in memory. Go to it.
	        else {
	            var returnCode = creep.withdraw(Game.getObjectById(creep.memory.targetContainer), RESOURCE_ENERGY);
	            if (returnCode == ERR_NOT_IN_RANGE) {
	                creep.moveTo(Game.getObjectById(creep.memory.targetContainer));
	                creep.say('ctnr');
	            }
	            else if (returnCode == ERR_NOT_ENOUGH_RESOURCES) {
	                creep.memory.ticksWaiting += 1;
	            }
	            
	            if (creep.memory.ticksWaiting >= 10) {
	                creep.memory.targetContainer = '';
	                creep.memory.ticksWaiting = 0;
	            }
	            
	        }
	        
	        //Pickup any energy that might be dropped around the creep
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (resource) => resource.resourceType == RESOURCE_ENERGY});
            if (creep.name == 'hauler548') { console.log(droppedEnergy); }
            if (droppedEnergy.length > 0) {
                
                
                let highestEnergy = _.max(droppedEnergy, 'energy');

                if (highestEnergy.energy > (creep.carryCapacity - creep.carry.energy)) {
                    if (creep.pickup(highestEnergy) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(highestEnergy);
                        creep.say("nrg");
                        //ableToHarvest = false;
                    }   
                }
                
            }
	    }
	}
};

module.exports = roleHauler;
