//TODO: Scout finish
//TODO: Claimer start
//TODO: Storage usage

require('prototype.spawn')();
require('prototype.creep');

// Any modules that you use that modify the game's prototypes should be required
// before you require the profiler.
const profiler = require('screeps-profiler');
const diagnostics = require('diagnostics');

/*
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWaller = require('role.waller');
var roleMiner = require('role.miner');
var roleLongDistanceHarvester = require('role.longDistanceHarvester');
*/


var min_harvesters = 3;
var min_builders = 3;
var min_repairers = 1;
var min_wallers = 2;
var min_upgraders =4;
var min_miners = 2;
var min_transporters = 0;
var min_longDistanceHarvesters = 2;

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


        var tower = Game.getObjectById('58852e865c4ce56101732c13');
        if (tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                tower.attack(closestHostile);
            }

            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL
            });
            if (closestDamagedStructure) {
                //tower.repair(closestDamagedStructure);
            }
        }

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
        var numberOfLongDistanceHarvesters = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester');

        var energy = Game.spawns.Spawn1.room.energyCapacityAvailable;

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
            var newCreepName = Game.spawns.Spawn1.createLongDistanceHarvester(energy, 2, HOME, 'W66S88', 0);
        } else if (numberOfTransporters < min_transporters) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createTransporter(energy);
        } else if (numberOfBuilders < min_builders) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'builder');
            //console.log("Spawned new creep. Name=\"" + name + "\" Role: builder")
        } else if (numberOfRepairers < min_repairers) {
            max_creeps = false;
            var newCreepName = Game.spawns.Spawn1.createCustomCreep(energy, 'repairer');
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



        //console.log("Max Creeps:" + max_creeps);
        diagnostics.countCreeps();

    });
}
