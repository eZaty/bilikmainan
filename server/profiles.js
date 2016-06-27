Meteor.publish('profiles', function() {
    return Profiles.find();
});

Meteor.publish('selectedUserProfile', function(userId) {
    return Profiles.find({userId: userId});
});

Profiles.allow({
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
    deleteProfiles: function(id){
        Profiles.remove({
            _id: id
        });
        return true;
    },

    migratePhoto: function(userId) {
        var photo = Uploads.findOne({
            userId: userId,
            fileType: 'profile_photo',
            status: 'stored'
        }, {
            sort: {uploadedAt: -1, limit:1},
            fields: {
                _id: 1,
                "original.type": 1
            }
        });
        if(!photo) return;

        var request = Meteor.npmRequire('request');
        // url = Meteor.absoluteUrl("cfs/files/uploads/"+photo._id+"?store=uploads");
        var url = 'https://playroom.webe.com.my/cfs/files/uploads/'+photo._id+'?store=uploads';

        request.get({url: url, encoding: null}, Meteor.bindEnvironment(function(e, r, buffer){
            var newFile = new FS.File();

            newFile.attachData(buffer, {type: photo.original.type}, function(error){
                if(error) throw error;
                newFile.userId = userId;
                newFile.fileType = 'profile_photo';
                newFile.status = 'stored';
                newFile.name(userId);

                Profiles.insert(newFile, function(err, fileObj){
                    if(err) console.log(err);
                    else {
                        console.log("ok");
                    }
                });
            });
        }));
    }
});
