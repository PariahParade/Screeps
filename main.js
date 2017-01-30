//TODO: Transporter fixed. Need to have it prioritize dropoff based on
    // energy capacity
//TODO: getEnergy function confuses creeps, they try to go for every direction
    // Need for them to evaluate what is best. What's most full?
//TODO: Figure out building in other rooms
//TODO: Scout/Soldier finish
//TODO: Storage usage
    //Started; need to finish
//TODO: Have more creeps use prototypes
//TODO: Refactor spawning and clean it up
    // Need to do math on how much energy a room can create and how much I need
    // to exploit that. Maybe make it dynamic.



require('prototype.spawn')();
require('prototype.creep');
require('prototype.tower');

// Any modules that you use that modify the game's prototypes should be required
// before you require the profiler.
const profiler = require('screeps-profiler');
const diagnostics = require('diagnostics');

var diagnosticeSpam = true;

var min_harvesters = 2;
var min_builders = 1;
var min_repairers = 1;
var min_wallers = 1;
var min_upgraders = 2;
var min_miners = 2;
var min_transporters = 1;
var min_claimers = 0;
var min_longDistanceHarvesters = 2;
var min_guardians = 1;
var min_longDistanceBuilders = 2;

var HOME = Game.spawns.Spawn1.room.name;
var max_creeps = false;

// This line monkey patches the global prototypes.
profiler.enable();

module.exports.loop = function() {
    profiler.wrap(function() {
        // Clear dead creep memory
        for (let name in Memory.creeps) {
            if (Game.creeps[name] == undefined) {
                console.log(name + " has died.");
                delete Memory.creeps[name];
            }
        }
        
        // Transfer link resources if full
        var linkFrom = Game.getObjectById('588aadba6941fe7d4805143a');
        //console.log("linkFrom: " + linkFrom);
        var linkTo = Game.getObjectById('588a2cb04c9cd490564d3b63');
        if (linkFrom.energy < (linkTo.energyCapacity - linkTo.energy)) {
            linkFrom.transferEnergy(linkTo);
        }
        
        
        // Find all towers, set them to defend room.
        var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
        for (let tower of towers) {
            tower.defendRoom();
        }

        // Execute given code/roles to all creeps.
        for (let name in Game.creeps) {
            Game.creeps[name].runRole();
        }


        // Spawning Creeps
        var spawnRole = null;
        var logToConsole = false;

        // First, check number of harvesters and builders
        var numberOfHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'harvester');
        var numberOfBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder');
        var numberOfRepairers = _.sum(Game.creeps, (c) => c.memory.role == 'repairer');
        var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
        var numberOfWallers = _.sum(Game.creeps, (c) => c.memory.role == 'waller');
        var numberOfUpgraders = _.sum(Game.creeps, (c) => c.memory.role == 'upgrader');
        var numberOfMiners = _.sum(Game.creeps, (c) => c.memory.role == 'miner');
        var numberOfTransporters = _.sum(Game.creeps, (c) => c.memory.role == 'transporter');
        var numberOfClaimers = _.sum(Game.creeps, (c) => c.memory.role == 'claimer');
        var numberOfGuardians = _.sum(Game.creeps, (c) => c.memory.role == 'guardian');
        var numberOfLongDistanceHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester');
        var numberOfLongDistanceBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceBuilder');

        var energy = Game.spawns.Spawn1.room.energyCapacityAvailable;
        if (energy > 1300) {
            energy = 1300;
        }

        // Priority: Harvesters > Builders > Repairers > Wallers > Upgraders
        if (numberOfHarvesters < min_harvesters) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'harvester');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: harvester")

            // If number of harvesters gets very low, make whatever harvester we can.
            if (numberOfHarvesters < 2) {
                console.log("Ran dangerously low on harvesters. Force spawning one.");
                name = Game.spawns.Spawn1.createCustomCreep(Game.spawns.Spawn1.room.energyAvailable, 'emergencyHarvester');
            }
        } else if (numberOfMiners < min_miners) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'miner');
        } else if (numberOfLongDistanceHarvesters < min_longDistanceHarvesters) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createLongDistanceHarvester(energy, 3, HOME, 'W65S89', 0);
        } else if (numberOfTransporters < min_transporters) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createTransporter(energy);
        } else if (numberOfClaimers < min_claimers) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createClaimer(energy, HOME, 'W65S89');
        } else if (numberOfBuilders < min_builders) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'builder');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: builder")
        } else if (numberOfRepairers < min_repairers) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'repairer');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: repairer")
        } else if (numberOfLongDistanceBuilders < min_longDistanceBuilders) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createLongDistanceBuilder(energy, 3, HOME, 'W65S89');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: repairer")
        } else if (numberOfGuardians < min_guardians) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createGuardian(energy, HOME, 'W65S89');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: repairer")
        } else if (numberOfWallers < min_wallers) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'waller');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: repairer")
        } else if (numberOfUpgraders < min_upgraders) {
            //console.log("max_creeps: " + max_creeps);
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'upgrader');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: upgrader")
        } else {
            //console.log("test");
            max_creeps = true;
        }

        if (diagnosticeSpam) {
            diagnostics.countCreeps();
        }
    });
}
