BLOG_CONFIG = {};
BLOG_CONFIG.root = "magz";
BLOG_CONFIG.maxFeaturedPostsListing = 10;

Router.route('/' + BLOG_CONFIG.root + '/:blog/:slug', {
    waitOn: function() {
        return [ Meteor.subscribe('blogs'),
                    Meteor.subscribe('blog_posts'),
                    Meteor.subscribe('allUsers'),
                    Meteor.subscribe('blog_images'),
                    Meteor.subscribe('profiles'),
                    IRLibLoader.load('/scripts/spectrum.js'),
                    IRLibLoader.load('/scripts/fileinput.min.js')
                ];
    },
    data: function(){
        if (!this.ready()) return;

        Session.set('isMobileDevice', false);

        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var blog = Blogs.findOne({"path": this.params.blog});

            if (blog){
                var isEditor = false;
                Session.set('CURRENT_USER_IS_EDITOR', false);
                var editors = blog.editors;

                for (i=0; i<editors.length; i++){
                    if (editors[i].user_id==Meteor.userId()){
                        isEditor = true;
                        Session.set('CURRENT_USER_IS_EDITOR', true);
                    }
                }

                if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
                    isEditor = true;
                    Session.set('CURRENT_USER_IS_EDITOR', true);
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
                    Meteor.subscribe('comments', post._id);

                    Session.set('currentBlogPost',post._id);
                    this.render('blogSinglePost', { data: post });
                }else{
                    this.render("blogErrorPage", {
                        data: {
                            message: 'post not found: ' + blog.path + '/' + this.params.slug 
                        }
                    });
                }
            }else{
                this.render("blogErrorPage", {
                    data: {
                        message: 'blog not found: ' + this.params.blog 
                    }
                });
            }
        }
    }
});

Router.route('/' + BLOG_CONFIG.root + '/:blog/:slug/:userId/:deviceToken', {
    waitOn: function() {
        return [ Meteor.subscribe('devices'),
                    Meteor.subscribe('blogs'),
                    Meteor.subscribe('blog_posts'),
                    Meteor.subscribe('allUsers'),
                    Meteor.subscribe('blog_images'),
                    Meteor.subscribe('profiles'),
                    IRLibLoader.load('/scripts/spectrum.js'),
                    IRLibLoader.load('/scripts/fileinput.min.js')
                ];
    },
    data: function(){
        
        if (!this.ready()) return;

        var validDevice = Devices.findOne({
            userId: this.params.userId,
            deviceToken: this.params.deviceToken
        });

        if (validDevice || Meteor.userId()){
            Session.set('isMobileDevice', true);

            var blog = Blogs.findOne({"path": this.params.blog});

            if (blog){
                var isEditor = false;
                Session.set('CURRENT_USER_IS_EDITOR', false);
                var editors = blog.editors;

                for (i=0; i<editors.length; i++){
                    if (editors[i].user_id==Meteor.userId()){
                        isEditor = true;
                        Session.set('CURRENT_USER_IS_EDITOR', true);
                    }
                }

                if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
                    isEditor = true;
                    Session.set('CURRENT_USER_IS_EDITOR', true);
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
                    Meteor.subscribe('comments', post._id);

                    Session.set('currentBlogPost',post._id);

                    this.render('blogSinglePost', { data: post });
                }else{
                    this.render("blogErrorPage", {
                        data: {
                            message: 'post not found: ' + blog.path + '/' + this.params.slug 
                        } 
                    });
                }
            }else{
                this.render("blogErrorPage", {
                    data: {
                        message: 'blog not found: ' + this.params.blog
                    }
                });
            }
        }else{
            this.render("blogErrorPage", {
                data: {
                    message: 'unauthorized access'
                }
            });
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
