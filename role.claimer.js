var roleUpgrader = require('role.upgrader');

var roleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.ticksToLive <= 100) {
            creep.memory.spawnRoom = '';
        }
        
        if (!creep.memory.firstWayPoint) {
            creep.memory.firstWayPoint = true;
        }
        
        if (creep.name == 'ClaimDude' && creep.room.name != 'E81N33') {
            creep.moveTo(Game.flags.E81N33, {reusePath: 20});
        }
        else if (creep.room.name == creep.memory.target) {
            // We're in the target room. Find the controller.
            let roomController = creep.room.controller;
            
            if (creep.reserveController(roomController) == ERR_NOT_IN_RANGE) {
                creep.moveTo(roomController, {reusePath: 25, noPathFinding: true, maxRooms: 1});
                // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    creep.moveTo(roomController, {maxRooms: 1});
                }
                creep.say('mv controller');
            }
            else if (creep.room.name == 'E83N34') {
                errcode = creep.claimController(roomController);
                //console.log(errcode);
            }
            
            if (creep.ticksToLive <= 5) {
                let reservationEnd = Game.time + roomController.reservation.ticksToEnd;
                Game.spawns[creep.memory.sourceSpawn].memory.expansionReservationEnd = reservationEnd
            }
            
        }
        else {
            if (creep.memory.quarantineRoom && !creep.pos.isEqualTo(Game.flags.E84N34) && creep.memory.firstWayPoint === false) {
                //console.log('fenceguard');
                if (creep.room.name == Game.flags.E84N34.name) {
                    var errnum = creep.moveTo(Game.flags.E84N34, {maxRooms: 1});
                }
                else {
                    var errnum = creep.moveTo(Game.flags.E84N34);    
                }
            }
            else if (creep.memory.quarantineRoom && creep.pos.isEqualTo(Game.flags.E84N34)) {
                creep.memory.firstWayPoint = true;
            }
            
            if (creep.memory.quarantineRoom && creep.memory.firstWayPoint === true) {
                var errnum = creep.moveTo(Game.flags[creep.memory.target]);
                //console.log(creep.name + ' ' + errnum);
                creep.say("Moving n!!");    
            }
            
            if (!creep.memory.quarantineRoom) {
                creep.moveTo(Game.flags[creep.memory.target], {reusePath: 20, noPathFinding: true});
                // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    creep.moveTo(Game.flags[creep.memory.target]);
                } 
            }

        }
    }
};

module.exports = roleClaimer;
