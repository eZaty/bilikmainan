Meteor.publish('bulletin_posts', function() {
    return Bulletin_Posts.find();
});

// Meteor.publish('limit_bulletin_posts', function (skip, limit){
//     check(skip, Number);
//     check(limit, Number);
//     return Bulletin_Posts.find({},{
//         skip: skip,
//         limit: limit,
//         sort: {
//             created_at: -1
//         }
//     });
// });

// Meteor.publish('bulletin_comments', function() {
//   return Bulletin_Comments.find();
// });

// Meteor.publish('limit_bulletin_comments', function (skip, limit){
//     check(skip, Number);
//     check(limit, Number);
//     return Bulletin_Comments.find({},{
//         skip: skip,
//         limit: limit,
//         sort: {
//             created_at: -1
//         }
//     });
// });

Meteor.publish('bulletin_images', function() {
    return Bulletin_Images.find();
});

Meteor.publish('bulletin_videos', function() {
    return Bulletin_Videos.find();
});

Meteor.publish('bulletin_post_types', function() {
    return Bulletin_Post_Types.find();
});

Bulletin_Images.allow({
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

Bulletin_Videos.allow({
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

Bulletin_Post_Types.allow({
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
    addBulletinPost: function(params){
        // check whether user is bulletin's valid editor
        // var channel = Channels.findOne({
        //     _id: params.channel_id
        // },{
        //     'editors.user_id': Meteor.userId()
        // });

        // if (!channel){
        //     throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the bulletin');
        // }

        var now = new Date();

        var audit = {
            'created_at': now,
            'created_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        //console.log(data);

        // save cover image

        return Bulletin_Posts.insert(data);
    },

    deleteBulletinPost: function(id) {
        var post = Bulletin_Posts.findOne(id);
        if (!post){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Bulletin post does not exist.');
        }

        // check whether user is bulletin's valid editor
        var channel = Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the bulletin');
        }

        // delete cover 1st
        Meteor.call('removeBulletinPostCoverImage', id, function(err, res){});

        // var comments = Bulletin_Comments.find({post_id: id});
        var comments = Comments.find({postId: id});

        if (comments){
            comments.forEach(function(item){
                deleteBulletinComment(item._id);
            });
        }

        return Bulletin_Posts.remove(id);
    },

    updateBulletinPost: function(id, params) {
        // check whether user is bulletin's valid editor
        var channel = Channels.findOne({
            _id: params.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the bulletin');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Bulletin_Posts.update(id, {
            $set: data
        });
    },

    addBulletinPostType: function(params){
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not a playroom admin');
        }

        var now = new Date();

        var audit = {
            'created_at': now,
            'created_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Bulletin_Post_Types.insert(data);
    },

    deleteBulletinPostType: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not a playroom admin');
        }

        var postType = Bulletin_Post_Types.findOne(id);
        if (!postType){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Bulletin post type does not exist.');
        }
        
        return Bulletin_Post_Types.remove(id);
    },

    updateBulletinPostType: function(id, params) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not a playroom admin');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Bulletin_Post_Types.update(id, {
            $set: data
        });
    },

    addBulletinComment: function(params){
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        var now = new Date();

        var audit = {
            'createdAt': now,
            'userId': Meteor.userId(),
            'collection': 'bulletin_posts'
        }

        var data = merge2JsonObjects(params, audit);

        return Comments.insert(data);
    },

    deleteBulletinComment: function(id) {
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        return Comments.remove(id);
    },

    updateBulletinComment: function(id, params) {
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        var now = new Date();

        var audit = {
            'updatedAt': now,
            'userId': Meteor.userId(),
            'collection': 'bulletin_posts'
        }

        var data = merge2JsonObjects(params, audit);

        return Comments.update(id, {
            $set: data
        });
    },

    removeBulletinPostCoverImage: function(id) {
        var photo = Bulletin_Images.findOne({
            bulletinPostId: id,
            fileType: 'bulletin_post_cover_photo'
        });

        if (photo){
            Bulletin_Images.remove(photo._id);
        }
    },

    removeBulletinPostVideo: function(id) {
        var video = Bulletin_Videos.findOne({
            bulletinPostId: id,
            fileType: 'bulletin_post_video'
        });

        if (video){
            Bulletin_Videos.remove(video._id);
        }
    },

    setFeaturedBulletinPost: function(id) {
        // check whether user is bulletin's valid editor

        var post = Bulletin_Posts.findOne(id);

        var channel = Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the bulletin');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var params = {
            featured: 'yes'
        }

        var data = merge2JsonObjects(params, audit);

        return Bulletin_Posts.update(id, {
            $set: data
        });
    },

    revokeFeaturedBulletinPost: function(id) {
        // check whether user is bulletin's valid editor
        var post = Bulletin_Posts.findOne(id);

        var channel = Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the bulletin');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var params = {
            featured: 'no'
        }

        var data = merge2JsonObjects(params, audit);

        return Bulletin_Posts.update(id, {
            $set: data
        });
    },

    readEmailTemplate: function(id){
        var bulletin = Bulletin_Posts.findOne(id);

        // check whether user is bulletin's valid editor
        var channel = Channels.findOne({
            _id: bulletin.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the bulletin');
        }

        var now = new Date();

        var params = {
            'status': 'published',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var content = bulletin.content;
        // var find = "src='/";
        // var re = new RegExp(find, 'g');

        // content = content.replace(re, "src='http://localhost:3000/");

        // find = 'src="/';
        // re = new RegExp(find, 'g');

        // content = content.replace(re, 'src="http://localhost:3000/');

        var photo = Bulletin_Images.findOne({
            bulletinPostId: id,
            fileType: 'bulletin_post_cover_photo',
            //status: 'stored'
        }, {
            sort: {uploadedAt: -1, limit:1}
        });

        var fphoto = Bulletin_Images.findOne({
            channelId: channel._id,
            fileType: 'bulletin_channel_footer_photo'
        }, {
            sort: {uploadedAt: -1, limit:1}
        });

        var dataContext={
            content: content,
            cover: photo.S3Url('bulletinImages'),
            footer: fphoto.S3Url('bulletinImages')
        };

        SSR.compileTemplate('emailTemplate', Assets.getText('emailTemplate.html'));
        var html = SSR.render('emailTemplate', dataContext);

        return html;
    },

    publishBulletinPost: function(id) {
        var post = Bulletin_Posts.findOne(id);

        // check whether user is channel's valid editor
        var channel = Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        var post_type = Bulletin_Post_Types.findOne(post.type);

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the channel');
        }

        var now = new Date();

        var params = {
            'status': 'published',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var res = Bulletin_Posts.update(id, {
            $set: params
        });

        //console.log('publish bulletin: ' + res);

        if (res){
            var img;
            var vid;

            if (post.content_type=="video"){
                vid = Bulletin_Videos.findOne({
                    bulletinPostId: id,
                    fileType: 'bulletin_post_video'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });
            }else{
                img = Bulletin_Images.findOne({
                    bulletinPostId: id,
                    fileType: 'bulletin_post_cover_photo'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });
            }

            var mediums = post.mediums;

            if (mediums.indexOf('email')>0 && post.content_type!="video"){
                var content = post.content;
                // var find = "src='/";
                // var re = new RegExp(find, 'g');

                // content = content.replace(re, "src='http://localhost:3000/");

                // find = 'src="/';
                // re = new RegExp(find, 'g');

                // content = content.replace(re, 'src="http://localhost:3000/');

                var photo = Bulletin_Images.findOne({
                    bulletinPostId: id,
                    fileType: 'bulletin_post_cover_photo',
                    //status: 'stored'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });

                var fphoto = Bulletin_Images.findOne({
                    channelId: channel._id,
                    fileType: 'bulletin_channel_footer_photo'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });

                var dataContext={
                    content: content,
                    cover: photo.S3Url('bulletinImages'),
                    footer: fphoto.S3Url('bulletinImages')
                };

                SSR.compileTemplate('emailTemplate', Assets.getText('emailTemplate.html'));
                var html = SSR.render('emailTemplate', dataContext);

                //send email
                var to = [];
                var cc = [];
                var bcc = [];
                var usr;

                var tmp = post.recipients.to;

                if (tmp.length > 0){
                    tmp.forEach(function(item){
                        usr = Meteor.users.findOne(item.user_id);
                        if (usr){
                            to.push(usr.profile.email);
                        }
                    })
                }

                tmp = post.recipients.cc;

                if (tmp.length > 0){
                    tmp.forEach(function(item){
                        usr = Meteor.users.findOne(item.user_id);
                        if (usr){
                            cc.push(usr.profile.email);
                        }
                    })
                }

                tmp = post.recipients.bcc;

                if (tmp.length > 0){
                    tmp.forEach(function(item){
                        usr = Meteor.users.findOne(item.user_id);
                        if (usr){
                            bcc.push(usr.profile.email);
                        }
                    })
                }

                Email.send({
                    from: channel.title + "<" + channel.email + ">",
                    to: to, //"khairulfahmi.s@webe.com.my", //"raulpami@gmail.com",
                    cc: cc,
                    bcc: bcc,
                    subject: post.title,
                    html: html
                });
            }

            var rex = /(<([^>]+)>)/ig;

            if (post.content_type == "video"){
                var tl = Timelines.findOne({
                    postId: id
                });

                if (tl){
                    Meteor.call('updateTimeline', id, {
                        collection: 'bulletin_posts',
                        postSlug: post.slug,
                        updatedAt: now,
                        channelId: channel._id, //Meteor.userId(),
                        channelPath: channel.path, //Meteor.user().profile.nickName,
                        bulletinType: post_type.title,
                        contentType: post.content_type,
                        title: post.title,
                        description: post.short_content, //(post.content.replace(rex , "")).replace(/\s+/g, ' ').trim(),
                        tags: post.tags,
                        photoKey: vid.copies.bulletinVideos.key
                    }, function(error, result){
                        if (error)
                        throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to add timeline data.');
                        if (result)
                        return result;
                    });
                }else{
                    Meteor.call('addTimeline', {
                        collection: 'bulletin_posts',
                        postId: id,
                        postSlug: post.slug,
                        createdAt: now,
                        channelId: channel._id, //Meteor.userId(),
                        channelPath: channel.path, //Meteor.user().profile.nickName,
                        bulletinType: post_type.title,
                        contentType: post.content_type,
                        title: post.title,
                        description: post.short_content, //(post.content.replace(rex , "")).replace(/\s+/g, ' ').trim(),
                        tags: post.tags,
                        photoKey: vid.copies.bulletinVideos.key
                    }, function(error, result){
                        if (error)
                        throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to add timeline data.');
                        if (result)
                        return result;
                    });
                }
            }else{
                var tl = Timelines.findOne({
                    postId: id
                });

                if (tl){
                    Meteor.call('updateTimeline', id, {
                        collection: 'bulletin_posts',
                        postSlug: post.slug,
                        updatedAt: now,
                        channelId: channel._id, //Meteor.userId(),
                        channelPath: channel.path, //Meteor.user().profile.nickName,
                        bulletinType: post_type.title,
                        contentType: post.content_type,
                        title: post.title,
                        description: post.short_content, //(post.content.replace(rex , "")).replace(/\s+/g, ' ').trim(), //.substring(0,120) + " ...",
                        tags: post.tags,
                        photoKey: img.copies.bulletinImages.key
                    }, function(error, result){
                        if (error)
                        throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to add timeline data.');
                        if (result)
                        return result;
                    });
                }else{
                    Meteor.call('addTimeline', {
                        collection: 'bulletin_posts',
                        postId: id,
                        postSlug: post.slug,
                        createdAt: now,
                        channelId: channel._id, //Meteor.userId(),
                        channelPath: channel.path, //Meteor.user().profile.nickName,
                        bulletinType: post_type.title,
                        contentType: post.content_type,
                        title: post.title,
                        description: post.short_content, //(post.content.replace(rex , "")).replace(/\s+/g, ' ').trim(), //.substring(0,120) + " ...",
                        tags: post.tags,
                        photoKey: img.copies.bulletinImages.key
                    }, function(error, result){
                        if (error)
                        throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to add timeline data.');
                        if (result)
                        return result;
                    });
                }
            }

            var prms = {
                'title': post.title,
                'type': 'New ' + post_type.title
            }
            
            Meteor.call('pushNotification', prms);
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to update blog post status.');
        }
    },
    unpublishBulletinPost: function(id) {
        var post = Bulletin_Posts.findOne(id);

        // check whether user is channel's valid editor
        var channel = Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the channel');
        }

        var now = new Date();

        var params = {
            'status': 'draft',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var res = Bulletin_Posts.update(id, {
            $set: params
        });

        console.log('unpublish bulletin: ' + res);

        if (res){
            Meteor.call('deleteTimeline', id, function(error, result){
                if (error)
                throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to delete timeline data.');
                if (result)
                return result;
            });
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to update blog post status.');
        }
    }

});
