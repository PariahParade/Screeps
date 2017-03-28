require('prototype.spawn')();
require('prototype.creep');
require('prototype.tower');


// Any modules that you use that modify the game's prototypes should be required
// before you require the profiler.
const profiler = require('screeps-profiler');
const diagnostics = require('diagnostics');
const utils = require('utils');
const roomController = require('controller.room');

var diagnosticSpam = false;

var min_harvesters = 1;
var min_miners = 2;
var min_extractors = 1;
var min_haulers = 3;

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
var min_fenceguards = 1;
var min_scouts = 0;

var max_creeps = false;


// This line monkey patches the global prototypes.
profiler.enable();

module.exports.loop = function() {
    profiler.wrap(function() {
        
        //Clear dead creep memory
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined) {
                console.log(name + " has died.");
                delete Memory.creeps[name];
            }
        }
        
        //Lets first add a shortcut prototype to the sources memory:
        Source.prototype.memory = undefined;
        //StructureSpawn.prototype.memory = undefined;
        
        for(var roomName in Game.rooms){//Loop through all rooms your creeps/structures are in
            var room = Game.rooms[roomName];
            
            
            // Add spawns into memory
            if(!room.memory.spawns) {
                room.memory.spawns = {};
                let spawners = room.find(FIND_MY_SPAWNS);
                for (var i in spawners) {
                    let thisSpawn = spawners[i];
                    thisSpawn.memory = room.memory.spawns[thisSpawn.id] = {};
                    
                }
            }
            
            // Add sources into memory
            if(!room.memory.sources){//If this room has no sources memory yet
                room.memory.sources = {}; //Add it
                var sources = room.find(FIND_SOURCES);//Find all sources in the current room
                for(var i in sources){
                    var source = sources[i];
                    source.memory = room.memory.sources[source.id] = {}; //Create a new empty memory object for this source
                    //Now you can do anything you want to do with this source
                    //for example you could add a worker counter:
                    source.memory.workers = 0;
                }
            }/*
            else{ //The memory already exists so lets add a shortcut to the sources its memory
                var sources = room.find(FIND_SOURCES);//Find all sources in the current room
                for(var i in sources){
                    var source = sources[i];
                    source.memory = room.memory.sources[source.id]; //Set the shortcut
                }
            }*/
            
            // Add links into memory
            if(!room.memory.links || Game.time % 100 == 0) {
                room.memory.links = {};
                let roomLinks = room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_LINK }
                });
                for (var i in roomLinks) {
                    let thisLink = roomLinks[i];
                    thisLink.memory = room.memory.links[thisLink.id] = {};
                    
                }
            }
            
            // Add containers into memory. Only do this every 100 ticks
            if(Game.time % 500 == 0) {
                room.memory.containers = {};
                var containers = room.find(FIND_STRUCTURES, {
                    filter: { structureType: STRUCTURE_CONTAINER }
                });
                for(let i in containers) {
                    let container = containers[i];
                    container.memory = room.memory.containers[container.id] = {};
                }
            }
        }
        
        _.forEach(utils.getMyRooms(), room => {
            if (_.isUndefined(room.memory.paths)) {
                room.memory.paths = {};
            }
            roomController.run(room);
        });
        
        /*
        _.forEach(utils.getMyRooms(), room => {
            roomController.run(room);
        });
        */
        
        let allRooms = utils.getMyRooms();
        allRooms.forEach(function(targetRoom) {
            //console.log(targetRoom);
            if (targetRoom.terminal) {
                var resourceKeys = _.filter(_.keys(targetRoom.terminal.store), function(n) {
                    return n != RESOURCE_ENERGY   
                }); 
                
                resourceKeys.forEach(function(resource) {
                    if (targetRoom.terminal.store[resource] > 10000) {
                        let amountCanSell = targetRoom.terminal.store[resource] - 9000
                        utils.makeMarketSale(resource, targetRoom, 0.05, amountCanSell)
                        //console.log(targetRoom.name + ' can sell ' + amountCanSell + ' ' + resource);
                    }
                });
            }
        });

        //market sell test
        //utils.makeMarketSale('U', Game.rooms.E88N32, 0.4, 200)
        
    
        // Find all towers, set them to defend room.
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
        for (let tower of towers) {
            tower.defendRoom();
        }
    
        // Execute given code/roles to all creeps.
        for (let name in Game.creeps) {
            Game.creeps[name].runRole();
        }
        
        // Link balancer
        for (let room of _.toArray(Game.rooms)) {
            //console.log(room);
            //utils.balanceLinkEnergy(room);
        }
    
        //console.log(JSON.stringify(Memory.creeps));
    
        // Spawning Creeps
        var spawns = _.filter(Game.structures, s => s.structureType == STRUCTURE_SPAWN);
    
        for (let i = 0; i < spawns.length; i++) {
            let spawnName =         spawns[i].name;
            let home =              spawns[i].room.name;
            let energyMax =         spawns[i].room.energyCapacityAvailable;
            let currentEnergy =     spawns[i].room.energyAvailable;
            let target =            spawns[i].memory.expansionRoom;
            if (!spawns[i].memory.expansionReservationEnd){spawns[i].memory.expansionReservationEnd = Game.time };
            let reservationEnd =    spawns[i].memory.expansionReservationEnd;
            let mineralSite =       spawns[i].room.find(FIND_MINERALS);
            
            //console.log(energyMax);
            
            if (energyMax >= 1500) {
                energyMax = 1500;
            }
            
            
            
            
            //console.log(spawnName + " has a max energy of " + energyMax);
            
            let harvesterCount      = _.sum(Game.creeps, (c) => c.memory.role == 'harvester' && c.memory.sourceSpawn == spawnName);
            let builderCount        = _.sum(Game.creeps, (c) => c.memory.role == 'builder' && c.memory.sourceSpawn == spawnName);
            let repairerCount       = _.sum(Game.creeps, (c) => c.memory.role == 'repairer' && c.memory.sourceSpawn == spawnName);
            let upgraderCount       = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader' && c.memory.sourceSpawn == spawnName);
            let wallerCount         = _.sum(Game.creeps, (c) => c.memory.role == 'waller' && c.memory.sourceSpawn == spawnName);
            let minerCount          = _.sum(Game.creeps, (c) => c.memory.role == 'miner' && c.memory.sourceSpawn == spawnName);
            let extractorCount      = _.sum(Game.creeps, (c) => c.memory.role == 'extractor' && c.memory.sourceSpawn == spawnName);
            let transporterCount    = _.sum(Game.creeps, (c) => c.memory.role == 'transporter' && c.memory.sourceSpawn == spawnName);
            let claimerCount        = _.sum(Game.creeps, (c) => c.memory.role == 'claimer' && c.memory.sourceSpawn == spawnName);
            let guardianCount       = _.sum(Game.creeps, (c) => c.memory.role == 'guardian' && c.memory.sourceSpawn == spawnName);
            let LDHarvesterCount    = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.sourceSpawn == spawnName);
            let LDBuilderCount      = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.sourceSpawn == spawnName);
            let fenceGuardCount     = _.sum(Game.creeps, (c) => c.memory.role == 'fenceguard' && c.memory.sourceSpawn == spawnName);
            let scoutCount          = _.sum(Game.creeps, (c) => c.memory.role == 'scout' && c.memory.sourceSpawn == spawnName);
            let haulerCount         = _.sum(Game.creeps, (c) => c.memory.role == 'hauler' && c.memory.sourceSpawn == spawnName);
            let soldierCount        = _.sum(Game.creeps, (c) => c.memory.role == 'soldier' && c.memory.sourceSpawn == spawnName);
    
            
            if (false){ //spawnName === 'Spawn2' && Game.time % 5 == 0) {
                console.log('harvesters: ' + harvesterCount);
                console.log('miners: ' + minerCount);
                console.log('builders: ' + builderCount);
                console.log('haulers: ' + haulerCount);
                console.log('LDHarvesters: ' + LDHarvesterCount);
                console.log('LDBuilders: ' + LDBuilderCount);
                console.log('claimers: ' + claimerCount);
            }
    
            //console.log(spawnName + " has " + claimerCount + " claimers.");
            
            //console.log(spawnName + ": " + currentEnergy);
            //console.log(spawnName + ' ' + mineralSite[0].mineralAmount);
            
            if ((harvesterCount < min_harvesters && minerCount < 2) && spawnName != 'Spawn2') {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'harvester', spawnName);
    
                // If number of harvesters gets very low, make whatever harvester we can.
                if (harvesterCount < 1) {
                    console.log("Ran dangerously low on harvesters in " + spawns[i].room.name + ". Force spawning one.");
                    newCreepName = spawns[i].createCustomCreep(spawns[i].room.energyAvailable, 'harvester', spawnName);
                }
            }
            else if ((minerCount < min_miners && spawnName != 'Spawn3') || (spawnName == 'Spawn3' && minerCount < 1)) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'miner', spawnName);        
            }
            else if (haulerCount < min_haulers && energyMax >= 800) {
                var newCreepName = spawns[i].createHauler(energyMax, spawnName);    
            } 
            else if (upgraderCount < min_upgraders) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'upgrader', spawnName);
            }
            else if (builderCount < min_builders || (spawnName == 'Spawn4' && builderCount < (min_builders + 1))) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'builder', spawnName);
            } 
            else if (LDHarvesterCount < min_longDistanceHarvesters && energyMax >= 800 ) {
                var newCreepName = spawns[i].createLongDistanceHarvester(energyMax, 3, home, spawns[i].memory.expansionRoom, 0, spawnName);
            }
            else if (extractorCount < min_extractors && energyMax >= 800 && mineralSite[0].mineralAmount > 0  && (spawnName != 'Spawn3' && spawnName != 'Spawn4')) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'extractor', spawnName);
            }
            else if (soldierCount < min_soldiers && energyMax >= 1000 && (spawnName != 'Spawn3' && spawnName != 'Spawn4')) {
                var newCreepName = spawns[i].createAttackCreep(energyMax, home, 'E87N32', spawnName, 'soldier');
            }
            else if (guardianCount < min_guardians && energyMax >= 650 && spawnName == 'Spawn1') {
                var newCreepName = spawns[i].createAttackCreep(650, home, 'E87N32', spawnName, 'guardian');
            }
            else if (fenceGuardCount < min_fenceguards && energyMax >= 800 && spawnName == 'Spawn3') {
                var newCreepName = spawns[i].createFenceGuard(800, home, 'E87N32', spawnName);
            }
            //else if (numberOfTransporters < min_transporters && numberOfMiners > 1) {
            //    var newCreepName = Game.spawns.Spawn1.createTransporter(energy1);
            //}
            else if (claimerCount < min_claimers && energyMax >= 1300 && LDHarvesterCount > 0 && (reservationEnd - Game.time < 1000) && (spawnName != 'Spawn3')) { //&& Game.rooms[target].controller.reservation.ticksToEnd <= 1000  
                //console.log(claimerCount + ", " + energyMax + ", " + spawnName);
                var newCreepName = spawns[i].createClaimer(energyMax, home, spawns[i].memory.expansionRoom, spawnName);    
            }
            else if (repairerCount < min_repairers) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'repairer', spawnName);
            } 
            else if (LDBuilderCount < min_longDistanceBuilders && energyMax >= 800 && spawnName != 'Spawn3') {
                var newCreepName = spawns[i].createLongDistanceBuilder(900, 3, home, spawns[i].memory.expansionRoom, spawnName);
            } 
             
            else if (wallerCount < min_wallers) {
                var newCreepName = spawns[i].createCustomCreep(energyMax, 'waller', spawnName);
            } 
            //else if (scoutCount < min_scouts) {
            //    var newCreepName = spawns[i].createScout(50, home, 'E87N32', spawnName);
            //} 
            else {
                max_creeps = true;
            }
        }
    
    
        if (diagnosticSpam) {
            diagnostics.countCreeps();
        }
        
    });
    
}
