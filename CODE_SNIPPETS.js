/**
 * Globally patch creep actions to log error codes.
 */
['attack','attackController','build','claimController','dismantle','drop',
 'generateSafeMode','harvest','heal','move','moveByPath','moveTo','pickup',
 'rangedAttack','rangedHeal','rangedMassAttack','repair','reserveController',
 'signController','suicide','transfer','upgradeController','withdraw'].forEach(function(method) {
	 let original = Creep.prototype[method];
	 // Magic
	 Creep.prototype[method] = function() {
		 let status = original.apply(this, arguments);
		 if(typeof status === 'number' && status < 0) {
			 console.log(`Creep ${this.name} action ${method} failed with status ${status} at ${this.pos}`);
		 }
		 return status;
	 }
 });
 
 
 
// Pathfinder early test?
creep.memory.path = creep.room.findPath(creep.pos, target.pos, {
    costCallback: function (roomName, costMatrix) {
        const roads = creep.room.find(FIND_STRUCTURES, {filter: (r) => r.structureType === STRUCTURE_ROAD});
        for (let i = 0; i < roads.length; i++) {
            costMatrix.set(roads[i].pos.x, roads[i].pos.y, 0);
        }
        const creeps = creep.room.find(FIND_CREEPS);
        for (let i = 0; i < creeps.length; i++) {
            costMatrix.set(creeps[i].pos.x, creeps[i].pos.y, 255);
        }
        for (let i = 0; i < 20; i++) {
            let avoid = 'avoid' + i;
            if (Game.flags[avoid]) {
                costMatrix.set(Game.flags[avoid].pos.x, Game.flags[avoid].pos.y, 100);
            }
        }
        if (exempt === true) {
            const source = creep.room.find(FIND_SOURCES);
            for (let i = 0; i < source.length; i++) {
                costMatrix.set(source[i].pos.x, source[i].pos.y, 35);
                costMatrix.set(source[i].pos.x + 1, source[i].pos.y, 35);
                costMatrix.set(source[i].pos.x, source[i].pos.y + 1, 35);
                costMatrix.set(source[i].pos.x - 1, source[i].pos.y, 35);
                costMatrix.set(source[i].pos.x, source[i].pos.y - 1, 35);
                costMatrix.set(source[i].pos.x - 1, source[i].pos.y - 1, 35);
                costMatrix.set(source[i].pos.x + 1, source[i].pos.y + 1, 35);
                costMatrix.set(source[i].pos.x + 1, source[i].pos.y - 1, 35);
                costMatrix.set(source[i].pos.x - 1, source[i].pos.y + 1, 35);
            }
        }
    },
    maxOps: 100000, serialize: true, ignoreCreeps: false
});
 
 
 
 
// Generate a costMatrix
let testingCreep = Game.creeps.LDHauler662;
let goals = _.map(testingCreep.room.find(FIND_SOURCES), function(source) {
    // We can't actually walk on sources-- set `range` to 1 
    // so we path next to it.
    return { pos: source.pos, range: 1 };
});

let ret = PathFinder.search(
testingCreep.pos, goals,
{
    // We need to set the defaults costs higher so that we
    // can set the road cost lower in `roomCallback`
    plainCost: 2,
    swampCost: 10,

    roomCallback: function(roomName) {
        let room = Game.rooms[roomName];
        // In this example `room` will always exist, but since 
        // PathFinder supports searches which span multiple rooms 
        // you should be careful!
        if (!room) return;
        let costs = new PathFinder.CostMatrix;
        
        room.find(FIND_STRUCTURES).forEach(function(struct) {
            if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
            } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                     (struct.structureType !== STRUCTURE_RAMPART ||
                      !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
            }
        });
        
        // Avoid creeps in the room
        room.find(FIND_CREEPS).forEach(function(creep) {
          costs.set(creep.pos.x, creep.pos.y, 0xff);
        });
        
        Memory.testCostMatrix = costs;
        
        return costs;
    },
});

