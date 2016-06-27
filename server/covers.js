Meteor.publish('covers', function() {
    return Covers.find();
});

Meteor.publish('currentUserCover', function(userId) {
    return Covers.find({userId: userId});
});

Covers.allow({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    download: function(){
        return true;
    },
    remove: function(){
        return true;
    }
});

Meteor.methods({
    updateCover: function(id, params){
        return Covers.update(id, {$set: params});
    },
});
