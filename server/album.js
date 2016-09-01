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
    deleteAlbum: function(id){
         Albums.remove({
             _id: id
         });

         Meteor.call('deleteTimeline', id);

         Meteor.call('removeAllAlbumPhotos', id, function(err, res){});
         
         return true;
    }
});
