var roleMiner = {

    run: function(creep) {

	    if(!(creep.memory.mining) && creep.carry.energy == 0) {
            creep.memory.mining = true;
            creep.say('I mine gud');
            //console.log("test2");
	    }
	    
	    if(creep.memory.mining) {
	        creep.say('mine');
	        
	        //If the creep doesn't have a node assigned, find an unclaimed node.
	        if(!creep.memory.miningNode){
                var sources = creep.room.find(FIND_SOURCES);
                var check=[];
                // Loop through every source. If the id matches a source that a creep has in memory, filter it out
                sources.forEach(function(srs){
                    var tmp = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.miningNode == srs.id && s.memory.role == 'miner'})
                    //console.log("srs: " + srs.id);
                    //console.log("tmp: " + tmp);
                    if(tmp == ''){
                        //console.log("in if");
                        creep.memory.miningNode = srs.id;
                        
                    }
                });
            }
            
            
            // Diagnostic to find reserved nodes
            /*
            var reservedNodes = [];
            for(var name in Game.creeps) {
                var creepScanned = Game.creeps[name];
                if(creepScanned.memory.miningNode != null && creepScanned.memory.role == 'miner') {
                    //reservedNodes.push(creepScanned.memory.miningNode);
                    console.log(creepScanned.name + "'s miningNode: " + creepScanned.memory.miningNode);
                }
            }
            */
            
            
	        
	       
            
            /*
            var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.id == creep.memory.miningNode});
	        if (!creep.pos.isEqualTo(container)) {
	            //console.log(creep.name + " moving to container: " + container.id + " at " + container.pos + ". My pos: " + creep.pos);
	            creep.moveTo(container);
	        }
	        */
	       
	       var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER);
                    }
            });
	        
	        var source = creep.pos.findClosestByPath(FIND_SOURCES,{filter: (s) => s.id == creep.memory.miningNode});
            if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                console.log(creep.name + " moving to source: " + source.id);
                creep.moveTo(source);
            }
	        else {
	            // TODO: stopgap. Fix this later.
	            creep.moveTo(container);
                try{
                    //console.log(creep.name + " mining");
                    var errorCode = creep.transfer(container, RESOURCE_ENERGY);
                    //console.log(errorCode);
                }
                catch(err) {
                    console.log("Error: Miner not in range of container? Error Code: " + err.message)
                }
            }
        } // End creep.memory.mining
	} // End run
};

module.exports = roleMiner;
