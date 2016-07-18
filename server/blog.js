Meteor.publish('blogs', function() {
  return Blogs.find();
});

Meteor.publish('blog_posts', function() {
  return Blog_Posts.find();
});

// Meteor.publish('limit_blog_posts', function (skip, limit){
//     check(skip, Number);
//     check(limit, Number);
//     return Blog_Posts.find({},{
//         skip: skip,
//         limit: limit,
//         sort: {
//             created_at: -1
//         }
//     });
// });

// Meteor.publish('blog_comments', function() {
//   return Blog_Comments.find();
// });

// Meteor.publish('limit_blog_comments', function (skip, limit){
//     check(skip, Number);
//     check(limit, Number);
//     return Blog_Comments.find({},{
//         skip: skip,
//         limit: limit,
//         sort: {
//             created_at: -1
//         }
//     });
// });

Meteor.publish('editors', function(userId) {
    return Meteor.users.find({
        _id: userId
    });
});

Meteor.publish('blog_images', function() {
    return Blog_Images.find();
});

Blog_Images.allow({
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
    promoteEditor: function(id){
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }else{
            console.log('promoteEditor: ' + id);
            Roles.addUsersToRoles(id, ['editor']);
        }
    },

    revokeEditor: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }else{
            console.log('revokeEditor: ' + id);
            Roles.removeUsersFromRoles( id, 'editor' );
        }
    },

    addBlog: function(params){
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

        return Blogs.insert(data);
    },

    deleteBlog: function(id) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        Meteor.call('removeBlogCoverImage', id, function(err, res){});
        
        return Blogs.remove(id);
    },

    updateBlog: function(id, params) {
        if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user does not has administrator permission.');
        }

        var now = new Date();

        var audit = {
            'updated_at': now,
            'updated_by': Meteor.userId() 
        }

        var data = merge2JsonObjects(params, audit);

        return Blogs.update(id, {
            $set: data
		});
	},

	addBlogPost: function(params){
        // check whether user is blog's valid editor
        var blogs = Blogs.findOne({
            _id: params.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blogs){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
        }

    	var now = new Date();

    	var audit = {
    		'created_at': now,
    		'created_by': Meteor.userId()
    	}

    	var data = merge2JsonObjects(params, audit);
        
        return Blog_Posts.insert(data);
    },

    deleteBlogPost: function(id) {
        var post = Blog_Posts.findOne(id);
        if (!post){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Blog post does not exist.');
        }

        // check whether user is blog's valid editor
        var blogs = Blogs.findOne({
            _id: post.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blogs){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
        }

        // delete cover 1st
        Meteor.call('removeBlogPostCoverImage', id, function(err, res){});

        return Blog_Posts.remove(id);
    },

    updateBlogPost: function(id, params) {
        // check whether user is blog's valid editor
        var blogs = Blogs.findOne({
            _id: params.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blogs){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
        }

        var now = new Date();

    	var audit = {
    		'updated_at': now,
    		'updated_by': Meteor.userId() 
    	}

    	var data = merge2JsonObjects(params, audit);

        return Blog_Posts.update(id, {
            $set: data
		});
	},

	addBlogComment: function(params){
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

    	var now = new Date();

    	var audit = {
    		'createdAt': now,
    		'userId': Meteor.userId(),
            'collection': 'blog_posts' 
    	}

    	var data = merge2JsonObjects(params, audit);

        return Comments.insert(data);
    },

    deleteBlogComment: function(id) {
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        return Comments.remove(id);
    },

    updateBlogComment: function(id, params) {
        if (!Meteor.userId()){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in.');
        }

        var now = new Date();

    	var audit = {
    		'updatedAt': now,
    		'userId': Meteor.userId(),
            'collection': 'blog_posts' 
        }

    	var data = merge2JsonObjects(params, audit);

        return Comments.update(id, {
            $set: data
		});
	},

    // uploadBlogPostCoverImage: function(image) {
    //     var photo = Uploads.findOne({
    //         blogPostId: image.blogPostId,
    //         fileType: 'blog_post_cover_photo',
    //         status: 'stored'
    //     });

    //     if (photo){
    //         Uploads.remove(photo._id);
    //     }

    //     console.log('blogPostId: ' + image.blogPostId);

    //     return Uploads.insert(image, function(err, fileObj){
    //         if (err){
    //             console.log("Error: " + err);
    //         }
    //     });
    // },

    removeBlogPostCoverImage: function(id) {
        var photo = Blog_Images.findOne({
            blogPostId: id,
            fileType: 'blog_post_cover_photo'
        });

        if (photo){
            Blog_Images.remove(photo._id);
        }
    },

    removeBlogCoverImage: function(id) {
        var photo = Blog_Images.findOne({
            blogId: id,
            fileType: 'blog_cover_photo'
        });

        if (photo){
            Blog_Images.remove(photo._id);
        }
    },

    setFeaturedBlogPost: function(id) {
        // check whether user is blog's valid editor

        var post = Blog_Posts.findOne(id);

        var blog = Blogs.findOne({
            _id: post.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blog){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
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

        return Blog_Posts.update(id, {
            $set: data
        });
    },

    revokeFeaturedBlogPost: function(id) {
        // check whether user is blog's valid editor
        var post = Blog_Posts.findOne(id);

        var blog = Blogs.findOne({
            _id: post.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blog){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
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

        return Blog_Posts.update(id, {
            $set: data
        });
    },

    updateBlogImage: function(id, params){
        return Blog_Images.update(id, {$set: params});
    },

    publishBlogPost: function(id) {
        var post = Blog_Posts.findOne(id);

        // check whether user is blog's valid editor
        var blog = Blogs.findOne({
            _id: post.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blog){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
        }

        var now = new Date();

        var params = {
            'status': 'published',
            'updated_at': now,
            'updated_by': Meteor.userId() 
        }
        
        var res = Blog_Posts.update(id, {
            $set: params
        });

        console.log('publish post: ' + res);

        var rex = /(<([^>]+)>)/ig;

        if (res){
            var img = Blog_Images.findOne({
                blogPostId: id,
                fileType: 'blog_post_cover_photo'
            });

            Meteor.call('addTimeline', {
                collection: 'blog_posts',
                postId: id,
                postSlug: post.slug,
                createdAt: now,
                blogId: blog._id, //Meteor.userId(),
                blogPath: blog.path, //Meteor.user().profile.nickName,
                title: post.title,
                description: (post.content.replace(rex , "")).replace(/\s+/g, ' ').trim().substring(0,120) + " ...",
                tags: post.tags,
                photoKey: img.copies.blogImages.key
            }, function(error, result){
                if (error)
                    throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to delete timeline data.');
                if (result)
                    return result;
            });
        }else{
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Failed to update blog post status.');
        }        
    },
    unpublishBlogPost: function(id) {
        var post = Blog_Posts.findOne(id);

        // check whether user is blog's valid editor
        var blog = Blogs.findOne({
            _id: post.blog_id    
        },{
            'editors.user_id': Meteor.userId()
        });

        if (!blog){
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Current user is not editor of the blog');
        }

        var now = new Date();

        var params = {
            'status': 'draft',
            'updated_at': now,
            'updated_by': Meteor.userId() 
        }
        
        var res = Blog_Posts.update(id, {
            $set: params
        });

        console.log('unpublish post: ' + res);

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
