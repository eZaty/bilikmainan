Meteor.publish('chats', function() {
    return Chats.find();
});

Meteor.smartPublish('chat-users', function(limit, fields){
    check(limit, Number);

    this.addDependency('chats', 'sender', function(user){
        return [
            // Meteor.users.find({
            //     _id: user.sender
            // }, {
            //     fields: fields
            // }),
            Profiles.find({
                userId: user.sender
            })
        ];
    });

    return Chats.find({
        chatid: '@engage'
    }, {
        sort: {
            time: -1
        },
        limit: 50
    });
});

Meteor.methods({
    insertChat:function(params){
        return Chats.insert(params);
    },
    removeChat:function(params){
        return Chats.remove(params);
    }
});
