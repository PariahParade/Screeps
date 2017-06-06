/**
 * @returns {boolean} True, if this room is friendly, i.e. has a controller that is
 * owned by me.
 */
Room.prototype.isFriendly = function () {
    return _.has(this, 'controller') && this.controller.my === true;
};

