Meteor.publish('albums', function() {
  return Albums.find();
});

Meteor.publish('albums-count', function() {
    Counts.publish(this, 'albums', Albums.find());
});

Meteor.smartPublish('limit-albums', function(skip, limit){
    check(skip, Number);
    check(limit, Number);

    return Albums.find({}, {
        skip: skip,
        limit: limit,
        sort: {
            created_at: -1
        }
    });
});

Albums.allow({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    remove: function(){
        return true;
    }
});

Meteor.methods({
    addAlbum: function(params){
        var now = new Date();

        var audit = {
            'created_at': now,
            'created_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        //console.log(data);
        
        return Albums.insert(data);
    },
    updateAlbum: function(id, params){
        var now = new Date();

        var audit = {
            'created_at': now,
            'created_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Albums.update(id, {
            $set: data
        });
    },
    deleteAlbum: function(id){
         Albums.remove({
             _id: id
         });

         Meteor.call('deleteTimeline', id);

         Meteor.call('removeAllAlbumPhotos', id, function(err, res){});
         
         return true;
    },
    removePhotoFromAlbum: function(id){
        if(!Meteor.userId()) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in');
        }

        var photo = Galleries.findOne(id);


        if (photo){
            Galleries.remove(id);
            return true;
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Photo does not exist.');
        }
    },
    removeAllAlbumPhotos: function(id){
        if(!Meteor.userId()) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in');
        }

        var photos = Galleries.find({
            album_id: id
        });


        if (photos){
            photos.forEach(function (photo) {
                Galleries.remove(photo._id);
            });
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Album does not have any photo.');
        }
    },

    publishAlbum: function(id){
        var now = new Date();

        var params = {
            'status': 'published',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var res = Albums.update(id, {
            $set: params
        });

        if (res){
            var album = Albums.findOne(id);

            var channel = Channels.findOne(album.channel);
            var channelText = "-";
            var tmp;

            if (channel)
                channelText = channel.title;

            // get photos 
            var uploadedPhotos = [];

            var photos = Galleries.find({
                album_id: id
            });

            photos.forEach(function(item){
                tmp = {
                    key: item.copies.galleryImages.key
                }

                uploadedPhotos.push(tmp);
            });

            Meteor.call('addTimeline', {
                channel: channelText,
                collection: 'albums',
                postId: album._id,
                albumTitle: album.title,
                createdAt: album.created_at,
                userId: Meteor.userId(),
                userName: Meteor.user().profile.nickName,
                photos: uploadedPhotos
            });

            var prms = {
                'title': album.title,
                'type': 'New Photo Album'
            }
            
            //Meteor.call('pushNotification', prms);
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to publish album.');
        }
    },

    unpublishAlbum: function(id){
        var now = new Date();

        var params = {
            'status': 'draft',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var res = Albums.update(id, {
            $set: params
        });

        if (res){
            Meteor.call('deleteTimeline', id, function(error, result){
                if (error)
                    throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to delete timeline data.');
                if (result)
                    return result;
            });
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to unpublish album.');
        }
    }
});
