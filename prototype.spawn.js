require('constants');
// Body Part Costs: http://support.screeps.com/hc/en-us/articles/203013212-Creep

/**
 * Creates a body plan array for a creep that can walk on road and plain 1:1
 * @param {number} energy Amount of energy to use to create body plan
 * @param {number} numberOfWorkParts How many WORK parts the creeps hould have
 *
 * @return {string[]} Array of strings representing body plan
 */
function getBalancedCreepBodyPlan(energy, numberOfWorkParts) {
    var body = [];
    
    if (numberOfWorkParts > 5) {
        numberOfWorkParts = 5;
    }
    
    for (let i = 0; i < numberOfWorkParts; i++) {
        body.push(WORK);
    }

    // This might seem counterintuitive because work is 100 each, but
    // this simply reserves energy for a MOVE part for every work part.
    energy -= 150 * numberOfWorkParts;

    var numberOfParts = Math.floor(energy / 100);
    for (let i = 0; i < numberOfParts; i++) {
        body.push(CARRY);
    }
    // Need one move for every carry and work, so move needs doubled up
    for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
        body.push(MOVE);
    }

    return body;
}

/**
 * Creates a body plan array for the beefiest work monster possible with given
 * energy. Designed as a road-runner (2:1 part ratio).
 * Uses UPGRADER_PARTS_MAX constant to limit the # of work parts.
 * 
 * @param {number} energy Amount of energy to use to create body plan
 * @return {string[]} Array of strings representing body plan
 */
function getMaximizedWorkBodyPlan(energy, role) {
    let body = [];
    let workParts = 0;
    let carryParts = 0;
    let moveParts = 0
    
    
    // Set up carry parts (static) and give it its required move parts
    if (role == 'extractor') {
        var energyRemaining = energy - (BODYPART_COST[CARRY] * 4); //Four Carry Part
        carryParts += 4;
        moveParts += carryParts / 2;
    }
    else {
        var energyRemaining = energy - (BODYPART_COST[CARRY] * 2); //Two Carry Part
        carryParts += 2;
        moveParts += carryParts / 2;
    }
    
    // Set up work parts
    workParts = Math.floor(energyRemaining / (BODYPART_COST[WORK] + (BODYPART_COST[MOVE] / 2)));
    
    if (workParts > UPGRADER_PARTS_MAX) {
        workParts = UPGRADER_PARTS_MAX
    }

    // Set up move parts
    moveParts += workParts / 2
    
    // Build body array
    for (let i = 0; i < workParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < carryParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < moveParts; i++) {
        body.push(MOVE);
    }
    
    return body;
}


/**
 * Creates a body plan array for a standard creep.
 * Designed as a road-runner (2:1 part ratio).
 *  
 * @param {number} energy Amount of energy to use to create body plan
 * @return {string[]} Array of strings representing body plan
 */
function getRoadRunnerBodyPlan(energy) {
    var body = [];
    var numberOf_WorkParts
    var numberOf_MoveParts
    var numberOf_CarryParts
    
    var totalParts;
    
    // Calculate Work parts
    numberOf_WorkParts = Math.floor(energy / 200);
    
    if (numberOf_WorkParts > 6) {
        numberOf_WorkParts = 6
    }
    energy -= numberOf_WorkParts * BODYPART_COST[WORK];
    
    totalParts += numberOf_WorkParts;
    
    // Calculate Move Parts
    numberOf_MoveParts = Math.ceil(numberOf_WorkParts / 2);
    energy -= numberOf_MoveParts * BODYPART_COST[MOVE];
    
    // Calculate Carry Parts
    numberOf_CarryParts = Math.floor((energy / 150) * 2); // CARRY CARRY MOVE
    energy -= numberOf_CarryParts * BODYPART_COST[CARRY];
    numberOf_MoveParts += Math.floor(energy / BODYPART_COST[MOVE]);
    
    // Build body array
    for (let i = 0; i < numberOf_WorkParts; i++) {
        body.push(WORK);
    }
    for (let i = 0; i < numberOf_CarryParts; i++) {
        body.push(CARRY);
    }
    for (let i = 0; i < numberOf_MoveParts; i++) {
        body.push(MOVE);
    }

    return body;
}


