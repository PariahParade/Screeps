require('prototype.spawn')();
require('prototype.creep');
require('prototype.tower');
//require('logging');
//require('progressBar');



// Any modules that you use that modify the game's prototypes should be required
// before you require the profiler.
const profiler = require('screeps-profiler');
//const diagnostics = require('diagnostics');
var utils = require('./utils');
var memoryManagement = require('./utils.manageMemory');
const screepsPlus = require('screepsplus');
const roomController = require('controller.room');

var diagnosticSpam = false;

var min_harvesters = 1;
var min_miners = 2;
var min_extractors = 1;
var min_haulers = 2;

var min_builders = 1;
var min_repairers = 1;
var min_wallers = 0;
var min_upgraders = 1;

var min_transporters = 0;
var min_claimers = 1;

var min_longDistanceHarvesters = 2;
var min_longDistanceBuilders = 1;

var min_soldiers = 0;
var min_guardians = 1;
var min_fenceguards = 0;
var min_scouts = 0;

var min_LDMiners = 2;
var min_LDHaulers = 3;

var min_scientists = 1;

var at_war = false; // = true;
var defense_reserve = false;
var send_scouts = false;

var max_creeps = false;

// Global function to pretty-print JSON objects
global.ex = (x) => JSON.stringify(x, null, 2);

/**
 * let [resA,resB] = RECIPES[compound];
 */
global.RECIPES = {};
for(var a in REACTIONS){
    for(var b in REACTIONS[a]){
        RECIPES[REACTIONS[a][b]] = [a,b];
    }
}


// This line monkey patches the global prototypes.
profiler.enable();

