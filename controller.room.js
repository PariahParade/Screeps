var utils = require('./utils');
require('./constants');

module.exports = {

    /**
     * Executes room-level tasks, e.g. building structures and roads.
     *
     * @param {Room} room The room whose tasks to take care of
     */
    run: function (room) {
        
        // Check for excess resources and sell them if needed.
        let excessResources = this.checkTerminalSurpluses(room);
        //console.log(_.has(excessResources, 'U'));
        //console.log(ex(excessResources));
        
        // For now, only sell Catalyst
        //if (_.has(excessResources, 'X')) { 
        //    this.sellExcessResources(excessResources, room);    
        //}
        
        
        //if (room.name == 'E81N33') { this.buildRoad(Game.spawns.Spawn6, Game.getObjectById('59180977ae6c725e61cbcfb2')); }
        
        // Test code to build roads. For now just builds a road from source to exit towards Spawn1
        //if (room.name == 'E83N34') {
        //    var sources = Game.rooms.E83N35.find(FIND_SOURCES)
        //    for (let i = 0; i < sources.length; i++) {
        //        this.buildRoad(Game.spawns.Spawn7, sources[i]);
        //    }
        //}
        
        //TEST
        //Level 5 construction sites for new room
        if (room.name == 'E83N34' && room.controller.level == 4 && Game.flags.Storage) {
            room.createConstructionSite(Game.flags.Storage, STRUCTURE_STORAGE);
            Game.flags.Storage.remove();
            
            var extensionFlags = _.filter(Game.flags, (flag) => flag.room && flag.room.name == room.name && _.startsWith(flag.name, 'ext'));
                
            for (var flag of extensionFlags) {
                room.createConstructionSite(flag, STRUCTURE_EXTENSION);
                flag.remove();    
            }    
        }
        
        // Balance the energy between links in the room
        this.balanceLinkEnergy(room);
        
        // Run reactions if needed.
        if (room.name == 'E87N32' || room.name == 'E88N32'){ this.runReactions(room); }
        
        
    },

    

    sellExcessResources: function(excessMaterials, room) {
        _.forEach(excessMaterials, function(n, key) {
            if (n > 100) {
                var minValue = 0.10;
                
                if (key == 'x') {
                    minValue = 0.35;
                }

                utils.makeMarketSale(key, room, minValue, n)
            }
        });
    },

    balanceLinkEnergy: function(room) {
        // Get all links in room
        var linksInRoom = Game.rooms[room.name].memory.links;
        
        // If there is more than one link
        if (Object.keys(linksInRoom).length >= 2) {
            var sourceLink = Game.getObjectById(_(linksInRoom).filter('sourceLink').pluck('id').first());
            
            var otherLinkIds = _.pluck(_.filter(linksInRoom, {'sourceLink': false }), 'id');
            var otherLinks = _.map(otherLinkIds, Game.getObjectById);
            
            var mostEmptyLink = _.min(otherLinks, 'energy');
            
            if (sourceLink.cooldown === 0) {
                sourceLink.transferEnergy(mostEmptyLink);
            }
        }
    },


    checkTerminalSurpluses: function(room) {
        if (room.terminal) {
            var resourceKeys = _.filter(_.keys(room.terminal.store), function(n) {
                return n != RESOURCE_ENERGY   
            }); 
            
            var excessMaterials = {};
            
            resourceKeys.forEach(function(resource) {
                if (room.terminal.store[resource] > TERMINAL_RESOURCE_EXCESS_MIN) {
                    let amountCanSell = room.terminal.store[resource] - TERMINAL_RESOURCE_EXCESS_MIN
                    excessMaterials[resource] = amountCanSell;
                }
            });
            
            return excessMaterials;
        }
    },


    /**
     * Creates constructions sites for roads between the given points.
     * The points have to be in the same room or in adjacent rooms.
     *
     * @param {ConstructionSite|Source|Structure} start Start point of the road
     * @param {ConstructionSite|Source|Structure} end End point of the road
     */
    buildRoad: function (start, end) {
        let memoryKey = `${start.id}_${end.id}`, inverseMemoryKey = `${end.id}_${start.id}`;
        if (_.has(Memory.rooms[start.pos.roomName].paths, memoryKey) ||
                _.has(Memory.rooms[start.pos.roomName].paths, inverseMemoryKey)) {
            // This path is already established, no need to do anything
            return;
        }

        var path = start.pos.findPathTo(end.pos, {ignoreCreeps: true});

        if (_.keys(Game.constructionSites).length + path.length > MAX_CONSTRUCTION_SITES) {
            console.log(`Can't build road between ${start.pos} and ${end.pos}, too many construction sites`);
            return;
        }

        let startX = start.pos.x, startY = start.pos.y, endX = _.last(path).x, endY = _.last(path).y;
        console.log(`${start.pos.roomName}: Building road from (${startX}, ${startY}) to (${endX}, ${endY})`);

        _.forEach(path, step => {
            let pos = new RoomPosition(step.x, step.y, start.pos.roomName);
            if (_.isEmpty(pos.lookFor(LOOK_CONSTRUCTION_SITES)) &&
                    _.isEmpty(_.filter(pos.lookFor(LOOK_STRUCTURES),
                            s => s.structureType === STRUCTURE_ROAD))) {
                pos.createConstructionSite(STRUCTURE_ROAD);
            }
        });

        Memory.rooms[start.pos.roomName].paths[memoryKey] = true;

        if (start.pos.roomName !== end.pos.roomName) {
            // Points are in different rooms, findPathTo() only goes to the room border.
            // In order to complete the road the other half needs to be built as well.
            this.buildRoad(end, start);
        }
    },
    
    runReactions: function (room) {
        var productLabIDs = _.pluck(_.filter(room.memory.labs, function(n) {return n.seedLab == false;}), 'id');
        var productLabs = _.map(productLabIDs, Game.getObjectById);
        
        var seedLabIDs = _.pluck(_.filter(room.memory.labs, function(n) {return n.seedLab == true;}), 'id');
        var seedLabs = _.map(seedLabIDs, Game.getObjectById);
        
        for(let lab of productLabs) {
            if (lab.cooldown == 0) {
                let errCode = lab.runReaction(seedLabs[0], seedLabs[1]);
            //    if (errCode != OK){ console.log('runReactions failed. LabID: ' + lab.id + 'errCode: ' + errCode); }
            }
        }
    },
    
    manageSpawning: function (room) {
        var energyMax =         room.energyCapacityAvailable;
        var currentEnergy =     room.energyAvailable;
        var expansionRoom =     room.memory.expansionRooms;
        var roomLevel =         room.controller.level;
        
        var spawnsInRoom = room.memory.spawns;
        
        
        //if (Object.keys(linksInRoom).length >= 2) {
        //    var sourceLink = Game.getObjectById(_(linksInRoom).filter('sourceLink').pluck('id').first());
            
        //    var otherLinkIds = _.pluck(_.filter(linksInRoom, {'sourceLink': false }), 'id');
        //    var otherLinks = _.map(otherLinkIds, Game.getObjectById);
            
        //    var mostEmptyLink = _.min(otherLinks, 'energy');
        //}
        
        // Set up basic spawn memory
        if (!room.memory.expansionRooms){room.memory.expansionRooms = {};}
        if (!room.memory.mineralSite){room.memory.mineralSite = room.find(FIND_MINERALS)[0].id;}
        //if (!spawn.memory.spawnQueue){spawn.memory.spawnQueue = [];}
        
        //var reservationEnd =    spawns[i].memory.expansionReservationEnd;
        var mineralSite =       Game.getObjectById(room.memory.mineralSite);


        if (energyMax >= 1950) { // Change this later, once I'm limiting by body parts.
            energyMax = 1950;
        }
        
        ////// In-Room extraction and Hauling
        var min_harvesters = roomLevel >= 4 ? 1 : 2;
        var min_miners = _.keys(room.memory.sources).length;
        var min_extractors = roomLevel >= 6 ? 1 : 0;
        var min_haulers = roomLevel >= 4 ? 2 : 0;
        var min_scientists = roomLevel >= 7 ? 1 : 0;
        
        ////// Building/Upgrading/Repair
        var min_builders = 1;
        var min_repairers = 1;
        var min_wallers = 0;
        var min_upgraders = roomLevel >= 4 ? 1 : 3;;
        
        
        ////// Long distance harvesting and building
        var min_claimers = roomLevel >=4 && expansionRooms.length > 0 ? expansionRooms.length : 0;
        var min_LDMiners = _.keys(expansionRoom.memory.sources).length || 0                        // Oh man this is hard. Sum expansion room sources
        var min_LDHaulers = min_LDMiners >= 1 ? 2 : 0                                             // Double hard. This might be its own method/algorithm.
        var min_longDistanceBuilders = room.controller.level >= 4 ? 1 : 0;
        
        
        //// Army
        var min_soldiers = 0;
        var min_guardians = 0;
        var min_fenceguards = 0;
        var min_medics = 0;
        var min_scouts = 0;
                

        var creepCounts = _(Game.creeps).filter(c => c.memory.spawnRoom == room.name).countBy('memory.role');
        var newCreepName;
        
        if (creepCounts.harvester < min_harvesters && creepCounts.miner < 2) {
            newCreepName = spawn.createCustomCreep(energyMax, 'harvester', spawn.name);

            // If number of harvesters gets very low, make whatever harvester we can.
            if (creepCounts.harvester < 1) {
                console.log("Ran dangerously low on harvesters in " + spawns[i].room.name + ". Force spawning one.");
                newCreepName = spawn.createCustomCreep(currentEnergy, 'harvester', spawn.name);
            }
        }
        else if (creepCounts.miner < min_miners) {
            newCreepName = spawn.createCustomCreep(energyMax, 'miner', spawn.name);        
        }
        else if (creepCounts.hauler < min_haulers && energyMax >= 800) {
            newCreepName = spawn.createHauler(energyMax, spawn.name);    
        } 
        else if (countCreeps.upgrader < min_upgraders) {
            newCreepName = spawn.createCustomCreep(energyMax, 'upgrader', spawn.name);
        }
        else if (countCreeps.builder < min_builders) {
            newCreepName = spawn.createCustomCreep(energyMax, 'builder', spawn.name);
        } 
        else if (countCreeps.longDistanceHarvester < min_longDistanceHarvesters) {
            // Change function to no longer request work parts. That shizz needs to be dynamic.
            newCreepName = spawn.createLongDistanceHarvester(energyMax, 3, room.name, expansionRoom, 0, spawn.name);
        }
        else if (countCreeps.extractor < min_extractors && mineralSite.mineralAmount > 0) {
            newCreepName = spawn.createCustomCreep(energyMax, 'extractor', spawn.name);
        }
        /*
        else if (soldierCount < min_soldiers && energyMax >= 1000 && (spawnName != 'Spawn3' && spawnName != 'Spawn4')) {
            var newCreepName = spawns[i].createAttackCreep(energyMax, home, 'E87N32', spawnName, 'soldier');
        }
        else if (guardianCount < min_guardians && energyMax >= 650 && spawnName == 'Spawn1') {
            var newCreepName = spawns[i].createAttackCreep(650, home, 'E87N32', spawnName, 'guardian');
        }
        else if (fenceGuardCount < min_fenceguards && energyMax >= 800 && spawnName == 'Spawn3') {
            var newCreepName = spawns[i].createFenceGuard(800, home, 'E87N32', spawnName);
        }
        */
        else if (countCreeps.claimer < min_claimers && (reservationEnd - Game.time < 1000)) { //&& Game.rooms[target].controller.reservation.ticksToEnd <= 1000  
            newCreepName = spawn.createClaimer(energyMax, room.name, expansionRoom, spawn.name);    
        }
        else if (countCreeps.repairer < min_repairers) {
            newCreepName = spawn.createCustomCreep(energyMax, 'repairer', spawn.name);
        } 
        else if (countCreeps.longDistanceBuilder < min_longDistanceBuilders && spawn.name != 'Spawn3') {
            newCreepName = spawn.createLongDistanceBuilder(900, 3, room.name, expansionRoom, spawn.name);
        } 
         
        else if (countCreeps.waller < min_wallers) {
            newCreepName = spawn.createCustomCreep(energyMax, 'waller', spawn.name);
        } 
        //else if (scoutCount < min_scouts) {
        //    var newCreepName = spawns[i].createScout(50, home, 'E87N32', spawnName);
        //} 
        else {
            max_creeps = true;
        }
        
    }
    
    //EXTRAS BLOCK HERE
    /*
    
    let spawnName =         spawns[i].name;
            let home =              spawns[i].room.name;
            let spawnRoom =         spawns[i].room.name;
            let energyMax =         spawns[i].room.energyCapacityAvailable;
            let currentEnergy =     spawns[i].room.energyAvailable;
            let target =            spawns[i].memory.expansionRoom;
            let roomLevel =         spawns[i].room.controller.level;
            if (!spawns[i].memory.expansionReservationEnd){spawns[i].memory.expansionReservationEnd = Game.time };
            let reservationEnd =    spawns[i].memory.expansionReservationEnd;
            let mineralSite =       spawns[i].room.find(FIND_MINERALS);
            let extractorExists =   spawns[i].room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTRACTOR }});


            //let claimersNeeded = spawns[i].room.memory.expansionRooms.length;
            


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

            
            if (!spawns[i].memory.buildRoom) {
                spawns[i].memory.buildRoom = spawns[i].memory.expansionRoom
            }
            
            
            
            if (energyMax >= 1950) { //1950
                energyMax = 1950;
            }
            
            
            // Creeps inside the room
            let harvesterCount      = _.sum(Game.creeps, (c) => c.memory.role == 'harvester' && c.memory.spawnRoom == spawnRoom);
            let builderCount        = _.sum(Game.creeps, (c) => c.memory.role == 'builder' && c.memory.spawnRoom == spawnRoom);
            let repairerCount       = _.sum(Game.creeps, (c) => c.memory.role == 'repairer' && c.memory.spawnRoom == spawnRoom);
            let upgraderCount       = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader' && c.memory.spawnRoom == spawnRoom);
            let wallerCount         = _.sum(Game.creeps, (c) => c.memory.role == 'waller' && c.memory.spawnRoom == spawnRoom);
            let minerCount          = _.sum(Game.creeps, (c) => c.memory.role == 'miner' && c.memory.spawnRoom == spawnRoom);
            let extractorCount      = _.sum(Game.creeps, (c) => c.memory.role == 'extractor' && c.memory.spawnRoom == spawnRoom);
            let haulerCount         = _.sum(Game.creeps, (c) => c.memory.role == 'hauler' && c.memory.spawnRoom == spawnRoom);
            let scientistCount      = _.sum(Game.creeps, (c) => c.memory.role == 'scientist' && c.memory.spawnRoom == spawnRoom);
            
            // Creeps that leave room
            let claimerCount        = _.sum(Game.creeps, (c) => c.memory.role == 'claimer' && c.memory.spawnRoom == spawnRoom);
            let LDMinerCount        = _.sum(Game.creeps, (c) => c.memory.role == 'LDMiner' && c.memory.spawnRoom == spawnRoom);
            let LDHaulerCount       = _.sum(Game.creeps, (c) => c.memory.role == 'LDHauler' && c.memory.spawnRoom == spawnRoom);
            let LDHarvesterCount    = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.spawnRoom == spawnRoom);
            let LDBuilderCount      = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.spawnRoom == spawnRoom);
            let scoutCount          = _.sum(Game.creeps, (c) => c.memory.role == 'scout' && c.memory.spawnRoom == spawnRoom);
            
            // Military
            let soldierCount        = _.sum(Game.creeps, (c) => c.memory.role == 'soldier' && c.memory.spawnRoom == spawnRoom);
            let guardianCount       = _.sum(Game.creeps, (c) => c.memory.role == 'guardian' && c.memory.spawnRoom == spawnRoom);
            let fenceGuardCount     = _.sum(Game.creeps, (c) => c.memory.role == 'fenceguard' && c.memory.spawnRoom == spawnRoom);
            let medicCount          = _.sum(Game.creeps, (c) => c.memory.role == 'medic');
            
            
            let quarantineCount     = _.sum(Game.creeps, (c) => c.memory.quarantineRoom && c.memory.role == 'claimer');
            
            var creepCounts = _(Game.creeps).filter(c => c.memory.spawnRoom == spawnRoom).countBy('memory.role');
            if (spawnRoom == 'E83N34'){
                //console.log(ex(creepCounts));
                //console.log(_.sum());
            }
    
    
            // REMOTE HARVEST TEST
            /*
            var spawnNumber = _.trimLeft(spawnName, 'Spawn');
            var remoteFlags = _.filter(Game.flags, f => _.startsWith(f.name, 'Remote_' + spawnNumber));
            
            _.forEach(remoteFlags, function(n, key) {
                let remoteMiners = _.sum(Game.creeps, (c) => c.memory.flagName == n.name && c.memory.role == 'LDMiner');
                let remoteHaulers = _.sum(Game.creeps, (c) => c.memory.flagName == n.name && c.memory.role == 'LDHauler');
                
                //console.log('miners: ' + remoteMiners + ' haulers: ' + remoteHaulers);
                
                if (remoteMiners < 1) {
                    var newCreepName = spawns[i].createLDMiner(energyMax, spawnRoom, n.pos.roomName, spawnRoom, n.name);
                }
                else if (remoteHaulers < 2) {
                    var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'LDHauler', spawnRoom, n.pos.roomName, n.name); 
                }
            });
            
            
            */
            // END REMOTE HARVEST TEST
            
            
/*            
            //if (send_scouts == true && scoutCount < 2 && _.startsWith(spawnName, 'Spawn7')) {
            //    var newCreepName = spawns[i].createCustomCreep(50, 'scout', spawnRoom, spawns[i].memory.expansionRoom);
            //}
            if (send_scouts == true && claimerCount < 1 && _.startsWith(spawnName, 'Spawn7') && minerCount == 2) {
                var newCreepName = spawns[i].createClaimer(1300, home, spawns[i].memory.expansionRoom, spawnRoom, spawnName);    
            }
            else if (at_war == true && soldierCount < 2 && _.startsWith(spawnName, 'Spawn4')) {
                var newCreepName = spawns[i].createCustomCreep(4250, 'soldier', spawnRoom);
                console.log('soldier?');
                //if (_.startsWith(newCreepName, 'soldier')) {
                //    let soldiersCreated = spawns[i].memory.soldierCount;
                //    soldiersCreated = soldiersCreated + 1;
                //    spawns[i].memory.soldierCount = soldiersCreated;    
                //}
            }
            else if (at_war == true && fenceGuardCount < 2 && _.startsWith(spawnName, 'Spawn7') && minerCount == 2) {
                var newCreepName = spawns[i].createFenceGuard(1100, home, 'E83N34', spawnRoom);
            }
            else if (at_war == true && wallerCount < 3 && _.startsWith(spawnName, 'Spawn7') && minerCount == 2) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'waller', spawnRoom);
            }
            //else if (at_war == true && soldierCount < 2 && _.startsWith(spawnName, 'Spawn2'))) {
            //    var newCreepName = spawns[i].createCustomCreep(2080, 'soldier', spawnRoom);
            //}
            //else if (at_war == true && medicCount < 2 && (_.startsWith(spawnName, 'Spawn5') || _.startsWith(spawnName, 'Spawn2'))) {
                //console.log(home + ' trying to spawn medic');
            //    var newCreepName = spawns[i].createCustomCreep(2200, 'medic', spawnRoom);
            //}
            else if (defense_reserve == true && quarantineCount < 1 && _.startsWith(spawnName, 'Spawn4')) {
                //console.log('quarantine');
                var newCreepName = spawns[i].createClaimer(1300, home, 'E83N34', spawnRoom, spawnName, 'E83N34');
            }
            else if (harvesterCount < min_harvesters || (spawns[i].room.controller.level <= 3 && harvesterCount < (min_harvesters+2))) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'harvester', spawnRoom);
    
                // If number of harvesters gets very low, make whatever harvester we can.
                if (harvesterCount < 1 || (minerCount == 0 && harvesterCount < 3)) {
                    //console.log("Ran dangerously low on harvesters in " + spawns[i].room.name + ". Force spawning one.");
                    newCreepName = spawns[i].createCustomCreep(spawns[i].room.energyAvailable, 'harvester', spawnRoom);
                }
            }
            else if ((minerCount < min_miners && spawnName != 'Spawn3') || (spawnName == 'Spawn3' && minerCount < 1)) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'miner', spawnRoom);        
            }
            else if ((haulerCount < min_haulers
                    || (_.startsWith(spawnName, 'Spawn1') && haulerCount < (min_haulers))
                    || (_.startsWith(spawnName, 'Spawn6') && haulerCount < (min_haulers+1))
                    || (_.startsWith(spawnName, 'Spawn7') && haulerCount < (min_haulers+1))
                    )
                    && energyMax >= 800) {
                var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'hauler');    
            } 
            else if (upgraderCount < min_upgraders 
                    || (spawns[i].room.controller.level <= 3 && upgraderCount < (min_upgraders+2))
                    || (_.startsWith(spawnName, 'Spawn4') && upgraderCount < (min_upgraders))
                    || (_.startsWith(spawnName, 'Spawn1') && upgraderCount < (min_upgraders+3))
                    || (_.startsWith(spawnName, 'Spawn5') && upgraderCount < (min_upgraders+1))
                    || (_.startsWith(spawnName, 'Spawn2') && upgraderCount < (min_upgraders+1))
                    || (_.startsWith(spawnName, 'Spawn6') && upgraderCount < (min_upgraders+3))
                    || (_.startsWith(spawnName, 'Spawn7') && upgraderCount < (min_upgraders))
                    ){
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'upgrader', spawnRoom);
            }
            else if (scientistCount < min_scientists && energyMax >= 800 && (_.startsWith(spawnName, 'Spawn2') || _.startsWith(spawnName, 'Spawn1'))) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'scientist', spawnRoom);
            }
            else if ((builderCount < min_builders
                    || (spawns[i].room.controller.level <= 3 && builderCount < (min_builders+1)))
                    &&  _.find(Game.constructionSites, 'pos.roomName', home)) {
                        
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'builder', spawnRoom);
            }
            else if (guardianCount < min_guardians && spawns[i].memory.expansionRoom && energyMax > 780 
                    && (!_.startsWith(spawnName, 'Spawn3') && !_.startsWith(spawnName, 'Spawn5') && !_.startsWith(spawnName, 'Spawn1'))) {
                        
                if (energyMax >= 1210) {
                    var newCreepName = spawns[i].createAttackCreep(1210, home, spawns[i].memory.expansionRoom, spawnRoom, 'guardian');    
                }
                else if (energyMax >= 780) {
                    var newCreepName = spawns[i].createAttackCreep(780, home, spawns[i].memory.expansionRoom, spawnRoom, 'guardian');
                }
            }
            else if (((LDMinerCount < min_LDMiners && (!_.startsWith(spawnName, 'Spawn2') && !_.startsWith(spawnName, 'Spawn1'))) 
                            || ((_.startsWith(spawnName, 'Spawn2') || _.startsWith(spawnName, 'Spawn1')) && LDMinerCount < min_LDMiners - 1))
                            && (!_.startsWith(spawnName, 'Spawn5') && spawnName != 'Spawn3')) {
                var newCreepName = spawns[i].createLDMiner(energyMax, spawns[i].room.name, spawns[i].memory.expansionRoom, spawnRoom); 
            }
            else if (((LDHaulerCount < min_LDHaulers && (!_.startsWith(spawnName, 'Spawn2') && !_.startsWith(spawnName, 'Spawn1'))) 
                    || ((_.startsWith(spawnName, 'Spawn2') || _.startsWith(spawnName, 'Spawn1')) && LDHaulerCount < min_LDHaulers - 1))
                        && (!_.startsWith(spawnName, 'Spawn5') && spawnName != 'Spawn3')) {
                var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'LDHauler', spawns[i].room.name, spawns[i].memory.expansionRoom); 
            }
            else if (_.startsWith(spawnName, 'Spawn6') && LDHaulerCount < min_LDHaulers+1){
                var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'LDHauler', spawns[i].room.name, spawns[i].memory.expansionRoom);
            }
            //else if (LDHarvesterCount < min_longDistanceHarvesters && energyMax >= 800 && (spawnName != 'Spawn5' && spawnName != 'Spawn2' && spawnName != 'Spawn3')) {
            //    var newCreepName = spawns[i].createLongDistanceHarvester(energyMax, 3, home, spawns[i].memory.expansionRoom, 0, spawnName);
            //}
            else if (extractorCount < min_extractors && energyMax >= 1000 && mineralSite[0].mineralAmount > 0 && spawns[i].room.controller.level >= 6) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'extractor', spawnRoom);
            }
            else if (soldierCount < min_soldiers && energyMax >= 1000 && _.startsWith(spawnName, 'Spawn2')) {
                var newCreepName = spawns[i].createAttackCreep(energyMax, home, 'E87N34', spawnRoom, 'soldier');
            }
            else if (fenceGuardCount < min_fenceguards && energyMax >= 950 && (_.startsWith(spawnName, 'Spawn4') || _.startsWith(spawnName, 'Spawn2'))) {
                var newCreepName = spawns[i].createFenceGuard(950, home, 'E83N33', spawnRoom);
            }
            //else if (numberOfTransporters < min_transporters && numberOfMiners > 1) {
            //    var newCreepName = Game.spawns.Spawn1.createTransporter(energy1);
            //}
            else if (claimerCount < min_claimers && energyMax >= 1300 && (reservationEnd - Game.time < 3000) && (spawnName != 'Spawn3' && !_.startsWith(spawnName, 'Spawn5'))) { 
                var newCreepName = spawns[i].createClaimer(energyMax, home, spawns[i].memory.expansionRoom, spawnRoom, spawnName);    
            }
            else if (repairerCount < min_repairers) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'repairer', spawnRoom);
            } 
            else if (LDBuilderCount < min_longDistanceBuilders && energyMax >= 800 
                        && _.find(Game.constructionSites, 'pos.roomName', spawns[i].memory.expansionRoom) //Sites exist in expansion room 
                        && (spawnName != 'Spawn3' && !_.startsWith(spawnName, 'Spawn5'))) {
                console.log(home + ': building LDBuilder');                            
                var newCreepName = spawns[i].createLongDistanceBuilder(energyMax, 3, home, spawns[i].memory.expansionRoom, spawnRoom);
            } 
             
            else if (wallerCount < min_wallers && (_.startsWith(spawnName, 'Spawn2'))) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'waller', spawnRoom);
            } 
            //else if (scoutCount < min_scouts) {
            //    var newCreepName = spawns[i].createScout(50, home, 'E87N32', spawnName);
            //} 
            else {
                max_creeps = true;
            }
        }
    
    */
    
    
    
    
    
    

};