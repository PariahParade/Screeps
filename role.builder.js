var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }

	    if(creep.memory.building) {
	        /*
	        var targets = [];
	        for (let sites in Game.constructionSites) { 
	            targets.push(Game.getObjectById(sites))
	        };
	        //console.log(targets);
	        if (targets.length) {
	            if(creep.build(Game.getObjectById(targets[0])) == ERR_NOT_IN_RANGE) {
	                // If we're not in the right room, we need to move there.
	                if (creep.room == targets.pos.room) {
	                    console.log("if; Creep room: " + cree.room.name + " target room: " + targets.pos.room);
	                }
	                else {
	                    console.log("else; Creep room: " + cree.room.name + " target room: " + targets.pos.room);
	                }
	                
                    creep.moveTo(targets[0]);
                    //creep.say(targets[0].structureType + " " + targets[0].progress + "/" + targets[0].progressTotal);
                }
	        }
	        else {
	            //console.log(targets);
                //console.log("Nothing to build so " + creep.name + " is upgrading");
                roleUpgrader.run(creep);
            }
	        */
	        
	        //for (var thisRoom in Game.rooms) {
	            
	        //}
	        
	        //var buildingSites = Game.constructionSites
	        
	        var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                    //creep.say(targets[0].structureType + " " + targets[0].progress + "/" + targets[0].progressTotal);
                }
            }
            else {
                console.log("Nothing to build so " + creep.name + " is upgrading");
                roleUpgrader.run(creep);
            }
            
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
	           filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50 
	        });
	        if (container) {
	            if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
	                creep.moveTo(container);
	                creep.say("build nrg");
	            }
	        }
	    }
	    /*
	    else {
	        
	        
	        var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
	    }
	    */
	}
};

module.exports = roleBuilder;
