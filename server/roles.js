Meteor.publish('roles', function (){
    return Meteor.roles.find({});
});

Meteor.publish('admins', function(userId) {
    return Meteor.users.find({
        _id: userId
    }, {
        fields: {
            profile: 1,
            username: 1,
            roles: 1
        }
    });
});


Meteor.methods({
    promoteUser: function(id, role){
        Roles.addUsersToRoles(id, role);
    },

    revokeUser: function(id, role){
        var user = Meteor.users.findOne(id, {
            fields: {
                roles: 1
            }
        });
        var roles = [];
        _.each(user.roles, function(r){
            if(r != role) roles.push(r);
        });
        Roles.setUserRoles(id, []);
        Roles.addUsersToRoles(id, roles);
    }
});
