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
            console.log("harvesters     : " + _.sum(Game.creeps, (c) => c.memory.role == 'harvester'));
            console.log("upgraders      : " + _.sum(Game.creeps, (c) => c.memory.role == 'upgrader'));
            console.log("builders       : " + _.sum(Game.creeps, (c) => c.memory.role == 'builder'));
            console.log("repairers      : " + _.sum(Game.creeps, (c) => c.memory.role == 'repairer'));
            console.log("wallers        : " + _.sum(Game.creeps, (c) => c.memory.role == 'waller'));
            console.log("miners         : " + _.sum(Game.creeps, (c) => c.memory.role == 'miner'));
            console.log("transporters   : " + _.sum(Game.creeps, (c) => c.memory.role == 'transporter'));
            console.log("longdistance   : " + _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester'));
        }
        
        return returnString;
    
    }
}




module.exports = diagnostics;