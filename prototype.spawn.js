// Body Part Costs: http://support.screeps.com/hc/en-us/articles/203013212-Creep

/*
var roleMinimums = {
    harvester: 3,
    builder: 3,
    repairers: 1,
    wallers: 2,
    upgraders: 8,
    miners: 2,
    longDistanceHarvesters: 2,
    scouts: 1,
    claimers: 1
}
*/

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

module.exports = function() {
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName) {
            var numberOfParts = Math.floor(energy / 250);
            var body = [];

            if (roleName == "harvester") {
                body.push(WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE);
            } else if (roleName == "emergencyHarvester") {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
                roleName = 'harvester';
            } else if (roleName == "miner") {
                body.push(WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE);
            } else if (roleName == "builder") {
                body.push(WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE);
            } else {
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK, CARRY, MOVE, MOVE);
                }
            }

            return this.createCreep(body, null, {
                role: roleName
            });
        };

    StructureSpawn.prototype.createLongDistanceHarvester =
        function(energy, numberOfWorkParts, home, target, sourceId) {
            var body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);

            // Create creep with the body built body
            return this.createCreep(body, undefined, {
                role: 'longDistanceHarvester',
                home: home,
                target: target,
                sourceId: sourceId,
                working: false
            });
        };

    StructureSpawn.prototype.createLongDistanceBuilder =
        function(energy, numberOfWorkParts, home, target) {
            var body = getBalancedCreepBodyPlan(energy, numberOfWorkParts);

            // Create creep with the body built body
            return this.createCreep(body, undefined, {
                role: 'longDistanceBuilder',
                home: home,
                target: target,
                working: false
            });
        };
        
    StructureSpawn.prototype.createGuardian =
        function(energy, home, target) {
            var body = [];
            
            // Reserve a move for each one of these (add 50 to part cost).
            var attackParts = (Math.floor(energy / 130)) * .75;
            var toughParts = Math.floor((energy - (attackParts * 130)) / 60);
            
            // Deploy TOUGH first, so these will be attacked first.
            for (let i = 0; i < toughParts; i++) {
                body.push(TOUGH);
            }
            // Need one move for every tough and attack, so move needs doubled up
            for (let i = 0; i < toughParts + attackParts; i++) {
                body.push(MOVE);
            }
            for (let i = 0; i < attackParts; i++) {
                body.push(ATTACK);
            }

            if(this.canCreateCreep(body) == OK) {
                return this.createCreep(body, undefined, {
                    role: 'guardian',
                    home: home,
                    target: target
                });
            }
            else {
                console.log("ERROR creating guardian with " + energy + " energy and the following body:");
                console.log(body);
            }
            
            
            // Create creep with the body built body
            
        };

    StructureSpawn.prototype.createClaimer =
        function(energy, home, target) {
            var body = [];

            // A claimer will never be more or less than this, so hardcode
            // should be fine.
            body.push(CLAIM, CLAIM, MOVE, MOVE);

            // Create creep with the body built.
            return this.createCreep(body, undefined, {
                role: 'claimer',
                home: home,
                target: target
            });
        };

    StructureSpawn.prototype.createTransporter =
        function(energy) {
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
                working: false
            });
        };
};
