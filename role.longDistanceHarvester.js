var roleHarvester = require('role.harvester');

var roleLongDistanceHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = '';
            creep.say('need nrg');
            if (creep.ticksToLive < 200 && Game.spawns[creep.memory.sourceSpawn].energy > 150 && Game.spawns[creep.memory.sourceSpawn].renewCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns[creep.memory.sourceSpawn]);
                creep.say('renew');
                console.log(creep.name + '[' + creep.memory.sourceSpawn + ']: ' + creep.ticksToLive + '; renewing.')
            }
            if (creep.ticksToLive >= 300) {
                creep.memory.working = false;
            }
            
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('working');
	    }
        
        if(creep.memory.working == true) {
            // Energy is full. If we're home, lets drop off our stuff
            if (creep.room.name == creep.memory.home) {
                var targetStorage = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE);
                    }
                });
                if(targetStorage.length > 0) {
                    if(creep.transfer(targetStorage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetStorage[0], {visualizePathStyle: {
                            fill: 'transparent',
                            stroke: '#cbdb1e',
                            lineStyle: 'dashed',
                            strokeWidth: .15,
                            opacity: .1}}
                        );
                        creep.say('LD mv ' + targetStorage[0].structureType);
                    }
                }
                else {
                    // If no storage, lets drop off things the way harvesters do
                    roleHarvester.run(creep);
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
                var repairTargets = creep.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: function(object) {
                        return object.hits < object.hitsMax
                            && object.hitsMax - object.hits > REPAIR_POWER;
                    }
                });
                repairTargets.sort(function (a,b) {return (a.hits - b.hits)});
                if (repairTargets.length > 0) {
                    creep.repair(repairTargets[0]);
                }
                    
                // If the room controller is less than 3, lets boost it to two with our energy.
                if ((creep.room.controller.level < 3 && creep.room.controller.level > 0 )|| creep.room.controller.ticksToDowngrade < 2000) {
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
                var droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
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
                        opacity: .1}}
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
