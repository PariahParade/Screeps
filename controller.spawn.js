/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('controller.spawn');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    
    
    run: function (spawn) {
        var energyMax =         spawn.room.energyCapacityAvailable;
        var currentEnergy =     spawn.room.energyAvailable;
        var expansionRoom =     spawn.memory.expansionRoom;
        var roomLevel =         spawn.room.controller.level;
        
        // Set up basic spawn memory
        if (!spawn.memory.expansionReservationEnd){spawn.memory.expansionReservationEnd = Game.time;}
        if (!spawn.memory.mineralSite){spawn.memory.mineralSite = spawn.room.find(FIND_MINERALS)[0].id;}
        if (!spawn.memory.spawnQueue){spawn.memory.spawnQueue = [];}
        
        var reservationEnd =    spawns[i].memory.expansionReservationEnd;
        var mineralSite =       Game.getObjectById(spawns[i].memory.mineralSite);


        if (energyMax >= 1950) { // Change this later, once I'm limiting by body parts.
            energyMax = 1950;
        }
        
        ////// In-Room extraction and Hauling
        var min_harvesters = roomLevel >= 4 ? 1 : 2;
        var min_miners = _.keys(Game.rooms[spawn.room.name].memory.sources).length;
        var min_extractors = roomLevel >= 6 ? 1 : 0;
        var min_haulers = roomLevel >= 4 ? 2 : 0;
        
        ////// Building/Upgrading/Repair
        var min_builders = 1;
        var min_repairers = 1;
        var min_wallers = 0;
        var min_upgraders = roomLevel >= 4 ? 1 : 3;;
        
        
        ////// Long distance harvesting and building
        var min_claimers = roomLevel >=4 && expansionRoom ? 1 : 0;
        var min_LDMiners = _.keys(expansionRoom.memory.sources).length || 0
        var min_LDHaulers = min_LDMiners >= 1 ? 2 : 0
        var min_longDistanceBuilders = room.controller.level >= 4 ? 1 : 0;
        
        
        //// Army
        var min_soldiers = 0;
        var min_guardians = 0;
        var min_fenceguards = 0;
        var min_scouts = 0;
                

        var creepCounts = _(Game.creeps).filter(c => c.memory.sourceSpawn == spawn.).countBy('memory.role');
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

        
        
        
        
        
        
        
    },
    

};