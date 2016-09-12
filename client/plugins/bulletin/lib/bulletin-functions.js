bulletin_format_slug = function(value) {
    var formatted = value
                .toLowerCase()
                .replace(/ /g,'-')
                .replace(/[-]+/g, '-')
                .replace(/[^\w\x80-\xFF-]+/g,'');
    return formatted;
}

bulletin_post_cover_photo = function(id, size){
    var post = Bulletin_Posts.findOne(id);

    if (post){
        if (post.type=="video"){
            return '/images/icon-video.png';
        }else{
            var photo = Bulletin_Images.findOne({
                bulletinPostId: id,
                fileType: 'bulletin_post_cover_photo',
                //status: 'stored'
            }, {
                sort: {uploadedAt: -1, limit:1}
            }); 

            if (photo) {
                if(size == 'full')
                    return photo.S3Url('bulletinImages');
                else
                    return photo.S3Url('bulletinThumbs');
                //return '/cfs/files/images/' + photo._id + '?store='+type;
            }else{
                return '/images/placeholder.jpg';
            }
        }
    }else{
        return '/images/placeholder.jpg';
    }
}

bulletin_post_video = function(id){
    var video = Bulletin_Videos.findOne({
        bulletinPostId: id,
        fileType: 'bulletin_post_video'
    }, {
        sort: {uploadedAt: -1, limit:1}
    }); 

    if (video) {
        return video.S3Url('bulletinVideos');
    }else{
        return '#';
    }
}

bulletin_post_content_photo = function(id, size){
    var photo = Bulletin_Images.findOne({
        _id: id,
        fileType: 'bulletin_post_content_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('bulletinImages');
        else
            return photo.S3Url('bulletinThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}