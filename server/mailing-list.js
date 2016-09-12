Meteor.publish('mailing_lists', function() {
    return Mailing_Lists.find();
});

Meteor.methods({
    addMailingList: function(params){
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        var now = new Date();

        var audit = {
            'created_at': now,
            'created_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        //console.log(data);

        return Mailing_Lists.insert(data);
    },

    deleteMailingList: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        return Mailing_Lists.remove(id);
    },

    updateMailingList: function(id, params) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Mailing_Lists.update(id, {
            $set: data
        });
    }
});