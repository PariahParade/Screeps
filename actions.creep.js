/*
 * You can import from another modules like this:
 * var mod = require('actions.creep');
 * mod.thing == 'a thing'; // true
 */
 
 function findContainer(searchRoom, sortType) {
    let container = Game.rooms.searchRoom.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 150
    });
    
    container.sort(function (a,b) {return (b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY])});
    
    if (container.length > 0){
        this.memory.storedContainer = container[0].id;                    
    } 
 }