//let pos = ret.path[0];
//creep.move(creep.pos.getDirectionTo(pos));
    

 
 
 // Ranged SK Killer -- One per source, 5300 energy. DOUBLES AS MINER
 //[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
 //WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,
 //CARRY,CARRY,
 //RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
 //HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
 
 // Melee SK Killer -- One per room, 4130 energy
 // TOUGH*3,MOVE*17,ATTACK*25,HEAL*5
 //[TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
 //ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
 //HEAL,HEAL,HEAL,HEAL,HEAL]
 
 
 
 function getClosestTerminal(theTerminal, theTerminalList) {
    var closestTerminal = undefined;
    var range = 0;
    for (var i = 0; i < theTerminalList.length; i++) {
        var otherTerminal = theTerminalList[i];
        if (theTerminal != otherTerminal) {
            continue;
        }
        var distance = Game.map.getRoomLinearDistance(theTerminal.pos.roomName, otherTerminal.pos.roomName);
        if (closestTerminal === undefined || distance < range) {
            range = distance;
            closestTerminal = otherTerminal;
        }
    }
    return closestTerminal;
}
/*
[1:50]  
It takes 2 arguments, theTerminal - terminal you want to get your closest other terminal to,
theTerminalList - list of terminals you own (can include the terminal you want to find the closest one too)

[1:53]  
it will loop over all your terminals:
- it will skip checks if the input is the same
- it will check distance
- it will set the closestTerminal if it hasn't been set yet, or the distance is closer than the current selected item.

it can return undefined if you don't have theTerminalList filled up (edited)
*/




if (!roomObj.controller) {
    // ROOM HAS NO CONTROLLER
    // DO STUFF THATS LIKE CHECKING FOR POWER AND HARVEST
    // seperate module
    return;
}


if (!roomObj.controller.owner) {
    // ROOM IS OWNED BY NO ONE
    // DO STUFF THATS LIKE CHECKING FOR ENEMIES AND CLAIM
    // seperate module
    return;
}

if (roomObj.controller.my) {
    // ROOM IS OWNED BY ME
    // DO STUFF THATS OWNED BY ME
    // seperate module
    return;
}

// ROOM IS OWNED BY ENEMY
// DO STUFF THATS LIKE CHECKING FOR ENEMIES AND KILL
// seperate module
return;



// Neat way to count cost of creep body
function getBodyCost(creepBody) {
    if (isNullOrUndefined(creepBody)) {
        return 0;
    }
    var cost = 0;
    for (var i = 0; i < creepBody.length; i++) {
        var part = creepBody[i];
        cost += BODYPART_COST[part];
    }
    return cost;
}

global.isNullOrUndefined = function(theObject) {
    return (theObject === undefined || theObject === null);
}


// Code to quarantine off that asshole
//var quarantineRooms = QUARANTINE_ROOMS;
//var roomsQuarantined = [];
//let quarantineCreeps = _.filter(Game.creeps, (c) => c.memory.quarantineRoom != '' && c.memory.role == 'claimer');
            
//_.forEach(quarantineCreeps, function(n) {
//    roomsQuarantined.push(n.memory.quarantineRoom); 
//});

//var roomsToQuarantine = _.difference(quarantineRooms, roomsQuarantined);

//for (var x = 0; x < roomsToQuarantine.length; x++) {
    //console.log(x + ': ' + roomsToQuarantine[x]);
//}

// End asshole quarantine code






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



//old progress walker

 // Move to target room
        else {
            var progress = creep.memory.progress;
            var errnum;
            
            //console.log(progress);
            
            if (progress == 0) {
                if (creep.pos.isEqualTo(Game.flags.spot1)) {
                    creep.memory.progress = 1;
                }
                else {
                    errnum = creep.moveTo(Game.flags['spot1']);
                }
            }
            else if (progress == 1) {
                if (creep.pos.isEqualTo(Game.flags.spot2)) {
                    creep.memory.progress = 2;
                }
                else {
                    errnum = creep.moveTo(Game.flags['spot2']);
                }
            }
            else if (progress == 2) {
                //console.log('test');
                if (creep.pos.isEqualTo(Game.flags.spot3)) {
                    creep.memory.progress = 3;
                }
                else {
                    errnum = creep.moveTo(Game.flags['spot3']);
                }
            }
            else if (progress == 3) {
                errnum = creep.moveTo(Game.flags[creep.memory.target]);
            }

        }


