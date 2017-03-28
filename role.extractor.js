var roleExtractor = {

    run: function(creep) {
        //console.log(_.sum(creep.carry));
	    if(!(creep.memory.mining) && _.sum(creep.carry) == 0) {
            creep.memory.mining = true;
            creep.say('I mine gud');
	    }
	    if(creep.memory.mining && _.sum(creep.carry) == creep.carryCapacity) {
	        creep.memory.mining = false;
	        creep.say('working');
	    }
	    
	    // Carry haul back before dying. 40 is hardcoded to give enough time;
	    // May need to adjust depending on room. Cached paths will fix this later.
	    if (creep.ticksToLive < 40 && _.sum(creep.carry) > 10) {
            creep.memory.mining = false;
        }
	    
	    
	    if(creep.memory.mining) {
	        creep.say('gimme');
	        
	        //If the creep doesn't have a node assigned, find an unclaimed node.
	        if(!creep.memory.mineralNode){
	            let nodeTarget = creep.room.find(FIND_MINERALS);
                creep.memory.mineralNode = nodeTarget[0].id;
            }
            else {
                let mineralNode = Game.getObjectById(creep.memory.mineralNode);
                let mineralsLeft = mineralNode.mineralAmount;
                
                if (creep.harvest(mineralNode) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mineralNode);
                }
            }
	    }
	    else {
	        let currentlyCarrying = _.findKey(creep.carry);
	        
	        // Deposit in terminal if it exists, storage if it does not.
	        var depositTarget = creep.room.terminal
	        if (!depositTarget || depositTarget.store[currentlyCarrying] >= 10000) {
	            depositTarget = creep.room.storage
	        }
	        //console.log(depositTarget);
	        if (creep.transfer(depositTarget, currentlyCarrying) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(depositTarget);
            }
	        
	        /*
	        let mineralType = _.findKey(creep.carry);
	        let mineralFlag = Game.flags[mineralType];

            //console.log(mineralFlag);

            // If there exists a flag for what we're mining
            if (mineralFlag) {
                // See if a lab is there
                var found = creep.room.lookForAt(LOOK_STRUCTURES, mineralFlag);
                
                // If there is, and we're in the room that it exists, move there and transfer minerals
	            if (found.length > 0 && found[0].structureType == STRUCTURE_LAB && Game.flags[mineralType].pos.roomName == creep.pos.roomName) {
	                 if (creep.transfer(found[0], _.findKey(creep.carry)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(found[0]);
                        creep.say('dump mins');
                    }
	            }
	            // If we're not in that room, move there.
	            else if (mineralFlag.pos.roomName != creep.pos.roomName) {
	                creep.moveTo(mineralFlag);
                }
	        }
	        */
	    }
	    
	} // End run
};

module.exports = roleExtractor;
