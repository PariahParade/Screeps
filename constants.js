global.UPGRADER_PARTS_MAX = 20;

global.QUARANTINE_ROOMS = [
    'E83N33',
    'E82N33',
    'E84N33'
]

//-----------RESOURCES, BOOSTS, COMPOUNDS, ETC---------------------------------

//global.CURRENT_REACTION = RESOURCE_CATALYZED_UTRIUM_ACID;     
global.CURRENT_REACTION = RESOURCE_LEMERGIUM_ALKALIDE;        //LH2O
//global.CURRENT_REACTION = RESOURCE_GHODIUM_OXIDE;             //GO
//global.CURRENT_REACTION = RESOURCE_LEMERGIUM_OXIDE;           //LO
//global.CURRENT_REACTION = RESOURCE_HYDROXIDE;                   //OH
//global.CURRENT_REACTION = RESOURCE_UTRIUM_HYDRIDE;
//global.CURRENT_REACTION = RESOURCE_ZYNTHIUM_KEANITE;          //ZK
//global.CURRENT_REACTION = RESOURCE_GHODIUM;                   //G
//global.CURRENT_REACTION = RESOURCE_ZYNTHIUM_HYDRIDE;
//global.CURRENT_REACTION = RESOURCE_ZYNTHIUM_ACID;


global.RECIPE_LIST = [
    RESOURCE_UTRIUM_HYDRIDE,    //UH
    RESOURCE_HYDROXIDE,         //OH
    RESOURCE_ZYNTHIUM_KEANITE,  //ZK
    RESOURCE_UTRIUM_LEMERGITE,  //UL
    RESOURCE_GHODIUM,           //G
    RESOURCE_GHODIUM_HYDRIDE    //GH
]

global.BOOST_COMPOUNDS = [
    RESOURCE_UTRIUM_HYDRIDE,                //UH
    RESOURCE_LEMERGIUM_OXIDE,               //LO
    //RESOURCE_UTRIUM_ACID,                 //UH2O
    RESOURCE_GHODIUM_OXIDE,                 //GO
    RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE,  //XLHO2
    RESOURCE_CATALYZED_UTRIUM_ACID          //XUH2O
]

global.TERMINAL_RESOURCE_MAX = 40000;


// ----------MARKET------------------------------------------------------------

global.MARKET_RESOURCE_MAXIMUM = 10000;
global.TERMINAL_RESOURCE_EXCESS_MIN = 50000;


// ----------UNICODE CHARACTERS------------------------------------------------

global.UNICODE_PICK = '\u26CF';
global.UNICODE_TRUCK = '\u26DF';
global.UNICODE_XBONES = '\u2620';
global.UNICODE_SWORDS = '\u2694';
global.UNICODE_BUILDING = '\u26EA';

global.MUSIC_NOTES = [
    '\u2669',
    '\u266A',
    '\u266B',
    '\u266C'
]

global.UNICODE_ARROWS = {
	[TOP]			: "\u2191",
	[TOP_RIGHT]		: "\u2197",
	[RIGHT]			: "\u2192",
	[BOTTOM_RIGHT]	: "\u2198",
	[BOTTOM]		: "\u2193",
	[BOTTOM_LEFT]	: "\u2199",	
	[LEFT]			: "\u2190",	
	[TOP_LEFT]		: "\u2196"	
};


// ----------BUILDINGS, MIN/MAX/HP, ETC----NONE OF THIS IS IMPLEMENTED YET-----

/** 
 * Contains the maximum hit point amounts that certain structure types should
 * be repaired to. Structure types not listed in this object are repaired to
 * their maximum hit points.
 *
 * @type {{String, Number}}
 */
global.STRUCTURE_TARGET_HITS = {
    [STRUCTURE_WALL]: {
        0: 1,
        1: 1000,
        2: 10000,
        3: 50000,
        4: 100000,
        5: 200000,
        6: 500000,
        7: 1000000,
        8: 5000000
    },
    [STRUCTURE_RAMPART]: {
        0: 1,
        1: 1,
        2: 10000,
        3: 50000,
        4: 100000,
        5: 200000,
        6: 500000,
        7: 1000000,
        8: 5000000
    }
};


global.RAMPART_UPKEEP	        = RAMPART_DECAY_AMOUNT  / REPAIR_POWER / RAMPART_DECAY_TIME;
global.ROAD_UPKEEP		        = ROAD_DECAY_AMOUNT     / REPAIR_POWER / ROAD_DECAY_TIME;
global.CONTAINER_UPKEEP         = CONTAINER_DECAY       / REPAIR_POWER / CONTAINER_DECAY_TIME_OWNED;
global.REMOTE_CONTAINER_UPKEEP  = CONTAINER_DECAY       / REPAIR_POWER / CONTAINER_DECAY_TIME;

global.TASK_PRIO_TOWER_MAINTENANCE = 0;
global.TASK_MIN_PRIO_BUILD = 0;
global.TASK_MIN_PRIO_REPAIR = 0.7;
global.TASK_MIN_PRIO_UPGRADE = 0.1;


/**
 * Only structures whose percentual amount of hit points go below this value
 * will be repaired.
 *
 * @type {number}
 */
global.REPAIR_THRESHOLD = 0.7;

/**
 * A tower will only repair if its percentual energy level is above this value.
 *
 * @type {number}
 */
global.TOWER_REPAIR_ENERGY_THRESHOLD = 0.8;