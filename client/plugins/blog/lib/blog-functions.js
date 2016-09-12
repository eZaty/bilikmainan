blog_format_slug = function(value) {
    var formatted = value
                .toLowerCase()
                .replace(/ /g,'-')
                .replace(/[-]+/g, '-')
                .replace(/[^\w\x80-\xFF-]+/g,'');
    return formatted;
}

blog_post_cover_photo = function(id, size){
    var photo = Blog_Images.findOne({
        blogPostId: id,
        fileType: 'blog_post_cover_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('blogImages');
        else
            return photo.S3Url('blogThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}

blog_cover_photo = function(id, size){
    var photo = Blog_Images.findOne({
        blogId: id,
        fileType: 'blog_cover_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('blogImages');
        else
            return photo.S3Url('blogThumbs');
        //return '/cfs/files/images/' + photo._id + '?store='+type;
    }else{
        return '/images/placeholder.jpg';
    }
}

blog_post_content_photo = function(id, size){
    var photo = Blog_Images.findOne({
        _id: id,
        fileType: 'blog_post_content_photo',
        //status: 'stored'
    }, {
        sort: {uploadedAt: -1, limit:1}
    });

    if (photo) {
        if(size == 'full')
            return photo.S3Url('blogImages');
        else
            return photo.S3Url('blogThumbs');
    }else{
        return '/images/placeholder.jpg';
    }
}