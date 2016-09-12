Meteor.publish('channels', function() {
    return Channels.find();
});

Meteor.publish('channel_images', function() {
    return Channel_Images.find();
});

Channel_Images.allow({
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
    addChannel: function(params){
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

        return Channels.insert(data);
    },

    deleteChannel: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        Meteor.call('removeChannelCoverImage', id, function(err, res){});

        Meteor.call('removeChannelFooterImage', id, function(err, res){});

        var posts = Bulletin_Posts.find({channelId: id});

        if (posts){
            posts.forEach(function(item){
                deleteBulletinPost(item._id);
            });
        }

        return Channels.remove(id);
    },

    updateChannel: function(id, params) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Channels.update(id, {
            $set: data
        });
    },

    removeChannelCoverImage: function(id) {
        var photo = Channel_Images.findOne({
            channelId: id,
            fileType: 'channel_cover_photo'
        });

        if (photo){
            Channel_Images.remove(photo._id);
        }
    },

    removeChannelFooterImage: function(id) {
        var photo = Channel_Images.findOne({
            channelId: id,
            fileType: 'channel_footer_photo'
        });

        if (photo){
            Channel_Images.remove(photo._id);
        }
    }
});