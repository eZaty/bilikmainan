Template.registerHelper('profile_s3', function(userId, size){
    var photo = Profiles.findOne({
        userId: userId
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo){
        if(size == 'full') return photo.S3Url('profileImages');
        else return photo.S3Url('profileThumbs');
    } else {
        return '/images/default-id.png';
    }
});

Template.registerHelper('profile_s3_internal', function(userId, size){
    var photo = Profiles.findOne({
        userId: userId
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo){
        if(size == 'full') return photo.url('profileImages');
        else return photo.url('profileThumbs');
    } else {
        return '/images/default-id.png';
    }
});

Template.registerHelper('cover_photo', function(userId, size){
    var cover = Covers.findOne({
        userId: userId
    });

    if (cover){
        return cover.S3Url('coverImages');
    } else {
        return '/images/backgrounds/holi.jpeg';
    }
});

Template.registerHelper('gallery_photo', function(galleryId, size){
    var photo = Galleries.findOne({
        _id: galleryId
    });

    if (photo){
        if(size == 'full') return photo.S3Url('galleryImages');
        else return photo.S3Url('galleryThumbs');
    } else {
        return '/images/placeholder.png';
    }
});

Template.registerHelper('user_nickname', function(userId){
    var user = Meteor.users.findOne(userId, {
        fields: {
            'profile.nickName': 1
        }
    });
    if(user) return user.profile.nickName;
    else return false;
});

Template.registerHelper('getFullname', function(id){
    var user = Meteor.users.findOne(id);

    if (user){
        return user.profile.name
    }else{
        return "-"
    }
});

Template.registerHelper('formatDate', function(time){
    var date = moment(time).format("Do MMM YYYY, H:mma");
    return date;
});

Template.registerHelper('formatDateCustom', function(time,customFormat){
    var date = moment(time).format(customFormat);
    return date;
});

Template.registerHelper('time_age', function(time){
    return moment(time).fromNow();
});

Template.registerHelper('isNotEmpty', function(o){
    if(o) return true;
    else return false;
});

Template.registerHelper('isEqual', function(a, b){
    return (a == b);
});

Template.registerHelper('isNotEqual', function(a, b){
    return (a != b);
});

Template.registerHelper('hasPermission', function(route){
    return ClientHelper.permission(route);
});

Template.registerHelper('titleize', function(str){
    return s.titleize(str);
});

Template.registerHelper('nl2br', function(text) {
    var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
    return nl2br;
});

Template.registerHelper('isAdminWebeeID', function(id) {
    if (id){
        return Roles.userIsInRole(id, ['admin', 'admin-webeeid']);
    }else{
        return Roles.userIsInRole(Meteor.userId(), ['admin', 'admin-webeeid']);
    }
});

Template.registerHelper('channel_cover', function(id){
    channel_cover_photo(id,'full');
});

Template.registerHelper('channel_path', function(id){
    var channelId = id;

    if (!id){
        channelId = Session.get('selectedChannelId');
    }
    
    var channel = Channels.findOne(channelId);

    if (channel){
        return channel.path;
    }else{
        return '[undefined]';
    }
});

Template.registerHelper('getChannelName', function(id){
    var channel = Channels.findOne(id);

    if (channel){
        return channel.title
    }else{
        return "-"
    }
});

// bulletin_channel_footer_photo = function(id, size){
//     var photo = Bulletin_Images.findOne({
//         channelId: id,
//         fileType: 'bulletin_channel_footer_photo',
//         //status: 'stored'
//     }, {
//         sort: {uploadedAt: -1, limit:1}
//     });

//     if (photo) {
//         if(size == 'full')
//             return photo.S3Url('bulletinImages');
//         else
//             return photo.S3Url('bulletinThumbs');
//         //return '/cfs/files/images/' + photo._id + '?store='+type;
//     }else{
//         return '/images/placeholder.jpg';
//     }
// }