module.exports = function() {
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName, spawnRoom, target) {
            var numberOfParts = Math.floor(energy / 250);
            var numberOfWorkParts = Math.floor(energy / 200);
            var body = [];

            if (roleName == "harvester") {
                if (energy <= 300) {
                    body.push(WORK, CARRY, CARRY, MOVE, MOVE);
                }
                else {
                    if (energy > 800){energy = 800;} //Limit the size of these backups
                    body = getRoadRunnerBodyPlan(energy, numberOfWorkParts);
                }
            } 
            else if (roleName == "emergencyHarvester") {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
                roleName = "harvester";
            } 
            else if (roleName == "miner") {
                // Level 1 room
                if (energy == 300) {
                    body.push(WORK, WORK, MOVE, MOVE);
                    //roleName = 'harvester';
                }
                // Level 2 room
                else if (energy <= 550) {
                    body.push(WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE);
                }
                // Should never really be used--edge case.
                else if (energy >= 550 && energy < 650) {
                    body.push(WORK, WORK, WORK, WORK, WORK, MOVE);    
                }
                // I'm a big boy now
                else if (energy >= 700) {
                    body.push(WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE);
                }
            }
            else if (roleName == 'extractor') {
                body = getMaximizedWorkBodyPlan(energy, 'extractor');
            }
            else if (roleName == 'scientist') {
                if (energy >= 800) {
                    body.push(CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE)
                }    

            }
            else if (roleName == "repairer") {
                body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);
            }
            else if (roleName == "upgrader") {
                if (Game.rooms[spawnRoom].controller.level >= 4) {
                    body = getMaximizedWorkBodyPlan(energy);                    
                }
                else {
                    body = getRoadRunnerBodyPlan(energy);      
                }
            }
            else if (roleName == 'soldier') {
                if (energy <= 2100) {
                    body = _.times(16, () => MOVE);
                    body = body.concat(_.times(20, () => ATTACK));
                }
                else {
                    body = _.times(15, () => ATTACK);
                    body = body.concat(_.times(20, () => MOVE));
                    //body = body.concat(_.times(1, () => RANGED_ATTACK));
                    body = body.concat(_.times(5, () => HEAL));    
                }
            }
            else if (roleName == 'medic') {
                  body = _.times(7, () => MOVE);
                  body = body.concat(_.times(7, () => HEAL));
            }
            else if (roleName == 'scout') {
                body.push(MOVE);
            }
            else {
                body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);
            }
            
            
            var returnCode = this.canCreateCreep(body)
            if(returnCode == OK) {
                return this.createCreep(body, roleName + (Memory.creepNum++ % 1000), {
                    role: roleName,
                    spawnRoom: spawnRoom,
                    target: target || ''
                });
            }
            else if (returnCode != ERR_NOT_ENOUGH_ENERGY) {
                //console.log(`ERROR creating ${roleName} in ${this.name} with ${energy} energy and the following body:`);
                //console.log(body);
            }

            
        };

    StructureSpawn.prototype.createLDMiner =
        function(energy, home, target, spawnRoom, flagName) {
            var body = []
            
            // 6 WORK, 1 CARRY, 3 MOVE; 800 Energy
            body = _.times(6, () => WORK);
            body.push(CARRY);
            body = body.concat(_.times(3, () => MOVE));
            
            // Create creep with the built body
            return this.createCreep(body, 'LDMiner' + (Memory.creepNum++ % 1000), {
                role: 'LDMiner',
                spawnRoom: spawnRoom,
                home: home,
                target: target,
                remoteFlag: flagName || ''
            });
        };


    StructureSpawn.prototype.createLongDistanceHarvester =
        function(energy, numberOfWorkParts, home, target, sourceId, spawnRoom) {
            var body = getRoadRunnerBodyPlan(energy, numberOfWorkParts);
            
            // Create creep with the body built body
            return this.createCreep(body, 'LDHarvester' + (Memory.creepNum++ % 1000), {
                role: 'longDistanceHarvester',
                spawnRoom: spawnRoom,
                home: home,
                target: target,
                sourceId: sourceId,
                working: false
            });
        };

    StructureSpawn.prototype.createLongDistanceBuilder =
        function(energy, numberOfWorkParts, home, target, spawnRoom) {
            if (energy > 900) { energy = 900; }
            
            var body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);

            // Create creep with the body built body
            return this.createCreep(body, 'LDBuilder' + (Memory.creepNum++ % 1000), {
                role: 'longDistanceBuilder',
                spawnRoom: spawnRoom,
                home: home,
                target: target,
                working: false
            });
        };

    StructureSpawn.prototype.createHauler =
        function(energy, spawnRoom, role, home, target, flagName) {
            var body = [];
            var creepMemory = {};
            var initialEnergy = energy;
            
            var carryParts;
            var moveParts;
            var workParts;
            
            // Cap LDHaulers
            if (energy > 1750) { energy = 1750; }
            
            // One work part for LDHaulers to repair roads
            if (role == 'LDHauler') { 
                workParts = 2;
                energy -= BODYPART_COST[WORK] * 2;
            }
            else if (energy > 1350) {
                energy = 1350
            }
            
            // 'reserve' half a move for every carry part. Road traveler.
            var carryParts = Math.floor(energy / (BODYPART_COST[CARRY] + (BODYPART_COST[MOVE] /2)));
            energy -= BODYPART_COST[CARRY] * carryParts
            
            // Spend the rest on move parts
            var moveParts = (energy / BODYPART_COST[MOVE]);
            
            for (let i = 0; i < carryParts; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < moveParts; i++) {
                body.push(MOVE);
            }
            if (workParts > 0) {
                for (let i = 0; i < workParts; i++) {
                    body.push(WORK);
                }
            }
            
            if(this.canCreateCreep(body) == OK) {
                // Create creep with the body built body
                return this.createCreep(body, role + (Memory.creepNum++ % 1000), {
                    role: role,
                    spawnRoom: spawnRoom,
                    fullEnergy: false,
                    home: home || '',
                    target: target || '',
                    remoteFlag: flagName || '',
                    energyUsed: initialEnergy
                });
            }
            else {
                //console.log(this.name + ": ERROR creating hauler with " + energy + " energy and the following body:");
                //console.log(body);
            }
        };
        
    StructureSpawn.prototype.createSKGuard = function(energy, home, target, spawnRoom, flagName) {
        var body = [];
        
        body = _.times(10, () => WORK);
        body = body.concat(_.times(14, () => MOVE));
        body = body.concat(_.times(2, () => CARRY));
        body = body.concat(_.times(10, () => RANGED_ATTACK));
        body = body.concat(_.times(8, () => HEAL));
        
        if(this.canCreateCreep(body) == OK) {
            return this.createCreep(body, 'SKGuard' + (Memory.creepNum++ % 1000), {
                role: 'SKGuard',
                spawnRoom: spawnRoom,
                home: home,
                target: target,
                remoteFlag: flagName || ''
            });
        }
        else {
            //console.log("ERROR creating scout with " + energy + " energy and the following body:");
            //console.log(body);
        }
    },
        
        
    StructureSpawn.prototype.createScout =  function(energy, home, target, spawnRoom) {
        var body = [];
        body.push(MOVE);
        
        if(this.canCreateCreep(body) == OK) {
            return this.createCreep(body, 'Scout' + (Memory.creepNum++ % 1000), {
                role: 'scout',
                spawnRoom: spawnRoom,
                home: home,
                target: target
            });
        }
        else {
            //console.log("ERROR creating scout with " + energy + " energy and the following body:");
            //console.log(body);
        }
    };
        
    StructureSpawn.prototype.createAttackCreep =
        function(energy, home, target, spawnRoom, role) {
            var body = [];
            var attackParts;
            var moveParts;
            var healParts = false;
            
            if (energy > (BODYPART_COST[ATTACK] * 5) + (BODYPART_COST[MOVE] * 6) + BODYPART_COST[HEAL]) {
                attackParts = 5; //7
                moveParts = 6; //8
                healParts = true;
            }
            else {
                attackParts = 6
                moveParts = 6;
            }
            
            //energy = energy - 150;
            // Reserve a move for each one of these (add 50 to part cost).
            //var attackParts = (Math.floor(energy / 130));
            
            //var toughParts = Math.floor((energy - (attackParts * 130)) / 60);
            
            // Deploy TOUGH first, so these will be attacked first.
            //for (let i = 0; i < toughParts; i++) {
            //    body.push(TOUGH);
            //}
            // Need one move for every tough and attack, so move needs doubled up
            for (let i = 0; i < moveParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < attackParts; i++) {
                body.push(ATTACK);
            }
            if (healParts) { body.push(HEAL); }

            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, 'AttackCreep' + (Memory.creepNum++ % 1000), {
                    role: role,
                    spawnRoom: spawnRoom,
                    home: home,
                    target: target
                });
            }
            else {
                //console.log(spawnRoom + ": ERROR creating " +  role + " with " + energy + " energy and the following body:");
                //console.log(body);
            }
        };

    StructureSpawn.prototype.createGuardian =
        function(energy, home, target, spawnRoom, role) {
            var body = [];
            var attackParts;
            var moveParts;
            var healParts = false;
            var rangedParts;
            var roomLevel = Game.rooms[home].controller.level;
            
            if (roomLevel >= 4 && energy > (BODYPART_COST[ATTACK] * 4) + (BODYPART_COST[RANGED_ATTACK] * 2) + (BODYPART_COST[MOVE] * 7) + BODYPART_COST[HEAL]) {
                attackParts = 4; //7
                rangedParts = 2;
                moveParts = 7; //8
                healParts = true;
            }
            else {
                attackParts = 6
                moveParts = 6;
            }
            
            //energy = energy - 150;
            // Reserve a move for each one of these (add 50 to part cost).
            //var attackParts = (Math.floor(energy / 130));
            
            //var toughParts = Math.floor((energy - (attackParts * 130)) / 60);
            
            // Deploy TOUGH first, so these will be attacked first.
            //for (let i = 0; i < toughParts; i++) {
            //    body.push(TOUGH);
            //}
            // Need one move for every tough and attack, so move needs doubled up
            for (let i = 0; i < attackParts; i++) {
                body.push(ATTACK);
            }
            for (let i = 0; i < moveParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < rangedParts; i++) {
                body.push(RANGED_ATTACK);
            }
            if (healParts) { body.push(HEAL); }

            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, role + (Memory.creepNum++ % 1000), {
                    role: role,
                    spawnRoom: spawnRoom,
                    home: home,
                    target: target
                });
            }
            else {
                //console.log(spawnRoom + ": ERROR creating " +  role + " with " + energy + " energy and the following body:");
                //console.log(body);
            }
        };
        
    StructureSpawn.prototype.createFenceGuard =
        function(energy, home, target, spawnRoom, roleName) {
            var body = [];
            
            //reserve heal part
            energy = energy - 250;
            
            // Reserve a move for each one of these (add 50 to part cost).
            var attackParts = Math.floor(energy / 200);
            //var toughParts = attackParts * 2
            
            //console.log(attackParts + ' ' + toughParts);
            
            //var toughParts = Math.floor((energy - (attackParts * 200)) / 60);
            
            // Deploy TOUGH first, so these will be attacked first.
            //for (let i = 0; i < toughParts; i++) {
            //    body.push(TOUGH);
            //}
            
            // Need one move for every tough and attack, so move needs doubled up
            for (let i = 0; i < attackParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < attackParts; i++) {
                body.push(RANGED_ATTACK);
            }
            
            body.push(HEAL);

            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, 'FenceGuard' + (Memory.creepNum++ % 1000), {
                    role: roleName || 'fenceguard',
                    spawnRoom: spawnRoom,
                    home: home,
                    target: target
                });
            }
            else {
                //console.log("ERROR creating fenceGuard with " + energy + " energy and the following body:");
                //console.log(body);
            }
        };

    StructureSpawn.prototype.createClaimer =
        function(energy, home, target, spawnRoom, sourceSpawn, quarantineRoom, flagName) {
            var body = [];
            
            if (false) {
                body.push(CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE)
            }
            else {
                var numberOfPartPairs = Math.floor(energy / (BODYPART_COST[CLAIM] + BODYPART_COST[MOVE]));
                
                for (let i = 0; i < numberOfPartPairs; i++) {
                    body.push(CLAIM, MOVE);
                }
            }
            
            var returnValue = this.canCreateCreep(body);
            if(returnValue == OK) {
                return this.createCreep(body, 'Claimer' + (Memory.creepNum++ % 1000), {
                    role: 'claimer',
                    spawnRoom: spawnRoom,
                    sourceSpawn: sourceSpawn,
                    home: home,
                    target: target,
                    quarantineRoom: quarantineRoom,
                    remoteFlag: flagName || ''
                });
            }
            else if (returnValue != ERR_NOT_ENOUGH_ENERGY) {
                //console.log("ERROR creating CLAIMER at " + this.name + " with " + energy + " energy and the following body:");
                //console.log(body);
            }

            // Create creep with the built body.
            
        };
};
