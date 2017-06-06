require('prototype.room');

module.exports = {
        
    balanceLinkEnergy: function(room) {
        if (room) {
            var links = room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => { 
                    structure.structureType == STRUCTURE_LINK
                }
            });
            
            //console.log(room + ' ' + links.length);
            
            if (links.length >= 2) {
                links.sort(function(a, b){return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]});
                
                if (links[0].cooldown == 0 && links[0].energy >= 200) {
                    links[0].transferEnergy(links[1], links[0].energy/2)
                }
            }
        }
        
    },  
        

    /**
     * Finds any buy orders for a given resource and sells that resource from
     * a targeted room, if it is a good enough deal.
     *
     * @param {String} resourceToSell One of the RESOURCE_* constants
     * @param {Room} room The room where the check should be made
     * @param {String} minPrice The minimum price acceptable for deal. Default 0.05
     * @param {Int} amountToSend the number of resourceToSell to sell
     * @returns {Int} Return code of Game.market.deal or -99 if no deal found
     */
    makeMarketSale: function (resourceToSell, room, minPrice = 0.05, amountToSend = 200) {
        if (room.terminal && room.terminal.store[RESOURCE_ENERGY] >= 500 && room.terminal.store[resourceToSell] >= 2000) { 
            
            var orders = Game.market.getAllOrders(order => order.resourceType == resourceToSell 
                && order.type == ORDER_BUY 
                && Game.market.calcTransactionCost(amountToSend, room.name, order.roomName) < 1500); 
            
            //console.log(resourceToSell + ' buy orders found: ' + orders.length);
            orders.sort(function(a,b){return b.price - a.price;}); 
            //console.log('Best price: ' + orders[0].price); 
            
            if (orders.length > 0) {
                if (orders[0].price >= minPrice) {
                    //console.log(resourceToSell + ' ' + amountToSend + ' ' + orders[0].price);
                    //Turned off until tested
                    var result = Game.market.deal(orders[0].id, amountToSend, room.name); 
                    //if (result === 0){console.log('Sold ' + amountToSend + ' ' + resourceToSell + '. Earned ' + amountToSend * orders[0].price + ' credits. (' + orders[0].price + ' each)')};
                    if (result === 0){console.log(`Sold ${amountToSend} ${resourceToSell} to ${room.name}.  Earned ${amountToSend * orders[0].price} credits. (${orders[0].price} each). Credits: ${(Game.market.credits).toFixed(2)}`)};
                }
            }
            else {
                return -99;
            }
        }
    },
    
    
    needsRemoteSpawning: function(spawnName) {
        var fullSpawnNumber = _.trimLeft(spawnName, 'Spawn');
        var spawnNumber = fullSpawnNumber.slice(0, 1);
        var remoteFlags = _.filter(Game.flags, f => _.startsWith(f.name, 'Remote_' + spawnNumber));
        
        var remoteSpawnsNeeded = {};
        
        _.forEach(remoteFlags, function(n, key) {
            let LDMiners    = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'LDMiner');
            let LDHaulers   = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'LDHauler');
            let Claimers    = _.sum(Game.creeps, (c) => c.memory.target == n.pos.roomName && c.memory.role == 'claimer');

            // If claim is greater than 2k, we don't need to spawn a claimer.
            // Check if we have room vision first.
            if (Game.rooms[n.pos.roomName] && Game.rooms[n.pos.roomName].controller.reservation){
                //console.log(ex(Game.rooms[n.pos.roomName].controller.reservation.ticksToEnd))
                var claimRoomReservation = Game.rooms[n.pos.roomName].controller.reservation.ticksToEnd;
                
                if (claimRoomReservation > 2000 && Claimers < 1) {
                    // Set to 1 so that a claimer isn't spawned.
                    Claimers = 1;
                }
            }

            //If a spawn is needed, create the array.
            if (LDMiners < 1 || LDHaulers < 1 || Claimers < 1) {
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
            }

        });
        
        var spawnerToUse;
        
        _.forEach(remoteSpawnsNeeded, function(n, key) {
            var firstCut = _.trimLeft(key, 'Remote_');
            spawnerToUse = firstCut.slice(0,1);
        });
        
        //if (_.size(remoteSpawnsNeeded) > 0 ) { console.log(spawnName + ' ' + spawnerToUse + ex(remoteSpawnsNeeded)); }
        
        var spawnerString = 'Spawn' + spawnerToUse;
        var firstToSpawn;
        var returnValue = {};
        var needsToSpawnSomething;
        
        if (spawnerString != 'Spawn' && _.startsWith(spawnName, spawnerString)) {
            needsToSpawnSomething = remoteSpawnsNeeded[_.first(Object.keys(remoteSpawnsNeeded))][0]    
        }
        
        if (spawnerString != 'Spawn' && _.startsWith(spawnName, spawnerString) && needsToSpawnSomething) {
            firstToSpawn = remoteSpawnsNeeded[_.first(Object.keys(remoteSpawnsNeeded))][0];
            var spawnFlag = _.first(Object.keys(remoteSpawnsNeeded));
            var spawnRoom = Game.flags[spawnFlag].pos.roomName;
            
            returnValue = {
                targetRoom: spawnRoom,
                creepToSpawn: firstToSpawn,
                flagName: spawnFlag
            }
            
            if (firstToSpawn == 'LDMiner') {
                //console.log(spawnName + ' Spawnin me a LDMiner!');
            }
            else if (firstToSpawn == 'LDHauler') {
                //console.log(spawnName + ' Spawnin me a LDHauler!');
            }
            else if (firstToSpawn == 'claimer') {
                //console.log(spawnName + ' Spawnin me a claimer!');
            }
        }
        
        return returnValue;
        
    },
    
    needsSKSpawning: function(spawnName) {
        var fullSpawnNumber = _.trimLeft(spawnName, 'Spawn');
        var spawnNumber = fullSpawnNumber.slice(0, 1);
        var remoteFlags = _.filter(Game.flags, f => _.startsWith(f.name, 'SK_' + spawnNumber));
        
        var remoteSpawnsNeeded = {};
        
        _.forEach(remoteFlags, function(n, key) {
            let SKGuards    = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'SKGuard');
            let LDHaulers   = _.sum(Game.creeps, (c) => c.memory.remoteFlag == n.name && c.memory.role == 'LDHauler');
            
            //If a spawn is needed, create the array.
            if (SKGuards < 1 || LDHaulers < 1) {
                remoteSpawnsNeeded[n.name] = [];
                
                if (SKGuards < 1) {
                    remoteSpawnsNeeded[n.name].push('SKGuard');
                }
                if (LDHaulers < 1) {
                    remoteSpawnsNeeded[n.name].push('LDHauler');
                }
            }
        });
        
        var spawnerToUse;
        
        _.forEach(remoteSpawnsNeeded, function(n, key) {
            var firstCut = _.trimLeft(key, 'SK_');
            spawnerToUse = firstCut.slice(0,1);
        });
        
        //if (_.size(remoteSpawnsNeeded) > 0 ) { console.log(spawnName + ' ' + spawnerToUse + ex(remoteSpawnsNeeded)); }
        
        var spawnerString = 'Spawn' + spawnerToUse;
        var firstToSpawn;
        var returnValue = {};
        var needsToSpawnSomething;
        
        if (spawnerString != 'Spawn' && _.startsWith(spawnName, spawnerString)) {
            needsToSpawnSomething = remoteSpawnsNeeded[_.first(Object.keys(remoteSpawnsNeeded))][0]    
        }
        
        if (spawnerString != 'Spawn' && _.startsWith(spawnName, spawnerString) && needsToSpawnSomething) {
            firstToSpawn = remoteSpawnsNeeded[_.first(Object.keys(remoteSpawnsNeeded))][0];
            var spawnFlag = _.first(Object.keys(remoteSpawnsNeeded));
            var spawnRoom = Game.flags[spawnFlag].pos.roomName;
            
            returnValue = {
                targetRoom: spawnRoom,
                creepToSpawn: firstToSpawn,
                flagName: spawnFlag
            }
        }
        
        return returnValue;
    },

    /**
     * Determines whether a structure of the given type can be built in the given room
     * based on the structure type limitations tied to the room's controller level.
     *
     * @param {String} structureType One of the STRUCTURE_* constants
     * @param {Room} room The room where the check should be made
     * @returns {boolean} True, if structures of the given type can still legally
     * be built in the given room, false otherwise
     */
    canBuildStructure: function (structureType, room) {
        var roomLevel = (room.controller ? room.controller.level : 0) + '';
        var currentAmount = this.countStructures(room, structureType, true);
        return _.has(CONTROLLER_STRUCTURES, structureType) &&
                _.has(CONTROLLER_STRUCTURES[structureType], roomLevel) &&
                currentAmount < CONTROLLER_STRUCTURES[structureType][roomLevel];
    },

    /**
     * Counts the amount of friendly creeps. The creeps that are included can
     * be narrowed down with the parameters.
     *
     * @param {Room} room If provided, only creeps in the given room are counted
     * @param {String|Array} roles The names of the roles the counted creeps must have,
     * or any falsy value to count all friendly creeps
     * @param {Function} predicate An additional filter that will be applied to the
     * search results. The function will receive a single creep as a parameter. The
     * creeps the predicate returns truthy for will be kept.
     * @returns {int}
     */
    countCreeps: function (room = null, roles = [], predicate = null) {
        if (_.isString(roles)) {
            roles = [roles];
        }

        let filter = function (creep) {
            return (_.isEmpty(roles) || _.contains(roles, creep.memory.role)) &&
                    (!_.isFunction(predicate) || predicate(creep));
        };

        if (room instanceof Room) {
            return room.find(FIND_MY_CREEPS, {filter: filter}).length;
        } else {
            return _.filter(Game.creeps, filter).length;
        }
    },

    /**
     * Counts the amount of structures (and possibly construction sites) of the given type
     * in the given room.
     *
     * @param {Room} room The room whose structures to count
     * @param {String} structureType One of the STRUCTURE_* constants
     * @param {Boolean} includeConstructionSites Whether to include construction sites or not
     * @returns {int}
     */
    countStructures: function (room, structureType, includeConstructionSites = false) {
        var count = room.find(FIND_STRUCTURES, {filter: s => s.structureType === structureType}).length;
        if (includeConstructionSites) {
            count += room.find(FIND_CONSTRUCTION_SITES, {filter: s => s.structureType === structureType}).length;
        }
        return count;
    },

    /**
     * Returns the closest structure from the given position that isn't already at
     * full energy capacity. Prioritizes towers, then spawns and extensions, then
     * other structures that can store energy.
     *
     * @param {RoomPosition} position The position to use as the source of the search
     * @param {String|Array} ignoreStructures One or more structure IDs to ignore in
     * the search
     * @returns {Structure} The closest structure that can receive energy. If the room
     * where the given position is located has no visibility, or if no structures
     * in the room can currently receive energy, this method returns null
     */
    findClosestEnergyDropOff: function (position, ignoreStructures = []) {
        if (_.isString(ignoreStructures)) {
            ignoreStructures = [ignoreStructures];
        }

        var room = Game.rooms[position.roomName];
        if (!room) {
            return null;
        }

        var structures = room.find(FIND_STRUCTURES, {
            filter: structure => {
                return structure.isFriendlyOrNeutral() && !_.contains(ignoreStructures, structure.id) &&
                        structure.canReceiveEnergy()
            }
        });

        var towers = _.filter(structures, s => s.structureType === STRUCTURE_TOWER);
        if (!_.isEmpty(towers)) {
            return position.findClosestByRange(towers);
        }

        var spawnsAndExtensions = _.filter(structures, s => {
            return s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION;
        });
        if (!_.isEmpty(spawnsAndExtensions)) {
            return position.findClosestByRange(spawnsAndExtensions);
        }

        return position.findClosestByRange(structures);
    },

    /**
     * Finds all hostile structures in the given room that can be destroyed (i.e. everything
     * except for the controller)
     *
     * @param {Room} room The room to perform the search in
     */
    findDestroyableHostileStructures: function (room) {
        if (_.isEmpty(room)) {
            return [];
        }

        return room.find(FIND_HOSTILE_STRUCTURES, {
            filter: structure => structure.structureType !== STRUCTURE_CONTROLLER
        });
    },

    /**
     * @returns {Array<Flag>}  All game flags located anywhere in the game world
     */
    getClaimFlags: function () {
        return _.filter(Game.flags, flag => _.startsWith(flag.name.toLowerCase(), 'claim'));
    },

    /**
     * @returns {Array<Room>} Returns an array of rooms that have a friendly controller in them
     */
    getMyRooms: function () {
        return _.filter(Game.rooms, room => room.isFriendly());
    },
};