/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('diagnostics');
 * mod.thing == 'a thing'; // true
 */
 
var diagnostics = {
    countCreeps : function(creepType) {
        var returnString = "";
        if (creepType) {
            let sum = _.sum(Game.creeps, (c) => c.memory.role == creepType);
            console.log(creepType + "   : " + _.sum(Game.creeps, (c) => c.memory.role == creepType));
            
        }
        else {
            var spawns = _.filter(Game.structures, s => s.structureType == STRUCTURE_SPAWN);
            //console.log(JSON.stringify(spawns));
            
            var energyOutputText = "";
            var creepOutput = [];
            
            for (let i = 0; i < spawns.length; i++) {
                let spawnName       = spawns[i].name;
                let energyCurrent   = spawns[i].room.energyAvailable;
                let energyMax       = spawns[i].room.energyCapacityAvailable;
                let creepManifest   = spawns[i].room.find(FIND_MY_CREEPS);
                
                energyOutputText += spawnName + ": [" + energyCurrent + "/" + energyMax + "]    "; 
                
                creepOutput.push({spawn: spawnName, role: 'Harvester', value: _.sum(creepManifest, (c) => c.memory.role == 'harvester')});
                creepOutput.push({spawn: spawnName, role: 'Upgrader', value: _.sum(creepManifest, (c) => c.memory.role == 'upgrader')});
                creepOutput.push({spawn: spawnName, role: 'Builder', value: _.sum(creepManifest, (c) => c.memory.role == 'builder')});
                creepOutput.push({spawn: spawnName, role: 'Miners', value: _.sum(creepManifest, (c) => c.memory.role == 'miner')});
                creepOutput.push({spawn: spawnName, role: 'Claimer', value: _.sum(creepManifest, (c) => c.memory.role == 'claimer')});
                creepOutput.push({spawn: spawnName, role: 'Guardian', value: _.sum(creepManifest, (c) => c.memory.role == 'guardian')});
                creepOutput.push({spawn: spawnName, role: 'LDHarvester', value: _.sum(creepManifest, (c) => c.memory.role == 'longDistanceHarvester')});
                creepOutput.push({spawn: spawnName, role: 'LDBuilder', value: _.sum(creepManifest, (c) => c.memory.role == 'longDistanceBuilder')});
                creepOutput.push({spawn: spawnName, role: 'Hauler', value: _.sum(creepManifest, (c) => c.memory.role == 'hauler')});
                
            }
            
            console.log(energyOutputText);
            new RoomVisual('E19N82').text(energyOutputText, 33, 27, {color: 'green', size: 0.7}); 
            
            var spawn1Text = [];
            var spawn2Text = [];
            
            for (let i = 0; i < creepOutput.length; i++) {
                if (i % 2 == 0) {
                    spawn2Text.push(creepOutput[i].value);
                }
                else {
                    spawn1Text.push(creepOutput[i].value);
                }
                
                if (creepOutput[i].spawn == 'Spawn1') {
                    new RoomVisual('E88N32').text(creepOutput[i].role + ": " + creepOutput[i].value, 38, 18+i, {color: 'white', size: 0.7});        
                }
                else if (creepOutput[i].spawn == 'Spawn2'){
                    new RoomVisual('E87N32').text(creepOutput[i].role + ": " + creepOutput[i].value, 41, 3+i, {color: 'white', size: 0.7});        
                }
                
                
                
            }
            
            //console.log(JSON.stringify(spawn1Text));
            //console.log(JSON.stringify(spawn2Text));
            
            
            //if (creepOutput.length > 0) {
                //creepOutput.sort(function(a,b) {return (a.spawn > b.spawn) ? 1 : ((b.spawn > a.spawn) ? -1 : 0);} ); 
            //    creepOutput.sort(function(a,b) {return (a.role > b.role) ? 1 : ((b.role > a.role) ? -1 : 0);} ); 
            //}
            
            //console.log(JSON.stringify(creepOutput));
            
            //console.log(spawn1Text[0]);
            
            for (let i = 0; i < creepOutput.length/2; i++) {
                console.log(creepOutput[i].role + ":  \t" + spawn1Text[i] + "\t" + spawn2Text[i]);
            }
            
            
            //console.log(harvesterOutputText);
            
            /*
            //console.log("Max energy available in main room: " + energy1);
            console.log("harvesters     : " + _.sum(Game.creeps, (c) => c.memory.role == 'harvester'));
            console.log("upgraders      : " + _.sum(Game.creeps, (c) => c.memory.role == 'upgrader'));
            console.log("builders       : " + _.sum(Game.creeps, (c) => c.memory.role == 'builder'));
            console.log("repairers      : " + _.sum(Game.creeps, (c) => c.memory.role == 'repairer'));
            console.log("wallers        : " + _.sum(Game.creeps, (c) => c.memory.role == 'waller'));
            console.log("miners         : " + _.sum(Game.creeps, (c) => c.memory.role == 'miner'));
            console.log("claimers       : " + _.sum(Game.creeps, (c) => c.memory.role == 'claimer'));
            console.log("transporters   : " + _.sum(Game.creeps, (c) => c.memory.role == 'transporter'));
            console.log("guardians      : " + _.sum(Game.creeps, (c) => c.memory.role == 'guardian'));
            console.log("LD Harvester   : " + _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester'));
            console.log("LD Builder     : " + _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceBuilder'));
            console.log("---------------------------------------------");
            */
            
        }
        
        return returnString;
    
    }
}




module.exports = diagnostics;