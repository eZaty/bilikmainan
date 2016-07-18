announcement_format_slug = function(value) {
    var formatted = value
                .toLowerCase()
                .replace(/ /g,'-')
                .replace(/[-]+/g, '-')
                .replace(/[^\w\x80-\xFF-]+/g,'');
    return formatted;
}

announcement_post_cover_photo = function(id, size){
    var post = Announcement_Posts.findOne(id);

    if (post){
        if (post.type=="video"){
            return '/images/icon-video.png';
        }else{
            var photo = Announcement_Images.findOne({
                announcementPostId: id,
                fileType: 'announcement_post_cover_photo',
                //status: 'stored'
            }, {
                sort: {uploadedAt: -1, limit:1}
            }); 

            if (photo) {
                if(size == 'full')
                    return photo.S3Url('announcementImages');
                else
                    return photo.S3Url('announcementThumbs');
                //return '/cfs/files/images/' + photo._id + '?store='+type;
            }else{
                return '/images/placeholder.jpg';
            }
        }
    }else{
        return '/images/placeholder.jpg';
    }
}

announcement_post_video = function(id){
    var video = Announcement_Videos.findOne({
        announcementPostId: id,
        fileType: 'announcement_post_video',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    }); 

    if (video) {
        return video.S3Url('announcementVideos');
    }else{
        return '#';
    }
}

announcement_channel_cover_photo = function(id, size){
    var photo = Announcement_Images.findOne({
        channelId: id,
        fileType: 'announcement_channel_cover_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('announcementImages');
        else
            return photo.S3Url('announcementThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}

announcement_channel_footer_photo = function(id, size){
    var photo = Announcement_Images.findOne({
        channelId: id,
        fileType: 'announcement_channel_footer_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('announcementImages');
        else
            return photo.S3Url('announcementThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}

announcement_post_content_photo = function(id, size){
    var photo = Announcement_Images.findOne({
        _id: id,
        fileType: 'announcement_post_content_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('announcementImages');
        else
            return photo.S3Url('announcementThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}