//OLD SK CODE
// Determine how many (if any) SK miner/killers this room should produce
            // Grab this spawn's number
            var firstTrim = _.trimLeft(spawnName, 'Spawn');
            var spawnNumber = firstTrim.slice(0, 1);
            var SKFlags = _.filter(Game.flags, f => _.startsWith(f.name, 'SK_' + spawnNumber));

            var SKSpawnsNeeded = {};
            
            _.forEach(SKFlags, function(n, key) {
                let SKGuards    = _.sum(Game.creeps, (c) => c.memory.SKFlag == n.name && c.memory.role == 'SKGuard');
                let LDHaulers   = _.sum(Game.creeps, (c) => c.memory.SKFlag == n.name && c.memory.role == 'LDHauler');
                
                SKSpawnsNeeded[n.name] = [];
                
                if (SKGuards < 1) {
                    SKSpawnsNeeded[n.name].push('SKGuard');
                    //SKSpawnsNeeded[n.name].push(spawnNumber);
                }
                if (LDHaulers < 1) {
                    SKSpawnsNeeded[n.name].push('LDHauler');
                    //SKSpawnsNeeded[n.name].push(spawnNumber);
                }
            });
            
            var spawnToUse;
            
            _.forEach(SKSpawnsNeeded, function(n, key) {
                var firstCut = _.trimLeft(key, 'SK_');
                spawnToUse = firstCut.slice(0,1);
            });
            
            if (_.size(SKSpawnsNeeded) > 0) {
                //console.log(ex(SKSpawnsNeeded));
                //console.log(spawnArray);
                //console.log(spawnsToUse);
            }
            
            var spawnString = 'Spawn' + spawnToUse;
            
            
            if (spawnString != 'Spawn' && _.startsWith(spawnName, spawnString)) {
                var firstToSpawn = SKSpawnsNeeded[_.first(Object.keys(SKSpawnsNeeded))][0];
                if (firstToSpawn == 'SKGuard') {
                    //console.log(spawnName + ' Spawnin me a SKGuard!');
                }
                else if (firstToSpawn == 'LDHauler') {
                    //console.log(spawnName + ' Spawnin me a LDHauler!');
                }
            }
            
            
            
//???
StructureSpawn.prototype.spawnRemoteIfNeeded = function() {
        var fullSpawnNumber = _.trimLeft(this.name, 'Spawn');
        var spawnNumber = fullSpawnNumber.slice(0, 1);
        var remoteFlags = _.filter(Game.flags, f => _.startsWith(f.name, 'Remote_' + spawnNumber));
        
        console.log(fullSpawnNumber);
        
        var remoteSpawnsNeeded = {};
        
        _.forEach(remoteFlags, function(n, key) {
            let LDMiners    = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'SKMiner');
            let LDHaulers   = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'LDHauler');
            let Claimers    = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'claimer');
            
            remoteSpawnsNeeded[n.name] = [];
            
            if (LDMiners < 1) {
                remoteSpawnsNeeded[n.name].push('LDMiner');
            }
            if (LDHaulers < 1) {
                remoteSpawnsNeeded[n.name].push('LDHauler');
            }
            if (Claimers < 1) {
                remoteSpawnsNeeded[n.name].push('claimer');
            }
        });
        
        var spawnerToUse;
        
        _.forEach(remoteSpawnsNeeded, function(n, key) {
            var firstCut = _.trimLeft(key, 'Remote_');
            spawnerToUse = firstCut.slice(0,1);
        });
        
        var spawnerString = 'Spawn' + spawnerToUse;
        var firstToSpawn;
        
        if (spawnerString != 'Spawn' && _.startsWith(this.name, spawnerString)) {
            firstToSpawn = remoteSpawnsNeeded[_.first(Object.keys(remoteSpawnsNeeded))][0];
            if (firstToSpawn == 'LDMiner') {
                console.log(this.name + ' Spawnin me a LDMiner!');
            }
            else if (firstToSpawn == 'LDHauler') {
                console.log(this.name + ' Spawnin me a LDHauler!');
            }
            else if (firstToSpawn == 'claimer') {
                console.log(this.name + ' Spawnin me a claimer!');
            }
        }
        
        
        return remoteFlags;
        
        /*
        _.forEach(remoteFlags, function(n, key) {
            let remoteMiners = _.sum(Game.creeps, (c) => c.memory.flagName == n.name && c.memory.role == 'LDMiner');
            let remoteHaulers = _.sum(Game.creeps, (c) => c.memory.flagName == n.name && c.memory.role == 'LDHauler');
            
            //console.log('miners: ' + remoteMiners + ' haulers: ' + remoteHaulers);
            
            if (remoteMiners < 1) {
                //var newCreepName = spawns[i].createLDMiner(energyMax, spawnRoom, n.pos.roomName, spawnRoom, n.name);
            }
            else if (remoteHaulers < 2) {
               // var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'LDHauler', spawnRoom, n.pos.roomName, n.name); 
            }
        });
        */
    };
            




