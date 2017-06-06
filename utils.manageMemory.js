module.exports = {
        
    setupMemory: function() {
        
    },  
    
    updateMemory: function() {
        //Lets first add a shortcut prototype to the sources memory:
        Source.prototype.memory = undefined;
        //StructureSpawn.prototype.memory = undefined;
        
        var output;
        
        for(var roomName in Game.rooms){//Loop through all rooms your creeps/structures are in
            var room = Game.rooms[roomName];
            
            
            // Add spawns into memory
            /*
            if(Game.time % 50 == 0) { //!room.memory.spawns) {
                //room.memory.spawns = {};
                let spawners = room.find(FIND_MY_SPAWNS);
                for (var i in spawners) {
                    let thisSpawn = spawners[i];
                    try {
                        thisSpawn.memory = room.memory.spawns[`Source${parseInt(i)+1}`] = {};    
                    }
                    catch (err) {
                        output = err.message;
                    }
                    
                }
            }
            */
            
            // Add sources into memory
            if(!room.memory.sources || Game.time % 50 == 0){//If this room has no sources memory yet
                room.memory.sources = {}; //Add it
                var sources = room.find(FIND_SOURCES);//Find all sources in the current room
                for(var i in sources){
                    var source = sources[i];
                    source.memory = room.memory.sources[`Source${parseInt(i)+1}`] = {}; //Create a new empty memory object for this source
                    
                    source.memory.id = source.id;
                    
                    // Check if there is a link next to the source. If there is, add its ID.
                    var lookupSource = Game.getObjectById(source.id);
                    let adjacentLink = lookupSource.pos.findInRange(FIND_MY_STRUCTURES, 2, {
                        filter: { structureType: STRUCTURE_LINK }
                    });
                    if (adjacentLink.length > 0) {
                        source.memory.associatedLink = adjacentLink[0].id;
                    }
                }
            }
            
            // Add links into memory
            if(!room.memory.links || Game.time % 52 == 0) {
                room.memory.links = {};
                let roomLinks = room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_LINK }
                });
                for (var i in roomLinks) {
                    let thisLink = roomLinks[i];
                    thisLink.memory = room.memory.links[`Link${parseInt(i)+1}`] = {};
                    
                    thisLink.memory.id = thisLink.id;
                    
                    let sourceLink = thisLink.pos.findInRange(FIND_SOURCES, 3);
                    
                    if (sourceLink.length > 0) {
                        thisLink.memory.sourceLink = true;
                    }
                    else {
                        thisLink.memory.sourceLink = false;
                    }
                    
                }
            }
            
            // Add labs and seed labs into memory
            if(!room.memory.labs || Game.time % 45 == 0) {
                room.memory.labs = {};
                let roomLabs = room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_LAB }
                });
                for (var i in roomLabs) {

                    let thisLab = roomLabs[i];
                    thisLab.memory = room.memory.labs[`Lab${parseInt(i)+1}`] = {};
                    
                    thisLab.memory.id = thisLab.id;
                    
                    let found = room.lookForAt(LOOK_FLAGS, thisLab);
                    if (found.length > 0 && found[0].name.length == 1) {
                        thisLab.memory.seedLab = true;
                    }
                    else {
                        thisLab.memory.seedLab = false;
                    }
                }
            }

            // Add containers into memory. Only do this every so often
            if(Game.time % 40 == 0) {
                room.memory.containers = {};
                var containers = room.find(FIND_STRUCTURES, {
                    filter: { structureType: STRUCTURE_CONTAINER }
                });
                for(let i in containers) {
                    let container = containers[i];
                    container.memory = room.memory.containers[`Container${parseInt(i)+1}`] = {};
                
                    let upgraderContainer = container.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: { structureType: STRUCTURE_CONTROLLER, my: true}
                    });
                    
                    container.memory.id = container.id;
                    
                    //console.log(room.name + ' ' + upgraderContainer);
                    
                    if (upgraderContainer.length > 0) {
                        container.memory.upgraderContainer = true;
                    }
                    else {
                        container.memory.upgraderContainer = false;
                    }
                }
            }
        } 
        return output;
    },
        
    deleteOldMemory: function() {
        //Clear dead creep memory
        var deadString = '';
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined) {
                deadString = deadString + name + " has died. ";
                delete Memory.creeps[name];
            }
        }
        
        // Clear empty rooms
        for (let name in Memory.rooms) {
            if (Game.rooms[name] == undefined) {
                //console.log(name + ' is not a room');
                delete Memory.rooms[name];
            }
        }
        
        return deadString;
    }

};