// Body Part Costs: http://support.screeps.com/hc/en-us/articles/203013212-Creep

/**
 * Creates a body plan array given a set of parameters.
 * @param {number} energy Amount of energy to use to create body plan
 * @param {number} numberOfWorkParts How many WORK parts the creeps hould have
 *
 * @return {string[]} Array of strings representing body plan
 */
function getBalancedCreepBodyPlan(energy, numberOfWorkParts) {
    var body = [];
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

function getFullWorkBodyPlan(energy) {
    let body = [];
    let energyRemaining = energy - BODYPART_COST[CARRY]; //One Carry Part
    
    // One work part plus half a movement, rounded down
    let numberOf_WorkParts = Math.floor(energyRemaining / (BODYPART_COST[WORK] + (BODYPART_COST[MOVE] / 2)));
    energyRemaining -= BODYPART_COST[WORK] * numberOf_WorkParts
    
    let numberOf_MoveParts = Math.floor(energyRemaining / BODYPART_COST[MOVE])
    
    for (let i = 0; i < numberOfWorkParts; i++) {
        body.push(WORK);
    }
    
    body.push(CARRY);
    
    for (let i = 0, len = numberOfWorkParts.length; i < len; i++) {
        body.push(MOVE);
    }
    
    return body;
}

function getRoadRunnerBodyPlan(energy, numberOfWorkParts) {
    var body = [];
    var numberOf_WorkParts
    var numberOf_MoveParts
    var numberOf_CarryParts
    
    numberOf_WorkParts = Math.floor(energy / 200);
    
    if (numberOf_WorkParts > 5) {
        numberOf_WorkParts = 5
    }
    energy -= 100 * numberOf_WorkParts;
    
    numberOf_MoveParts = Math.ceil(numberOf_WorkParts / 2);
    energy -= 50 * numberOf_MoveParts
    
    numberOf_CarryParts = Math.floor((energy / 150) * 2);
    energy -= 50 * numberOf_CarryParts
    numberOf_MoveParts += Math.floor(energy/50);
    
    
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
        function(energy, roleName, sourceSpawn) {
            var numberOfParts = Math.floor(energy / 250);
            var numberOfWorkParts = Math.floor(energy / 200);
            var body = [];

            if (roleName == "harvester") {
                if (energy <= 300) {
                    body.push(WORK, CARRY, CARRY, MOVE, MOVE);
                }
                else {
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
                    body.push(WORK, CARRY, CARRY, MOVE, MOVE);
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
                if (energy >= 800) {
                    body.push(WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE)
                }    

            }
            else if (roleName == "upgrader") {
                body = getRoadRunnerBodyPlan(energy);  
            }
            else {
                body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);
            }
            
            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, null, {
                    role: roleName,
                    sourceSpawn: sourceSpawn
                });
            }
            else {
                //console.log("ERROR creating " + roleName + " in " + this.name + " with " + energy + " energy, " + numberOfWorkParts + " work parts (if applicable), and the following body:");
                //console.log(body);
            }

            
        };

    StructureSpawn.prototype.createLongDistanceHarvester =
        function(energy, numberOfWorkParts, home, target, sourceId, sourceSpawn) {
            var body = getRoadRunnerBodyPlan(energy, numberOfWorkParts);
            
            // Create creep with the body built body
            return this.createCreep(body, undefined, {
                role: 'longDistanceHarvester',
                sourceSpawn: sourceSpawn,
                home: home,
                target: target,
                sourceId: sourceId,
                working: false
            });
        };

    StructureSpawn.prototype.createLongDistanceBuilder =
        function(energy, numberOfWorkParts, home, target, sourceSpawn) {
            var body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);

            // Create creep with the body built body
            return this.createCreep(body, undefined, {
                role: 'longDistanceBuilder',
                sourceSpawn: sourceSpawn,
                home: home,
                target: target,
                working: false
            });
        };

    StructureSpawn.prototype.createHauler =
        function(energy, sourceSpawn) {
            var body = [];
            
            if (energy > 1000) {energy = 1000};
            
            var totalPairs = (Math.floor(energy / 100));
            
            for (let i = 0; i < totalPairs; i++) {
                body.push(CARRY);
            }
            for (let i = 0; i < totalPairs; i++) {
                body.push(MOVE);
            }
            
            if(this.canCreateCreep(body) == OK) {
                // Create creep with the body built body
                return this.createCreep(body, undefined, {
                    role: 'hauler',
                    sourceSpawn: sourceSpawn,
                    working: false
                });
            }
            else {
                //console.log(this.name + ": ERROR creating hauler with " + energy + " energy and the following body:");
                //console.log(body);
            }
        };
        
    StructureSpawn.prototype.createScout =
        function(energy, home, target, sourceSpawn) {
            
            var body = [];
            body.push(MOVE);
            
            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, undefined, {
                    role: 'scout',
                    sourceSpawn: sourceSpawn,
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
        function(energy, home, target, sourceSpawn, role) {
            var body = [];
            
            // Reserve a move for each one of these (add 50 to part cost).
            var attackParts = (Math.floor(energy / 130));
            //var toughParts = Math.floor((energy - (attackParts * 130)) / 60);
            
            // Deploy TOUGH first, so these will be attacked first.
            //for (let i = 0; i < toughParts; i++) {
            //    body.push(TOUGH);
            //}
            // Need one move for every tough and attack, so move needs doubled up
            for (let i = 0; i < attackParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < attackParts; i++) {
                body.push(ATTACK);
            }

            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, undefined, {
                    role: role,
                    sourceSpawn: sourceSpawn,
                    home: home,
                    target: target
                });
            }
            else {
                //console.log(sourceSpawn + ": ERROR creating " +  role + " with " + energy + " energy and the following body:");
                //console.log(body);
            }
        };
        
    StructureSpawn.prototype.createFenceGuard =
        function(energy, home, target, sourceSpawn) {
            var body = [];
            
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

            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, undefined, {
                    role: 'fenceguard',
                    sourceSpawn: sourceSpawn,
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
        function(energy, home, target, sourceSpawn) {
            var body = [];

            // A claimer will never be more or less than this, so hardcode
            // should be fine.
            body.push(CLAIM, CLAIM, MOVE, MOVE);
            
            var returnValue = this.canCreateCreep(body);
            
            if(returnValue == OK) {
                return this.createCreep(body, undefined, {
                    role: 'claimer',
                    sourceSpawn: sourceSpawn,
                    home: home,
                    target: target
                });
            }
            else if (returnValue != ERR_NOT_ENOUGH_ENERGY) {
                //console.log("ERROR creating CLAIMER at " + this.name + " with " + energy + " energy and the following body:");
                //console.log(body);
            }

            // Create creep with the built body.
            
        };

    StructureSpawn.prototype.createTransporter =
        function(energy, sourceSpawn) {
            var numberOfParts = Math.floor(energy / 150);
            var body = [];

            // One move per two carries, as it is assumed this creep Will
            // have roads to utilize.
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY, CARRY, MOVE);
            }

            // Create creep with the built body
            return this.createCreep(body, undefined, {
                role: 'transporter',
                sourceSpawn: sourceSpawn,
                working: false
            });
        };
};
