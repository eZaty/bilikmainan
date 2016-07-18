Meteor.publish('announcement_channels', function() {
    return Announcement_Channels.find();
});

Meteor.publish('announcement_posts', function() {
    return Announcement_Posts.find();
});

// Meteor.publish('limit_announcement_posts', function (skip, limit){
//     check(skip, Number);
//     check(limit, Number);
//     return Announcement_Posts.find({},{
//         skip: skip,
//         limit: limit,
//         sort: {
//             created_at: -1
//         }
//     });
// });

// Meteor.publish('announcement_comments', function() {
//   return Announcement_Comments.find();
// });

// Meteor.publish('limit_announcement_comments', function (skip, limit){
//     check(skip, Number);
//     check(limit, Number);
//     return Announcement_Comments.find({},{
//         skip: skip,
//         limit: limit,
//         sort: {
//             created_at: -1
//         }
//     });
// });

Meteor.publish('announcement_images', function() {
    return Announcement_Images.find();
});

Meteor.publish('announcement_videos', function() {
    return Announcement_Videos.find();
});

Meteor.publish('announcement_mailing_lists', function() {
    return Announcement_Mailing_Lists.find();
});

Announcement_Images.allow({
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

Announcement_Videos.allow({
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
    addAnnouncementChannel: function(params){
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

        return Announcement_Channels.insert(data);
    },

    deleteAnnouncementChannel: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        Meteor.call('removeAnnouncementChannelCoverImage', id, function(err, res){});

        Meteor.call('removeAnnouncementChannelFooterImage', id, function(err, res){});

        var posts = Announcement_Posts.find({channelId: id});

        if (posts){
            posts.forEach(function(item){
                deleteAnnouncementPost(item._id);
            });
        }

        return Announcement_Channels.remove(id);
    },

    updateAnnouncementChannel: function(id, params) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Announcement_Channels.update(id, {
            $set: data
        });
    },

    addAnnouncementMailingList: function(params){
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

        return Announcement_Mailing_Lists.insert(data);
    },

    deleteAnnouncementMailingList: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        return Announcement_Mailing_Lists.remove(id);
    },

    updateAnnouncementMailingList: function(id, params) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Announcement_Mailing_Lists.update(id, {
            $set: data
        });
    },

    addAnnouncementPost: function(params){
        // check whether user is announcement's valid editor
        var channel = Announcement_Channels.findOne({
            _id: params.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
        }

        var now = new Date();

        var audit = {
            'created_at': now,
            'created_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        //console.log(data);

        // save cover image

        return Announcement_Posts.insert(data);
    },

    deleteAnnouncementPost: function(id) {
        var post = Announcement_Posts.findOne(id);
        if (!post){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Announcement post does not exist.');
        }

        // check whether user is announcement's valid editor
        var channel = Announcement_Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
        }

        // delete cover 1st
        Meteor.call('removeAnnouncementPostCoverImage', id, function(err, res){});

        // var comments = Announcement_Comments.find({post_id: id});
        var comments = Comments.find({postId: id});

        if (comments){
            comments.forEach(function(item){
                deleteAnnouncementComment(item._id);
            });
        }

        return Announcement_Posts.remove(id);
    },

    updateAnnouncementPost: function(id, params) {
        // check whether user is announcement's valid editor
        var channel = Announcement_Channels.findOne({
            _id: params.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var data = merge2JsonObjects(params, audit);

        return Announcement_Posts.update(id, {
            $set: data
        });
    },
    /*publishAnnouncementPost: function(id) {
    var announcement = Announcement_Posts.findOne(id);

    // check whether user is announcement's valid editor
    var channel = Announcement_Channels.findOne({
    _id: announcement.channel_id
    },{
    'editors.user_id': Meteor.userId()
    });

    if (!channel){
    throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
    }

    var now = new Date();

    var params = {
    'status': 'published',
    'updated_at': now,
    'updated_by': Meteor.userId()
    }

    var mediums = announcement.mediums;

    if (mediums.indexOf('email')>0){
    var content = announcement.content;
    // var find = "src='/";
    // var re = new RegExp(find, 'g');

    // content = content.replace(re, "src='http://localhost:3000/");

    // find = 'src="/';
    // re = new RegExp(find, 'g');

    // content = content.replace(re, 'src="http://localhost:3000/');

    var photo = Announcement_Images.findOne({
    announcementPostId: id,
    fileType: 'announcement_post_cover_photo',
    //status: 'stored'
    }, {
    sort: {uploadedAt: -1, limit:1}
    });

    var fphoto = Announcement_Images.findOne({
    channelId: channel._id,
    fileType: 'announcement_channel_footer_photo'
    }, {
    sort: {uploadedAt: -1, limit:1}
    });

    var dataContext={
    content: content,
    cover: photo.S3Url('announcementImages'),
    footer: fphoto.S3Url('announcementImages')
    };

    SSR.compileTemplate('emailTemplate', Assets.getText('emailTemplate.html'));
    var html = SSR.render('emailTemplate', dataContext);

    //send email
    Email.send({
    from: channel.title + "<" + channel.email + ">",
    to: "khairulfahmi.s@webe.com.my", //"raulpami@gmail.com",
    subject: announcement.title,
    html: html
    });
    }

    return Announcement_Posts.update(id, {
    $set: params
    });
    },
    */
    addAnnouncementComment: function(params){
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        var now = new Date();

        var audit = {
            'createdAt': now,
            'userId': Meteor.userId(),
            'collection': 'announcement_posts'
        }

        var data = merge2JsonObjects(params, audit);

        return Comments.insert(data);
    },

    deleteAnnouncementComment: function(id) {
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        return Comments.remove(id);
    },

    updateAnnouncementComment: function(id, params) {
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        var now = new Date();

        var audit = {
            'updatedAt': now,
            'userId': Meteor.userId(),
            'collection': 'announcement_posts'
        }

        var data = merge2JsonObjects(params, audit);

        return Comments.update(id, {
            $set: data
        });
    },

    // uploadAnnouncementPostCoverImage: function(image) {
    //     var photo = Uploads.findOne({
    //         announcementPostId: image.announcementPostId,
    //         fileType: 'announcement_post_cover_photo',
    //         status: 'stored'
    //     });

    //     if (photo){
    //         Uploads.remove(photo._id);
    //     }

    //     console.log('announcementPostId: ' + image.announcementPostId);

    //     return Uploads.insert(image, function(err, fileObj){
    //         if (err){
    //             console.log("Error: " + err);
    //         }
    //     });
    // },

    removeAnnouncementPostCoverImage: function(id) {
        var photo = Announcement_Images.findOne({
            announcementPostId: id,
            fileType: 'announcement_post_cover_photo'
        });

        if (photo){
            Announcement_Images.remove(photo._id);
        }
    },

    removeAnnouncementPostVideo: function(id) {
        var video = Announcement_Videos.findOne({
            announcementPostId: id,
            fileType: 'announcement_post_video'
        });

        if (video){
            Announcement_Videos.remove(video._id);
        }
    },

    removeAnnouncementChannelCoverImage: function(id) {
        var photo = Announcement_Images.findOne({
            channelId: id,
            fileType: 'announcement_channel_cover_photo'
        });

        if (photo){
            Announcement_Images.remove(photo._id);
        }
    },

    removeAnnouncementChannelFooterImage: function(id) {
        var photo = Announcement_Images.findOne({
            channelId: id,
            fileType: 'announcement_channel_footer_photo'
        });

        if (photo){
            Announcement_Images.remove(photo._id);
        }
    },

    setFeaturedAnnouncementPost: function(id) {
        // check whether user is announcement's valid editor

        var post = Announcement_Posts.findOne(id);

        var channel = Announcement_Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
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

        return Announcement_Posts.update(id, {
            $set: data
        });
    },

    revokeFeaturedAnnouncementPost: function(id) {
        // check whether user is announcement's valid editor
        var post = Announcement_Posts.findOne(id);

        var channel = Announcement_Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
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

        return Announcement_Posts.update(id, {
            $set: data
        });
    },

    readEmailTemplate: function(id){
        var announcement = Announcement_Posts.findOne(id);

        // check whether user is announcement's valid editor
        var channel = Announcement_Channels.findOne({
            _id: announcement.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the announcement');
        }

        var now = new Date();

        var params = {
            'status': 'published',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var content = announcement.content;
        // var find = "src='/";
        // var re = new RegExp(find, 'g');

        // content = content.replace(re, "src='http://localhost:3000/");

        // find = 'src="/';
        // re = new RegExp(find, 'g');

        // content = content.replace(re, 'src="http://localhost:3000/');

        var photo = Announcement_Images.findOne({
            announcementPostId: id,
            fileType: 'announcement_post_cover_photo',
            //status: 'stored'
        }, {
            sort: {uploadedAt: -1, limit:1}
        });

        var fphoto = Announcement_Images.findOne({
            channelId: channel._id,
            fileType: 'announcement_channel_footer_photo'
        }, {
            sort: {uploadedAt: -1, limit:1}
        });

        var dataContext={
            content: content,
            cover: photo.S3Url('announcementImages'),
            footer: fphoto.S3Url('announcementImages')
        };

        SSR.compileTemplate('emailTemplate', Assets.getText('emailTemplate.html'));
        var html = SSR.render('emailTemplate', dataContext);

        return html;
    },

    publishAnnouncementPost: function(id) {
        var post = Announcement_Posts.findOne(id);

        // check whether user is channel's valid editor
        var channel = Announcement_Channels.findOne({
            _id: post.channel_id
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!channel){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the channel');
        }

        var now = new Date();

        var params = {
            'status': 'published',
            'updated_at': now,
            'updated_by': Meteor.userId()
        }

        var res = Announcement_Posts.update(id, {
            $set: params
        });

        console.log('publish announcement: ' + res);

        if (res){
            var img;
            var vid;

            if (post.type=="video"){
                vid = Announcement_Videos.findOne({
                    announcementPostId: id,
                    fileType: 'announcement_post_video'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });
            }else{
                img = Announcement_Images.findOne({
                    announcementPostId: id,
                    fileType: 'announcement_post_cover_photo'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });
            }

            var mediums = post.mediums;

            if (mediums.indexOf('email')>0 && post.type!="video"){
                var content = post.content;
                // var find = "src='/";
                // var re = new RegExp(find, 'g');

                // content = content.replace(re, "src='http://localhost:3000/");

                // find = 'src="/';
                // re = new RegExp(find, 'g');

                // content = content.replace(re, 'src="http://localhost:3000/');

                var photo = Announcement_Images.findOne({
                    announcementPostId: id,
                    fileType: 'announcement_post_cover_photo',
                    //status: 'stored'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });

                var fphoto = Announcement_Images.findOne({
                    channelId: channel._id,
                    fileType: 'announcement_channel_footer_photo'
                }, {
                    sort: {uploadedAt: -1, limit:1}
                });

                var dataContext={
                    content: content,
                    cover: photo.S3Url('announcementImages'),
                    footer: fphoto.S3Url('announcementImages')
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

            if (post.type == "video"){
                Meteor.call('addTimeline', {
                    collection: 'announcement_posts',
                    postId: id,
                    postSlug: post.slug,
                    createdAt: now,
                    channelId: channel._id, //Meteor.userId(),
                    channelPath: channel.path, //Meteor.user().profile.nickName,
                    announcementType: post.type,
                    title: post.title,
                    description: (post.content.replace(rex , "")).substring(0,100).replace(/\s+/g, ' ').trim() + " ...",
                    tags: post.tags,
                    photoKey: vid.copies.announcementVideos.key
                }, function(error, result){
                    if (error)
                    throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to add timeline data.');
                    if (result)
                    return result;
                });
            }else{
                Meteor.call('addTimeline', {
                    collection: 'announcement_posts',
                    postId: id,
                    postSlug: post.slug,
                    createdAt: now,
                    channelId: channel._id, //Meteor.userId(),
                    channelPath: channel.path, //Meteor.user().profile.nickName,
                    announcementType: post.type,
                    title: post.title,
                    description: (post.content.replace(rex , "")).replace(/\s+/g, ' ').trim().substring(0,120) + " ...",
                    tags: post.tags,
                    photoKey: img.copies.announcementImages.key
                }, function(error, result){
                    if (error)
                    throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to add timeline data.');
                    if (result)
                    return result;
                });
            }

            // call fcm-push
            // import { FCM } from 'meteor/meteor';
            var FCM = require('fcm-push');
            var fcm = new FCM('AIzaSyCKKXE9QnKGPyRVC3MK8BDBAGoPYqDYtT8');

            var deviceToken = 'cMr_muxmFL0:APA91bHbbpocfOFjfh8xzjRUwnYhARy4_kiDDQsL2TfVitw-z8pA8bN4Ah7xJlwzHKskog6xhQEeLdzD9s93io2hDLJRjUoV3hfeFaKRxZTDxyLoXTr27sNKfbEVcB18rF6OuK9eJ4WE';
            var message = 'New announcement: ' + post.title;

            var message = {
                to: deviceToken,
                priority: 'high',
                collapse_key: 'your_collapse_key',
                data: {
                    your_custom_data_key: 'your_custom_data_value'
                },
                notification: {
                    title: 'Push notification test from playroom mobile',
                    body: message,
                    click_action: 'fcm.ACTION.HELLO',
                    sound: 'default',
                    color: '#ffffff'
                }
            };

            fcm.send(message, function(err, response){
                if (err) {
                    console.log("Something has gone wrong!");
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });

        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to update blog post status.');
        }
    },
    unpublishAnnouncementPost: function(id) {
        var post = Announcement_Posts.findOne(id);

        // check whether user is channel's valid editor
        var channel = Announcement_Channels.findOne({
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

        var res = Announcement_Posts.update(id, {
            $set: params
        });

        console.log('unpublish announcement: ' + res);

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
