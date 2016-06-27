BLOG_CONFIG = {};
BLOG_CONFIG.root = "magz";
BLOG_CONFIG.maxFeaturedPostsListing = 10;

Router.route('/' + BLOG_CONFIG.root + '/:blog/:slug', {
    layoutTemplate: 'blogSinglePost',
    waitOn: function() {
        return [ Meteor.subscribe('blogs'),
                    Meteor.subscribe('blog_posts'),
                    Meteor.subscribe('allUsers'),
                    Meteor.subscribe('blog_images'),
                    Meteor.subscribe('blog_comments'),
                    Meteor.subscribe('profiles'),
                    IRLibLoader.load('/scripts/spectrum.js'),
                    IRLibLoader.load('/scripts/fileinput.min.js')
                ];
    },
    data: function(){
        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var blog = Blogs.findOne({"path": this.params.blog});

            if (blog){
                var isEditor = false;

                var editors = blog.editors;

                for (i=0; i<editors.length; i++){
                    if (editors[i].user_id==Meteor.userId()){
                        isEditor = true;
                    }
                }

                if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
                    isEditor = true;
                }

                var params = {
                    "blog_id": blog._id, 
                    "slug": this.params.slug
                }

                if (!isEditor){
                    params.status = "published";
                }

                var post = Blog_Posts.findOne(
                    params
                );

                if (post){
                    Session.set('currentBlogPost',post._id);
                    return post;
                }else{
                    console.log('post not found: ' + blog.path + '/' + this.params.slug);
                    this.render("blogNotFound");
                }
            }else{
                console.log('blog not found: ' + this.params.blog);
                this.render("blogNotFound");
            }
        }
    }
});


Router.route('/' + BLOG_CONFIG.root + '/:blog', {
    layoutTemplate: 'blogAllPosts',
    waitOn: function() {
        return [
            IRLibLoader.load('/scripts/jquery.easing.1.3.js'),
            IRLibLoader.load('/scripts/jquery.waypoints.min.js'),
            IRLibLoader.load('/scripts/modernizr-2.6.2.min.js'),
            IRLibLoader.load('/styles/animate.css'),
            Meteor.subscribe('blogs'),
            Meteor.subscribe('blog_posts'),
            Meteor.subscribe('allUsers'),
            Meteor.subscribe('blog_images'),
            Meteor.subscribe('profiles')
            ];
    },
    data: function(){
        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var blog = Blogs.findOne({"path": this.params.blog});
            if (blog){
                return blog;
            }else{
                console.log('blog not found: ' + this.params.blog);
                this.render("blogNotFound");
            }
        }
    },
    action : function () {
        if (this.ready()) {
            this.render();
        }
    }
});