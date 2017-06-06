require('constants');

var roleScientist = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        // Set up a task list. 
        const TASK_LIST = {
            0: "Fill_Labs_Product",
            1: "Fill_Labs_Reactant",
            2: "Balance_Reactant_Labs",     // Never use?
            3: "Empty_Labs_Product",
            4: "Empty_Labs_Reactant",  
            5: "Deposit_Resources",         // May be deprecated now that empty methods deposit.
            6: "Move_Storage_To_Terminal"   //TODO
        };
        
        // Setup task list in creep memory.
        if ((!creep.memory.taskList || creep.memory.taskList == '') && !creep.memory.currentTask) {
            
            // Create task list
            var taskList = [];
            
            let [resA,resB] = RECIPES[CURRENT_REACTION];
            
            //console.log(resA + ' ' + resB);
            
            // Are we a boost room? If so, fill labs with product
            if (creep.room.memory.boostRoom == true) {
                taskList.push(0); // "Fill_Labs_Product"
            }
            // Not a boost room, we must do science.
            else {
                // Grab the reactant lab IDs
                var seedLabIDs = _.pluck(_.filter(creep.room.memory.labs, function(n) {return n.seedLab == true;}), 'id');
                var seedLabs = _.map(seedLabIDs, Game.getObjectById);
                
                // Grab the lab IDs where SCIENCE happens
                var productLabIDs = _.pluck(_.filter(creep.room.memory.labs, function(n) {return n.seedLab == false;}), 'id');
                var productLabs = _.map(productLabIDs, Game.getObjectById);
                
                // Check if lab recipe has changed compared to what we have in labs.
                if (this.checkRecipeChange(seedLabs, resA, resB)) {
                    taskList.push(4, 3, 5); // "Empty_Labs_Reactant", "Empty_Labs_Product", "Deposit_Resources"    
                }
                
                // Check if we need to remove product from product labs
                var labsWithStuff = _.filter(productLabs, lab => lab.mineralAmount > 0);
                //console.log(creep.room.name + ' test');
                if (_.size(labsWithStuff) > 0) {
                    taskList.push(3,5); // "Empty_Labs_Product", "Deposit_Resources"
                }
                
                // Check if reactant labs are empty
                if (_.size(seedLabs) == 2 && (seedLabs[0].mineralAmount < 500 || seedLabs[1].mineralAmount < 500)) {
                    taskList.push(1); // "Fill_Labs_Reactant"
                }
            }
            
            // Set the list of tasks into creep memory.
            if (taskList.length > 0) {
                // Join the array into a creep-memory-storable string.
                var taskString = taskList.join();
                creep.memory.taskList = taskString;
            }
        
        }
        // Task list aquired. Lets do this.
        else {
            // If done with previous task, lets pull a new one from the list.
            if (!creep.memory.currentTask || creep.memory.currentTask == '') {
                // Parse creep memory task list into an array.
                var taskList = JSON.parse("[" + creep.memory.taskList + "]");
                
                // pop off the first task and store it into memory.
                var taskIndex = _.first(taskList); // number
                
                var currentTask = TASK_LIST[taskIndex];
                
                creep.memory.currentTask = currentTask;
                
                // Task assigned; Trim off first element of task list     Look into array.shift to make this better.
                var trimmedTaskList = _.rest(taskList);
                creep.memory.taskList = trimmedTaskList;
            }
            // We have a task assigned, lets get to work.
            else {
                switch (creep.memory.currentTask) {
                    case 'Fill_Labs_Product':
                        this.fillLabsProduct(creep);
                        break;
                    case 'Fill_Labs_Reactant':
                        this.fillLabsReactant(creep);
                        break;
                    case 'Balance_Reactant_Labs':
                       //this.balanceReactantLabs();
                        break;
                    case "Empty_Labs_Product":
                        this.emptyLabsProduct(creep);
                        break;
                    case "Empty_Labs_Reactant":
                        //console.log('tester');
                        this.emptyLabsReactant(creep);
                        break;
                    case "Deposit_Resources":
                        this.depositResources(creep);
                        break;
                    case "Move_Storage_To_Terminal":
                        this.moveFromStorageToTerminal(creep);
                        break;
                    default:
                        break;
                }
            }
            // Regardless of task, drop off materials if about to die
            if (creep.ticksToLive < 20) {
                creep.depositAnything();
            }
        }
	}, //end 'run'
	
	checkRecipeChange: function(seedLabs, resA, resB) {
	    var recipeChanged = false;
	    
	    // Compare the labs vs the recipe both forward and backward.
        var forwardCheck = seedLabs[0].mineralType + seedLabs[1].mineralType
        var backwardCheck = seedLabs[1].mineralType + seedLabs[0].mineralType
        
        //console.log(seedLabs[0].mineralType + ' ' + seedLabs[1].mineralType);
        //console.log(forwardCheck == true);

        if (_.size(seedLabs) == 2 && (forwardCheck && backwardCheck) && (forwardCheck != resA + resB) && (backwardCheck != resA + resB)) {
            recipeChanged = true;
        }
        
        return recipeChanged;
	},
	
	requestMineral: function (mineral, requestingRoom, requestAmount) {
	    for (let searchRoom in Game.rooms) {
            let targetRoom = Game.rooms[searchRoom];
            
            if (targetRoom.terminal && targetRoom.terminal.store[mineral] >= requestAmount) {
// Minor Bug: Only returns the last room with mineral due to loop structure.
// Maybe an Array.push, and then _.max() or something.
                var roomWithMineral = targetRoom;                                           
            }
        }
        
        // Request this mineral be sent to this room via terminal
        if (roomWithMineral){
            roomWithMineral.terminal.send(mineral, requestAmount, requestingRoom, "Scientist Request");
        }
        
// Maybe return something, so the creep doesn't wait around?
// Maybe buy something reasonable from the market if fail
//     -- Would require "Buy something reasonable from market" in utils.
	},
	
	findResource: function (creep, resource) {
	    var mineralPickup;
	    
        // Check terminal
	    if (creep.room.terminal && creep.room.terminal.store[resource] >= creep.carryCapacity) {
            mineralPickup = creep.room.terminal;
        }
        // Check storage
        else if (creep.room.storage && creep.room.storage.store[resource] >= creep.carryCapacity) {
            mineralPickup = creep.room.storage;
        }
        // If not in either, request mineral from other room
        else {
            var returnCode = this.requestMineral(resource, creep.room.name, creep.carryCapacity);
            if (returnCode == OK) { mineralPickup = creep.room.terminal; }
            //else{ console.log('Need mineral ' + resource + ' in room ' + creep.room.name); }
        }
        
        return mineralPickup;
        
	},
	
	
	fillLabsProduct: function (creep) { // for future boosting rooms/code
	    //global.BOOST_COMPOUNDS = [
        //    RESOURCE_UTRIUM_HYDRIDE,
        //    RESOURCE_LEMERGIUM_OXIDE,
        //    RESOURCE_UTRIUM_ACID
        //]
        
        
        var boostCompounds = BOOST_COMPOUNDS;
        

        
        var boostLabIDs = _.pluck(_.filter(creep.room.memory.labs, function(n) {return n.seedLab == false;}), 'id');
        var boostLabs = _.map(boostLabIDs, Game.getObjectById);
        
        var labsWithProduct = _.filter(boostLabs, function(n) {return n.mineralAmount > 0 && n.mineralAmount != n.mineralCapacity;})
        var emptyLabs = boostLabs.filter(val => !labsWithProduct.includes(val));
        
        // Top off labsWithProduct, if needed
        //var mostEmptyLab = labsWithProduct[Math.round(Math.random()*10]
        var mostEmptyLab = _.max(labsWithProduct, 'mineralAmount');
        var mineralInLab = mostEmptyLab.mineralType;
        
        console.log(mostEmptyLab);
        console.log('mineralInLab: ' + ' ' + mineralInLab);
        
        
        //console.log(_.size(labsWithProduct) + ' ' + mostEmptyLab.mineralAmount + ' ' + _.sum(creep.carry));
        
        if (_.size(labsWithProduct) > 0 && mostEmptyLab.mineralAmount < mostEmptyLab.mineralCapacity) {
            if (_.sum(creep.carry) == 0) {
                var pickupLocation = this.findResource(creep, mineralInLab);
                var returnCode = creep.withdraw(pickupLocation, mineralInLab);
                if (returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(pickupLocation);
                }
                else if (returnCode != OK) {
                    //console.log('Error in Scientist Fill Labs Product. Return code: ' + returnCode);
                }
            }
            
            //console.log(mostEmptyLab.mineralType);
            //console.log(_.findKey(creep.carry));
            //console.log(targetResource);

            // Deposit resource
            if (_.sum(creep.carry) == creep.carryCapacity && mostEmptyLab.mineralAmount < mostEmptyLab.mineralCapacity) {
                //console.log('tester');
                var returnCode = creep.transfer(mostEmptyLab, mineralInLab);
                if (returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mostEmptyLab);
                }
                else {
                    //console.log('Error in filling up labs. returnCode: ' + returnCode);
                }
            }

        }
        else if (_.size(labsWithProduct) == 0 && _.sum(creep.carry) > 0) { //&& mostEmptyLab.mineralAmount == mostEmptyLab.mineralCapacity 
        //console.log('whatwhat');
            creep.depositAnything();
        }
        
        
        // Fill up empty labs
        for (var key in labsWithProduct) {
            var lab = labsWithProduct[key];
            var mineralArray = [];
            
            mineralArray.push(lab.mineralType);

            boostCompounds = _.difference(boostCompounds, mineralArray);
            // ex: [UH,OH,XZ] [OH]
            //     [UH,XZ]
            
        }

        //console.log(boostCompounds);

        if (boostCompounds.length > 0) {
            // Grab an empty lab
            var targetEmptyLab = _.first(emptyLabs);
            var targetResource = _.first(boostCompounds);
            
    
            // Grab the resource
            var pickupLocation = this.findResource(creep, targetResource);
            
            if (pickupLocation && _.sum(creep.carry) == 0) {
                var returnCode = creep.withdraw(pickupLocation, targetResource);
                if (returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(pickupLocation);
                }
                else if (returnCode != OK) {
                    //console.log('Error in Scientist Fill Labs Product. Return code: ' + returnCode);
                }
            }
            
            // Stuff it into lab
            if (creep.carry[targetResource] > 0 && targetEmptyLab.mineralAmount < targetEmptyLab.mineralCapacity) {
                var returnCode = creep.transfer(targetEmptyLab, targetResource);
                if (returnCode == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEmptyLab);
                }
            }
        }
	},
	
	fillLabsReactant: function (creep) {
	    // Grab the reactant lab IDs
        var seedLabIDs = _.pluck(_.filter(creep.room.memory.labs, function(n) {return n.seedLab == true;}), 'id');
        var seedLabs = _.map(seedLabIDs, Game.getObjectById);
	    
	    // Determine what compound we are making
	    let [resA,resB] = RECIPES[CURRENT_REACTION];
	    currentReaction = CURRENT_REACTION.split(""); //Future Bug: Only works on two-character reactions ('OH', 'ZX', etc)

	    var currentCarryMax = creep.carryCapacity;
	    var firstMineralPickup;
	    var secondMineralPickup;
	    
	    // Check if lab recipe has changed compared to what we have in labs.
        //if (this.checkRecipeChange(seedLabs, resA, resB) == true) {
        //    console.log('test');
            // Kill our task list, we need to start the labs over.
        //    creep.memory.taskList = '';
        //    creep.memory.currentTask = '';
        //    return;
        //}
	    
	    // Determine if labs are "full". "Full" is defined as being at least half full.
	    // This is to ward off needing to refill the lab after every reaction.
	    var firstLabFull = seedLabs[0].mineralAmount >= seedLabs[0].mineralCapacity / 2
	    var secondLabFull = seedLabs[1].mineralAmount >= seedLabs[1].mineralCapacity / 2
	    
	    //console.log('firstLabFull: ' + firstLabFull);
	    //console.log('secondLabFull: ' + secondLabFull);
	    
	    
	    // ***FIRST MINERAL***
	    // Check terminal
	    if (firstLabFull === false && creep.room.terminal.store[resA] >= currentCarryMax) {
            firstMineralPickup = creep.room.terminal;
        }
        // Check storage
        else if (firstLabFull === false && creep.room.storage.store[resA] >= currentCarryMax) {
            firstMineralPickup = creep.room.storage;
        }
        // If not in either, request mineral from other room
        else if (firstLabFull === false) {
            //console.log('Need mineral ' + resA + ' in room ' + creep.room.name);
            var returnCode = this.requestMineral(resA, creep.room.name, currentCarryMax);
            if (returnCode == OK) { firstMineralPickup = creep.room.terminal; }
            //else{ console.log(returnCode); }
        }
        
        // ***SECOND MINERAL***
        // Check terminal
	    if (secondLabFull === false && creep.room.terminal.store[resB] >= currentCarryMax) {
            secondMineralPickup = creep.room.terminal;
        }
        // Check storage
        else if (secondLabFull === false && creep.room.storage.store[resB] >= currentCarryMax) {
            secondMineralPickup = creep.room.storage;
        }
        // If not in either, request mineral from other room
        else if (secondLabFull === false) {
            //console.log('Need mineral ' + resB + ' in room ' + creep.room.name);
            var returnCode = this.requestMineral(resB, creep.room.name, currentCarryMax);
            if (returnCode == OK) { secondMineralPickup = creep.room.terminal; }
            //else{ console.log(returnCode); }
        }
        
        //console.log(firstMineralPickup);
        //console.log(secondMineralPickup);
        
        // ***PICKUP MINERALS***
        if (firstMineralPickup && _.sum(creep.carry) == 0) {
            var returnCode = creep.withdraw(firstMineralPickup, resA);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(firstMineralPickup);
            }
            else if (returnCode != OK) {
                console.log('Error in Scientist first mineral pickup. Return code: ' + returnCode);
            }
        }
        
        if (secondMineralPickup && _.sum(creep.carry) == 0) {
            var returnCode = creep.withdraw(secondMineralPickup, resB);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(secondMineralPickup);
            }
            else if (returnCode != OK) {
                console.log('Error in Scientist second mineral pickup. Return code: ' + returnCode);
            }
        }
        // If the labs are full and we still have crap on us, deposit that stuff back before continuing.
        else if ((creep.carry[resA] > 0 && firstLabFull === true) || (creep.carry[resB] > 0 && secondLabFull === true)) {
            creep.depositAnything();
            /*
            let currentlyCarrying = _.findKey(creep.carry);
            
            // Deposit in terminal if it exists, storage if it does not.
	        var depositTarget = creep.room.terminal
	        if (!depositTarget || depositTarget.store[currentlyCarrying] >= 10000) {
	            depositTarget = creep.room.storage
	        }

	        if (creep.transfer(depositTarget, currentlyCarrying) == ERR_NOT_IN_RANGE) {
	            creep.moveTo(depositTarget, {noPathFinding: true, maxRooms: 1});
                // Perform pathfinding only if we have enough CPU
                if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                    creep.moveTo(depositTarget, {maxRooms: 1});
                }
            }
            */
            
        }
        
        // Deposit first mineral in seed lab 1
        if (creep.carry[resA] > 0 && seedLabs[0].mineralAmount < seedLabs[0].mineralCapacity) {
            var returnCode = creep.transfer(seedLabs[0], resA);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(seedLabs[0]);
            }
        }
        // Deposit second mineral in seed lab 2
        if (creep.carry[resB] > 0 && seedLabs[1].mineralAmount < seedLabs[1].mineralCapacity) {
            var returnCode = creep.transfer(seedLabs[1], resB);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(seedLabs[1]);
            }
        }
        
        // If both seed labs are full, drop that stuff back off.
        if (firstLabFull && secondLabFull) {
            // Drop off anything we have
            if (_.sum(creep.carry) > 0) {
                creep.depositAnything();
                /*
                let currentlyCarrying = _.findKey(creep.carry);
    	        
    	        // Deposit in terminal if it exists, storage if it does not.
    	        var depositTarget = creep.room.terminal
    	        if (!depositTarget || depositTarget.store[currentlyCarrying] >= 10000) {
    	            depositTarget = creep.room.storage
    	        }

    	        if (creep.transfer(depositTarget, currentlyCarrying) == ERR_NOT_IN_RANGE) {
    	            creep.moveTo(depositTarget, {noPathFinding: true, maxRooms: 1});
                    // Perform pathfinding only if we have enough CPU
                    if(Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
                        creep.moveTo(depositTarget, {maxRooms: 1});
                    }
                }
                */
            }
            // If empty, kill task
            else if (_.sum(creep.carry) === 0) {
                creep.memory.currentTask = '';    
            }
            
        }
        
	},
	
	balanceReactantLabs: function () {
	    // Not needed at the moment. Maybe ever? I see no purpose to this now
	    // that stuff is running and I have emptyLabsReactant
	},
	
	emptyLabsProduct: function (creep) {
	    // Get  product lab IDs
        var productLabIDs = _.pluck(_.filter(creep.room.memory.labs, 'seedLab', false), 'id');
        var productLabs = _.map(productLabIDs, Game.getObjectById);
        var labsWithMinerals = _.filter(productLabs, lab => lab.mineralAmount > 0);
	    
        if (_.size(labsWithMinerals) > 0 && _.sum(creep.carry) != creep.carryCapacity) {
            var targetLab = _.first(labsWithMinerals);

            var mineralContained = targetLab.mineralType;
	        
            returnCode = creep.withdraw(targetLab, mineralContained);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetLab);
            }
        }
        // If labs are empty or we are full, deposit what you have.
        else if (_.size(labsWithMinerals) == 0 || _.sum(creep.carry) == creep.carryCapacity) {
            creep.memory.currentTask = '';
            creep.depositAnything();
        }
        // If labs are empty and so are we, task is done.
        
        if (_.size(labsWithMinerals) == 0 && _.sum(creep.carry) == 0){
            //console.log('test');
            //console.log(`${creep.name}[${creep.room.name}]: No more product labs to empty.`);
            creep.memory.currentTask = '';
        }
	},
	
	emptyLabsReactant: function (creep) { 
	    var seedLabIDs = _.pluck(_.filter(creep.room.memory.labs, 'seedLab', true), 'id');
        var seedLabs = _.map(seedLabIDs, Game.getObjectById);
        var labsWithMinerals = _.filter(seedLabs, lab => lab.mineralAmount > 0);
        
        if (_.size(labsWithMinerals) > 0) {
            var targetLab = _.first(labsWithMinerals);

            var mineralContained = targetLab.mineralType;
	        
            returnCode = creep.withdraw(targetLab, mineralContained);
            if (returnCode == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetLab);
            }
        }
        else {
            //console.log('No more reactant labs to empty.');
            creep.memory.currentTask = '';
        }
        
        if (_.sum(creep.carry) > 0) {
            creep.depositAnything();    
        }
        
	},
	
	depositResources: function(creep) {
        if (_.sum(creep.carry) > 0) {
            creep.depositAnything();    
        }
        else {
            creep.memory.currentTask = '';
        }
    }
};

module.exports = roleScientist;
