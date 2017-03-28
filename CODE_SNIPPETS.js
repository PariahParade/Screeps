var source = creep.pos.findClosest(FIND_SOURCES, {
    filter: function(source){
        return source.memory.workers < 2; //Access this sources memory and if this source has less then 2 workers return this source
    }
});
if(source){ //If a source was found
    creep.moveTo(source);
    creep.harvest(source);

    /* You should also increment the sources workers amount somehow, 
     * so the code above will know that another worker is working here. 
     * Be aware of the fact that it should only be increased once!
     * But I will leave that to the reader.
     */
}


module.exports.preload = function() {
	
	Game.creepsByRole = _.groupBy(Game.creeps,'memory.role');
	
    for ( let roomNum in Game.rooms ) {
        let room = Game.rooms[roomNum];
        
        room.sources = room.find(FIND_SOURCES);
        room.minerals = room.find(FIND_MINERALS);
        room.drops = room.find(FIND_DROPPED_RESOURCES);
        
        room.allstructures = room.find(FIND_STRUCTURES);
        
        room.mystructures = room.find(FIND_MY_STRUCTURES);
        room.spawns = room.find(FIND_MY_SPAWNS);
        room.towers = _.filter(room.structures,s=>s.structureType == STRUCTURE_TOWER)
        room.mycreeps = room.find(FIND_MY_CREEPS);
        room.hostilecreeps = room.find(FIND_HOSTILE_CREEPS);
        room.flags = room.find(FIND_FLAGS);

		room.mycreepsbyjob = _.groupBy(room.mycreeps,'memory.job');
        
        room.roomlevel = 1;
        if ( room.energyCapacityAvailable >= 550 )    room.roomlevel = 2;
        if ( room.energyCapacityAvailable >= 800 )    room.roomlevel = 3;
        if ( room.energyCapacityAvailable >= 1300 )   room.roomlevel = 4;
        if ( room.energyCapacityAvailable >= 1800 )   room.roomlevel = 5;
        if ( room.energyCapacityAvailable >= 2300 )   room.roomlevel = 6;
        if ( room.energyCapacityAvailable >= 5000 )   room.roomlevel = 7; // actually 5600
        if ( room.energyCapacityAvailable >= 12000 )  room.roomlevel = 8; // actually 12900
		
    }
};



if (Room.terminal && (Game.time % 10 == 0)) { 
    if (Room.terminal.store[RESOURCE_ENERGY] >= 2000 && Room.terminal.store[RESOURCE_OXYGEN] >= 2000) { 
        var orders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_OXYGEN && 
                                      order.type == ORDER_BUY && 
                                      Game.market.calcTransactionCost(200, spawn.room.name, order.roomName) < 400); 
        console.log('Oxygen buy orders found: ' + orders.length); 
        orders.sort(function(a,b){return b.price - a.price;}); 
        console.log('Best price: ' + orders[0].price); 
        if (orders[0].price > 0.05) { 
            var result = Game.market.deal(orders[0].id, 200, spawn.room.name); 
            if (result == 0) { 
                console.log('Order completed successfully'); 
            } 
        } 
    }
}


// Old miner code to move onto container.
if (!creep.memory.inPosition) {
    let moveToContainer = creep.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: function(object) { 
            return object.structureType == STRUCTURE_CONTAINER;
        }
    });
    console.log(creep.name + ' ' + moveToContainer[0]);
    if (moveToContainer.length > 0) {
        //console.log(creep.pos + ' ' + moveToContainer[0].pos);
        if (creep.pos.isEqualTo(moveToContainer[0])) {
            creep.memory.inPosition = true;
        }
        else {
            creep.moveTo(moveToContainer[0]);
        }
    }
    else { //There's not a container. No need running this every tick.
        creep.memory.inPosition = true;
    }
}