module.exports.loop = function() {
    profiler.wrap(function() {
    
        // Delete old creeps and rooms from memory.
        var deadCreeps = memoryManagement.deleteOldMemory();
        if (deadCreeps.length > 0 ) {console.log(deadCreeps);}
        
        // Update room memory if needed
        var errorText = memoryManagement.updateMemory();
        //if (errorText.length > 0) {console.log(errorText);}
        
        // Run room controller for every room in Game.rooms that is ours
        // Setup paths memory if it doesn't exist. (NYI)
        _.forEach(utils.getMyRooms(), room => {
            if (_.isUndefined(room.memory.paths)) {
                room.memory.paths = {};
            }
            roomController.run(room);
        });
        
        // Find all towers, set them to defend room.
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
        for (let i = 0, len = towers.length; i < len; i++) {
            towers[i].defendRoom();
        }
    
        var creepCPU = {};
        
        // Execute given code/roles to all creeps.
        for (let name in Game.creeps) {
            
            creepCPU[name] = {};
            
            var startCpu = Game.cpu.getUsed();
            Game.creeps[name].runRole();
            var elapsed = Game.cpu.getUsed() - startCpu;
            
            creepCPU[name].role = Game.creeps[name].memory.role;
            creepCPU[name].usedCPU = elapsed;
        }
        
        // Set to memory the average CPU use of each role type.
        var creepCPUs = _.groupBy(creepCPU, 'role');
        var cpuCounts = _.mapValues(creepCPUs, c=> _.sum(c, 'usedCPU'))
        Memory.stats.creepCPU = cpuCounts;
        //console.log(ex(cpuCounts));
        
        
        // Spawning Creeps
        var spawns = _.filter(Game.structures, s => s.structureType == STRUCTURE_SPAWN);
        
        for (let i = 0; i < spawns.length; i++) {
            let spawnName =         spawns[i].name;
            let home =              spawns[i].room.name;
            let spawnRoom =         spawns[i].room.name;
            let guardRoom =         spawns[i].memory.guardRoom || spawns[i].memory.expansionRoom;
            let energyMax =         spawns[i].room.energyCapacityAvailable;
            let currentEnergy =     spawns[i].room.energyAvailable;
            let target =            spawns[i].memory.expansionRoom;
            let roomLevel =         spawns[i].room.controller.level;
            if (!spawns[i].memory.expansionReservationEnd){spawns[i].memory.expansionReservationEnd = Game.time };
            let reservationEnd =    spawns[i].memory.expansionReservationEnd;
            let mineralSite =       spawns[i].room.find(FIND_MINERALS);
            let extractorExists =   spawns[i].room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_EXTRACTOR }});



            if (!spawns[i].memory.buildRoom) {
                spawns[i].memory.buildRoom = spawns[i].memory.expansionRoom
            }
            
            if (energyMax >= 2500) { //1950
                energyMax = 2500;
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
            
            
            // If storage is nearly full, spawn more upgraders
            if (Game.rooms[spawnRoom].storage && Game.rooms[spawnRoom].storage.store.energy > 500000) {
                upgraderCount = upgraderCount - 1;
            }
            
            
            // -----REMOTE MINING/HAULER/CLAIMER SPAWN CHECK------------------
            var remoteSpawnNeeded = utils.needsRemoteSpawning(spawnName);
            if (_.size(remoteSpawnNeeded) > 0){
                //console.log(spawnName + ' ' + ex(remoteSpawnNeeded));    
            }
            
            // -----SOURCE KEEPER ROOM SPAWNING CHECK-------------------------
            var SKSpawnsNeeded = utils.needsSKSpawning(spawnName);
            if (_.size(SKSpawnsNeeded) > 0) {
                //console.log(spawnName + ' ' + ex(SKSpawnsNeeded));
            }
            
            
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
                    || (_.startsWith(spawnName, 'Spawn6') && haulerCount < (min_haulers))
                    || (_.startsWith(spawnName, 'Spawn7') && haulerCount < (min_haulers))
                    )
                    && energyMax >= 800) {
                var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'hauler');    
            } 
            else if (upgraderCount < min_upgraders 
                    || (spawns[i].room.controller.level <= 3 && upgraderCount < (min_upgraders+2))
                    || (_.startsWith(spawnName, 'Spawn4') && upgraderCount < (min_upgraders))
                    || (_.startsWith(spawnName, 'Spawn1') && upgraderCount < (min_upgraders+1))
                    || (_.startsWith(spawnName, 'Spawn5') && upgraderCount < (min_upgraders+1))
                    || (_.startsWith(spawnName, 'Spawn2') && upgraderCount < (min_upgraders+1))
                    || (_.startsWith(spawnName, 'Spawn6') && upgraderCount < (min_upgraders))
                    || (_.startsWith(spawnName, 'Spawn7') && upgraderCount < (min_upgraders+1))
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
            else if (guardianCount < min_guardians && spawns[i].memory.expansionRoom && energyMax > 790 
                    && (!_.startsWith(spawnName, 'Spawn3') && !_.startsWith(spawnName, 'Spawn5') && !_.startsWith(spawnName, 'Spawn1'))) {

                var newCreepName = spawns[i].createGuardian(energyMax, home, guardRoom, spawnRoom, 'guardian');
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
            else if (_.size(remoteSpawnNeeded) > 0){
                switch(remoteSpawnNeeded.creepToSpawn) {
                    case 'LDMiner':
                        var newCreepName = spawns[i].createLDMiner(energyMax, spawns[i].room.name, remoteSpawnNeeded.targetRoom, '', remoteSpawnNeeded.flagName); 
                        break;
                    case 'LDHauler':
                        var newCreepName = spawns[i].createHauler(energyMax, '', 'LDHauler', spawns[i].room.name, remoteSpawnNeeded.targetRoom, remoteSpawnNeeded.flagName); 
                        break;
                    case 'claimer':
                        var newCreepName = spawns[i].createClaimer(energyMax, spawns[i].room.name, remoteSpawnNeeded.targetRoom, '', spawnName, '', remoteSpawnNeeded.flagName);    
                        break;
                }
            }
            else if (_.startsWith(spawnName, 'Spawn6') && LDHaulerCount < min_LDHaulers+1){
                var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'LDHauler', spawns[i].room.name, spawns[i].memory.expansionRoom);
            }
            /*
            else if (_.size(SKSpawnsNeeded) > 0) {
                switch(SKSpawnsNeeded.creepToSpawn) {
                    case 'SKGuard':
                        var newCreepName = spawns[i].createSKGuard(energyMax, spawns[i].room.name, SKSpawnsNeeded.targetRoom, spawnRoom, SKSpawnsNeeded.flagName); 
                        break;
                    case 'LDHauler':
                        var newCreepName = spawns[i].createHauler(energyMax, spawnRoom, 'LDHauler', spawns[i].room.name, SKSpawnsNeeded.targetRoom, SKSpawnsNeeded.flagName); 
                        break;
                }    
            }
            */
            else if (extractorCount < min_extractors && energyMax >= 1000 && mineralSite[0].mineralAmount > 0 && spawns[i].room.controller.level >= 6) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'extractor', spawnRoom);
            }
            else if (soldierCount < min_soldiers && energyMax >= 1000 && _.startsWith(spawnName, 'Spawn2')) {
                var newCreepName = spawns[i].createAttackCreep(energyMax, home, 'E87N34', spawnRoom, 'soldier');
            }
            //else if (fenceGuardCount < min_fenceguards && energyMax >= 950 && (_.startsWith(spawnName, 'Spawn4') || _.startsWith(spawnName, 'Spawn2'))) {
            //    var newCreepName = spawns[i].createFenceGuard(950, home, 'E83N33', spawnRoom);
            //}
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
                max_creeps = true
            }
        }
    
    
        if (diagnosticSpam) {
            diagnostics.countCreeps();
        }
        
        
        //screepsPlus.collect_stats();
        Memory.stats.totalCPU = Game.cpu.getUsed();
        //console.log('totalCPU: ' + Game.cpu.getUsed());

        
    });
    
}
