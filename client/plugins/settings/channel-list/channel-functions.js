channel_footer_photo = function(id, size){
    var photo = Channel_Images.findOne({
        channelId: id,
        fileType: 'channel_footer_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('channelImages');
        else
            return photo.S3Url('channelThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}

channel_cover_photo = function(id, size){
    var photo = Channel_Images.findOne({
        channelId: id,
        fileType: 'channel_cover_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('channelImages');
        else
            return photo.S3Url('channelThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}