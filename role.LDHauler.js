//require('prototype.creep');
var roleHarvester = require('role.harvester');

var roleLDHauler = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        //console.log(creep.name);
        
        // Define Initial Memory
        if (!creep.memory.ticksWaiting){
            creep.memory.ticksWaiting = 0;
        }
        if (!creep.memory.fillTick) {
            creep.memory.fillTick = '';
        }

        // Define work/pickup/idle parameters
        if(creep.memory.fullEnergy && creep.carry.energy == 0) {
            creep.memory.fullEnergy = false;
            //creep.memory.targetContainer = '';
            creep.memory.pathDistance = Game.time - creep.memory.fillTick;
	    }
	    if(!(creep.memory.fullEnergy) && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.fullEnergy = true;
	        creep.memory.fillTick = Game.time;
	        creep.say('fullEnergy');
	    }
	    
	    // Go home if about to die
        if (creep.ticksToLive <= 120 && creep.carry.energy > 0) {
            creep.memory.fullEnergy = true;
        }
	    

        if(creep.memory.fullEnergy) {
            var targetContainer = Game.getObjectById(creep.memory.targetContainer);
            if (creep.room.name == creep.memory.home) {
                if (!creep.room.storage) {
                    //console.log(creep.name + ' storage');
                    var storageConstruction = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_STORAGE);
                        }
                    });
                    
                    if (storageConstruction.length > 0) { 
                        if (creep.build(storageConstruction[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storageConstruction[0]);    
                        }
                    }
                    else { 
                        //For low level rooms with no storage or terminal,
                        // drop off the way harvesters do
                        roleHarvester.run(creep);
                    }
                }
                else {
                    creep.depositAnything(true);    
                }
            }
            else { // Get home
                var errnum = creep.moveTo(Game.flags[creep.memory.home], {reusePath: 20});
               
                //Repair roads as we go along
                var underCreep = creep.room.lookForAt(LOOK_STRUCTURES, creep);
                var repairTarget = _.filter(underCreep, structure => structure.structureType == STRUCTURE_ROAD && (structure.hitsMax - structure.hits > REPAIR_POWER));
                
                if (repairTarget && repairTarget.length > 0) {
                    creep.repair(repairTarget[0]);
                }
                
                // Build road if needed
                var constructionSite = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep);
                
                if (_.size(constructionSite) > 0 && _.sum(creep.carry) > 0){
                    console.log(creep.name);
                    creep.build(constructionSite[0]);
                }
                
                
            }
	    }
	    // Need to pick up energy
        else {
	        if (creep.room.name == creep.memory.target) {
	            
	            // If an SK creep, check to see if there is a SK in range.
                if (creep.memory.remoteFlag != '') {
                    var SKInRange = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5, {
                        filter: (c) => c.owner && c.owner.username == 'Source Keeper'
                    });
                    
                    var sourceKeeper = SKInRange[0];
                    
                    if (creep.pos.getRangeTo(sourceKeeper) <= 5) {
            	        creep.moveTo(Game.flags[creep.memory.home]);
            	        creep.say(UNICODE_XBONES, 1);
            	    }
                    
                    // If there is an SK within range, just pause. Hopefully it will be taken care of.
                    if (sourceKeeper) {
                        return;
                    }    
                }
                
	            // Grab a container into memory that is currently being worked by a miner,
                // but is not saved by other haulers.
                if(!creep.memory.targetContainer){
    	            // Find all containers in room.
                    var containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.energy > 100
                    });
                    
                    // Loop through every container. If the id matches a container that a creep has in memory, filter it out
                    containers.forEach(function(cntr){
                        var temp = _.filter(Game.creeps, c => c.targetContainer == cntr.id && c.memory.role == 'LDHauler');
                    
                        if(temp == ''){
                            creep.memory.targetContainer = cntr.id;
                        }
                    });
                    
                    if (!creep.memory.targetContainer) { 
                        // Search didn't find a container
                        //Pickup any energy that might be dropped in the room
                        var droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                            filter: (drops) => 
                                drops.resourceType === RESOURCE_ENERGY 
                                //&& drops.energy >= creep.carryCapacity
                        });

                        if (droppedEnergy) {
                            if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(droppedEnergy, {noPathFinding: true})
                                // Perform pathfinding only if we have enough CPU
                                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                                    creep.moveTo(droppedEnergy, {maxRooms: 1, range: 0});
                                }
                            }
                        }
                    }
                }
    	        // We have a container in memory. Go to it.
                else {
                    var targetContainer = Game.getObjectById(creep.memory.targetContainer);
                    var returnCode = creep.withdraw(targetContainer, RESOURCE_ENERGY);
                    
                    if (returnCode == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetContainer, {reusePath: 50, ignoreCreeps: true});
                    }
                    else if (returnCode == ERR_NOT_ENOUGH_RESOURCES && _.sum(creep.carry) < (creep.carryCapacity * 0.50)) {
                        creep.memory.ticksWaiting = creep.memory.ticksWaiting + 1;
                    }
                    // If the container is empty and we're at 75% capacity: good enough--head back.
                    //else if(_.sum(creep.carry) > (creep.carryCapacity * 0.75)) {
                    //    creep.fullEnergy = true;
                    //}
                    
                    // If we're just sitting waiting at a container, lets drop claim and use another.
                    if (creep.memory.ticksWaiting >= 10) {
                        creep.memory.targetContainer = '';
                        creep.memory.ticksWaiting = 0;
                    }
                    
                }
    	        
    	        var droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (drops) => 
                        drops.resourceType === RESOURCE_ENERGY &&
                        drops.energy >= creep.carryCapacity
                });

                if (droppedEnergy) {
                    if (creep.pickup(droppedEnergy) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(droppedEnergy, {noPathFinding: true})
                        // Perform pathfinding only if we have enough CPU
                        if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                            creep.moveTo(droppedEnergy, {maxRooms: 1});
                        }
                    }
                }
	        }
	        else { // Get to target room
                var errnum = creep.moveTo(Game.flags[creep.memory.target], {reusePath: 50});
            }
	    }
	}
};

module.exports = roleLDHauler;
