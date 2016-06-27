Meteor.smartPublish('pendingUsers', function (){
    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({
        'profile.greeting': {$exists : false}
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});
Meteor.publish('pendingUsers-count', function() {
    Counts.publish(this, 'pendingUsers', Meteor.users.find({
        'profile.greeting': {$exists : false}
    }));
});




Meteor.smartPublish('newUsers', function (){
    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({
        'profile.greeting': {$ne : null},
        $or: [
                {'webeeidstatus': {$exists: false}},
                {'webeeidstatus': 'new'} ]
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});
Meteor.publish('newUsers-count', function() {
    Counts.publish(this, 'newUsers', Meteor.users.find({
        'profile.greeting': {$ne : null},
        $or: [
                {'webeeidstatus': {$exists: false}},
                {'webeeidstatus': 'new'} ]
    }));
});



Meteor.smartPublish('approvedUsers', function (){
    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({
        'webeeidstatus': {
            $in: ['approved', 'accepted']
        }
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});
Meteor.publish('approvedUsers-count', function() {
    Counts.publish(this, 'approvedUsers', Meteor.users.find({
        'webeeidstatus': {
            $in: ['approved', 'accepted']
        }
    }));
});



Meteor.smartPublish('printedUsers', function (){
    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({
        'webeeidstatus': {
            $in: ['printed', 'completed']
        }
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});
Meteor.publish('printedUsers-count', function() {
    Counts.publish(this, 'printedUsers', Meteor.users.find({
        'webeeidstatus': {
            $in: ['printed', 'completed']
        }
    }));
});



Meteor.smartPublish('rejectedUsers', function (){
    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({
        'webeeidstatus': {
            'webeeidstatus': 'rejected'
        }
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});
Meteor.publish('rejectedUsers-count', function() {
    Counts.publish(this, 'rejectedUsers', Meteor.users.find({
        'webeeidstatus': {
            'webeeidstatus': 'rejected'
        }
    }));
});



Meteor.smartPublish('collectedUsers', function (){
    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({
        'webeeidstatus': {
            'webeeidstatus': 'collected'
        }
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});
Meteor.publish('collectedUsers-count', function() {
    Counts.publish(this, 'collectedUsers', Meteor.users.find({
        'webeeidstatus': {
            'webeeidstatus': 'collected'
        }
    }));
});
