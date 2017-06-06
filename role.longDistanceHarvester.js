var roleHarvester = require('role.harvester');

var roleLongDistanceHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (!creep.memory.totalResourcesReturned) {
            creep.memory.totalResourcesReturned = 0;
        }
        
        if(creep.memory.working && _.sum(creep.carry) == 0) {
            creep.memory.working = '';
            creep.say('need nrg');
            creep.memory.dropOffTarget = '';
            
            if (creep.ticksToLive < 200 && Game.spawns[creep.memory.sourceSpawn].energy > 150 && Game.spawns[creep.memory.sourceSpawn].renewCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns[creep.memory.sourceSpawn]);
                creep.say('renew');
                console.log(creep.name + '[' + creep.memory.sourceSpawn + ']: ' + creep.ticksToLive + '; renewing.')
            }
            
            // Go home if about to die.
            if (creep.ticksToLive <= 100 && creep.carry.energy > 0) {
                creep.memory.working = true;
            }
            
            if (creep.ticksToLive == 1) {
                console.log(creep.name + ' returned ' + creep.memory.totalResourcesReturned + ' energy.');
            }
            
	    }
	    if(!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('working');
	    }
        
        if(creep.memory.working == true) {
            // Energy is full. If we're home, lets drop off our stuff
            if (creep.room.name == creep.memory.home) {
                
                if (!creep.memory.dropOffTarget || creep.memory.dropOffTarget === '') {
                    let currentlyCarrying = _.findKey(creep.carry);
                    
                    if (creep.room.terminal && creep.room.terminal.store[currentlyCarrying] < 5000) {
                        creep.memory.dropOffTarget = creep.room.terminal.id;
                    }
                    else if (creep.room.storage) {
                        creep.memory.dropOffTarget = creep.room.storage.id;
                    }
                    else { //For low level rooms with no storage or terminal,
                    // drop off the way harvesters do
                        roleHarvester.run(creep);
                    }
                }
                else {
                    let dropOffTarget = Game.getObjectById(creep.memory.dropOffTarget);
                    
                    let currentlyCarrying = _.findKey(creep.carry);
                    
                    if(creep.transfer(dropOffTarget, currentlyCarrying) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(dropOffTarget, {visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#cbdb1e',
                            lineStyle: 'dashed',
                            strokeWidth: .15,
                            opacity: .1}}
                        );
                        creep.say('LD mv ' + dropOffTarget.structureType);
                    }
                    else {
                        creep.memory.totalResourcesReturned += creep.carryCapacity;
                    }
                }
            }
            // If we're not home, we need to get there...maybe
            else {
                
                // Not sure what this is doing, to be honest.
                var newSpawn = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
                   filter: (structure) => {
                       return (structure.structureType == STRUCTURE_SPAWN);
                   } 
                });
                
                if (newSpawn.length > 0) {
                    if (creep.build(newSpawn[0]) == ERR_NOT_IN_RANGE) {
                        //console.log('build?');
                        creep.moveTo(newSpawn[0], {reusePath: 15});
                    }
                }
                else {
                    var errnum = creep.moveTo(Game.flags[creep.memory.home], {reusePath: 15, ignoreCreeps: true});
                    //console.log(creep.name + ' ' + errnum);
                }
                
                // Repair the roads we walk on as we go
                var underCreep = creep.room.lookForAt(LOOK_STRUCTURES, creep);
                var repairTarget = _.filter(underCreep, structure => structure.structureType == STRUCTURE_ROAD && (structure.hitsMax - structure.hits > REPAIR_POWER));
                
                
                if (repairTarget && repairTarget.length > 0) {
                    creep.repair(repairTarget[0]);
                }
                    
                // If the room controller is less than 2, lets boost it to two with our energy.
                if ((creep.room.controller.level < 2 && creep.room.controller.level > 0 )|| creep.room.controller.ticksToDowngrade < 2000) {
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                        creep.say("upg ctrl");
                    }
                    else {
                        creep.moveTo(creep.room.controller);
                        //creep.moveTo(Game.flags.UpgradeHere);
                    }
                }
                // If the room is low capacity, lets give it a boost
                var energy1 = creep.room.energyCapacityAvailable;
                //console.log("test capacity: " + energy1);
                if (energy1 <= 500) {
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity);
                        }
                    });
                    if (targets.length > 0) {
                        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(targets[0]);
                            creep.say('Mv ' + targets[0].structureType);
                        }
                    }
                }
                
                
                
            }
        }
        // Not working--Need Energy
	    else {
	        if (creep.room.name == creep.memory.target) {
	            //Pickup any energy that might be dropped around the creep
                var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                if (droppedEnergy.length) {
                    creep.say(droppedEnergy[0].energy + "nrg")
                    creep.pickup(droppedEnergy[0]);
                }

                // If we don't have a source in our memory, get one.
	            if (!(creep.memory.sourceId) || creep.memory.sourceId == '0') {
	                var sources = creep.room.find(FIND_SOURCES);
	                
	                // Get a random number so that we get sent to a random source.
	                var randomSource = Math.floor(Math.random() * (sources.length));
	                creep.memory.sourceId = sources[randomSource].id;
	            }
	            
	            // If source is empty, drop that shizzz
	            if (Game.getObjectById(creep.memory.sourceId).energy == 0 && Game.getObjectById(creep.memory.sourceId).ticksToRegeneration > 50) {
	                creep.memory.sourceID = '0';
	            }
	            
	            //var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceId];
    	        if (creep.harvest(Game.getObjectById(creep.memory.sourceId)) == ERR_NOT_IN_RANGE) {
    	            creep.moveTo(Game.getObjectById(creep.memory.sourceId), {visualizePathStyle: {
                        fill: 'transparent',
                        stroke: '#1e8419',
                        lineStyle: 'dashed',
                        strokeWidth: .15,
                        opacity: .4}}
                    );
    	            creep.say("mv target");
    	        }
    	        else{
    	            var container = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: { structureType: STRUCTURE_CONTAINER }
                    });
    	            //console.log(creep.name + " " + container);
    	            if (container.length > 0) {
    	                //console.log(creep.name + ' found container');
    	                creep.withdraw(container[0], RESOURCE_ENERGY);
    	            }
    	                
    	        }
    	        
    	        
	        }
	        else {
	            //Pickup any energy that might be dropped around the creep
                var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
                if (droppedEnergy.length) {
                    creep.say(droppedEnergy[0].energy + "nrg")
                    creep.pickup(droppedEnergy[0]);
                }
                
                //if (!(creep.memory.targetRoomPosition) || creep.memory.targetRoomPosition == '') {
                //    creep.memory.targetRoomPosition = new RoomPosition(25, 25, creep.memory.target)
                //}
                
                var errnum = creep.moveTo(Game.flags[creep.memory.target]);
                //console.log(errnum);

	        }
	    }
	}
};

module.exports = roleLongDistanceHarvester;