//RANGED KITING CODE, ETC
global.REVERSE_DIRECTIONS = {
    1: BOTTOM,
    2: BOTTOM_LEFT,
    3: LEFT,
    4: TOP_LEFT,
    5: TOP,
    6: TOP_RIGHT,
    7: RIGHT,
    8: BOTTOM_RIGHT
}

var lookAtDirection = function(creep, direction) {
    switch (direction) {
        case TOP:
            var target = creep.room.lookAt(creep.pos.x, creep.pos.y - 1);
            break;
        case TOP_RIGHT:
            var target = creep.room.lookAt(creep.pos.x + 1, creep.pos.y - 1);
            break;
        case RIGHT:
            var target = creep.room.lookAt(creep.pos.x + 1, creep.pos.y);
            break;
        case BOTTOM_RIGHT:
            var target = creep.room.lookAt(creep.pos.x + 1, creep.pos.y + 1);
            break;
        case BOTTOM:
            var target = creep.room.lookAt(creep.pos.x, creep.pos.y + 1);
            break;
        case BOTTOM_LEFT:
            var target = creep.room.lookAt(creep.pos.x - 1, creep.pos.y + 1);
            break;
        case LEFT:
            var target = creep.room.lookAt(creep.pos.x - 1, creep.pos.y);
            break;
        case TOP_LEFT:
            var target = creep.room.lookAt(creep.pos.x - 1, creep.pos.y - 1);
            break;
    }
    
    return target;
}

module.exports.loop = function () {
    
    var creep = Game.creeps.Christopher;
    var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    
    creep.heal(creep);
    
    var creepX = creep.pos.x;
    var creepY = creep.pos.y;
    
    var arrayLookout = creep.room.lookAtArea(creepY - 1, creepX - 1, creepY + 1, creepX + 1, true);
    console.log(JSON.stringify(arrayLookout, null, 2));
    
    //var arrayLookout = creep.room.lookAtArea(10, 5, 11, 7);
    
    if (hostile) {
        var returnCode = creep.rangedAttack(hostile);
        if (returnCode == ERR_NOT_IN_RANGE) {
            creep.moveTo(hostile, {range: 3})
        }
        
        var hostileDirection = creep.pos.getDirectionTo(hostile);
        var reverseDirection = REVERSE_DIRECTIONS[hostileDirection];
        var lookout = lookAtDirection(creep, reverseDirection);
        
        if (_.first(lookout) && _.first(lookout).terrain != 'plain') {
            reverseDirection = reverseDirection + 1;
            if (reverseDirection == 9) {
                reverseDirection = 1;
            }
        }
        
        //console.log(reverseDirection);
        
        if (creep.hits < (creep.hits * 0.50)) {
            console.log('hp move');
            creep.move(reverseDirection);
        }
        
        if (creep.pos.getRangeTo(hostile) <= 2) {
            console.log('distance move');
            creep.move(reverseDirection);
        }
    }

}







