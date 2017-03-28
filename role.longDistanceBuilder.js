var roleRepairer = require('role.repairer');

var roleLongDistanceBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('need nrg');
	    }
	    if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
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
                            console.log('moving to spawn to build');
                            creep.moveTo(spawn, {reusePath: 15});
                        }
                    }
                    else {
                        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                            //console.log(creep.name);
                            creep.moveTo(targets[0], {reusePath: 15, maxRooms: 1});
                        }
                    }
	            }
	            else {
	                roleRepairer.run(creep);
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
