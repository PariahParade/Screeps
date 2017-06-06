var roleRepairer = require('role.repairer');

var roleLongDistanceBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (!creep.memory.firstWayPoint) {
            creep.memory.firstWayPoint = false;
        }
        
        if(creep.memory.working && _.sum(creep.carry) == 0) {
            creep.memory.working = false;
            creep.say('need nrg');
	    }
	    if(!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.working = true;
	        creep.say('working');
	    }

        if(creep.memory.working) {
            // If we're in the target room, get building!
            if (creep.room.name == creep.memory.target) {
                var spawnInQueue = false;
                var spawn;
	            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	            /*
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
	            */
	            
	            
	            
	            
	            if (targets.length > 0) {
	                for (let target in targets) {
                        if (target.structureType == STRUCTURE_SPAWN) {
                            spawnInQueue = true;
                            spawn = target;
                        }
                    }
                    if (spawnInQueue) {
                        if(creep.build(spawn) == ERR_NOT_IN_RANGE) {
                            //console.log('moving to spawn to build');
                            creep.moveTo(spawn, {reusePath: 15});
                        }
                    }
                    else {
                        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            //console.log(creep.name);
                            creep.moveTo(targets[0], {maxRooms: 1, range: 1});
                        }
                    }
	            }
	            // If the room controller is less than 2, lets boost it to two with our energy.
                else if ((creep.room.controller.level < 2 && creep.room.controller.level > 0 )|| creep.room.controller.ticksToDowngrade < 2000) {
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {range: 1});
                        creep.say("upg ctrl");
                    }
                }
	            else {
	                roleRepairer.run(creep);
	            }
	        }
	        else if (creep.memory.target == 'E83N34') {
	            // If target room is spawn 7, use waypoint.
	            if (!creep.pos.isEqualTo(Game.flags.E84N34) && creep.memory.firstWayPoint === false) {
                    if (creep.room.name == Game.flags.E84N34.name) {
                        var errnum = creep.moveTo(Game.flags.E84N34, {maxRooms: 1});
                    }
                    else {
                        var errnum = creep.moveTo(Game.flags.E84N34);    
                    }
                }
                else if (creep.pos.isEqualTo(Game.flags.E84N34)) {
                    creep.memory.firstWayPoint = true;
                }
                
                if (creep.memory.firstWayPoint === true) {
                    var errnum = creep.moveTo(Game.flags[creep.memory.target]);
                }
	        }
	        else {
	            var errnum = creep.moveTo(Game.flags[creep.memory.target]);
                //console.log(creep.name + ' ' + errnum);
	        }
        }
        // Not working--Need Energy
	    else {
	        if (creep.room.name == creep.memory.home) {
	            //console.log(creep.name + " " + 'test');
	            creep.getEnergy(true, true, false, false);
	        }
	        else {
	            creep.getEnergy(true, true, true, false);
	            /*
	            var source = creep.pos.findClosestByPath(FIND_SOURCES);
	            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(source);
	                creep.say("mv source");
	            }
	            */
	        }
	    }// End Need Energy
	}
};

module.exports = roleLongDistanceBuilder;
