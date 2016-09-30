BULLETIN_CONFIG = {};
BULLETIN_CONFIG.root = "bulletin";
BULLETIN_CONFIG.maxFeaturedPostsListing = 10;

Router.route('/' + BULLETIN_CONFIG.root + '/:channel/:slug', {
    waitOn: function() {
        return [ Meteor.subscribe('channels'),
                    Meteor.subscribe('bulletin_posts'),
                    Meteor.subscribe('bulletin_post_types'),
                    Meteor.subscribe('allUsers'),
                    Meteor.subscribe('bulletin_images'),
                    Meteor.subscribe('bulletin_videos'),
                    Meteor.subscribe('mailing_lists'),
                    Meteor.subscribe('profiles'),
                    IRLibLoader.load('/scripts/spectrum.js'),
                    IRLibLoader.load('/scripts/fileinput.min.js')
                ];
    },
    data: function(){
        //if (!this.ready()) return;
        
        Session.set('isMobileDevice', false);

        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var channel = Channels.findOne({"path": this.params.channel});

            if (channel){
                var isEditor = false;
                Session.set('CURRENT_USER_IS_EDITOR', false);
                var editors = channel.editors;

                // console.log('editors: ' + editors);
                // console.log('i am ' + Meteor.userId());

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
                    "channel_id": channel._id,
                    "slug": this.params.slug
                }

                if (!isEditor){
                    params.status = "published";
                }

                var post = Bulletin_Posts.findOne(
                    params
                );

                if (post){
                    Meteor.subscribe('comments', post._id);
                    this.render('bulletinSinglePost', { data: post });
                }else{
                    this.render("bulletinErrorPage", {
                        data: {
                            message: 'bulletin not found: ' + channel.path + '/' + this.params.slug 
                        }                        
                    });
                }
            }else{
                this.render("bulletinErrorPage", {
                    data: {
                        message: 'channel not found: ' + this.params.channel 
                    }                        
                });
            }
        }
    }
});


/* for mobile device */
Router.route('/' + BULLETIN_CONFIG.root + '/:channel/:slug/:userId/:deviceToken', {
    waitOn: function() {
        return [ Meteor.subscribe('devices'),
                    Meteor.subscribe('bulletin_channels'),
                    Meteor.subscribe('bulletin_posts'),
                    Meteor.subscribe('allUsers'),
                    Meteor.subscribe('bulletin_images'),
                    Meteor.subscribe('bulletin_videos'),
                    Meteor.subscribe('bulletin_mailing_lists'),
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

            var channel = Channels.findOne({"path": this.params.channel});

            if (channel){
                var isEditor = false;
                Session.set('CURRENT_USER_IS_EDITOR', false);
                var editors = channel.editors;

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
                    "channel_id": channel._id,
                    "slug": this.params.slug
                }

                if (!isEditor){
                    params.status = "published";
                }

                var post = Bulletin_Posts.findOne(
                    params
                );

                if (post){
                    Meteor.subscribe('comments', post._id);

                    this.render('bulletinSinglePost', { data: post });
                }else{
                    this.render("bulletinErrorPage", {
                        data: {
                            message: 'bulletin not found: ' + channel.path + '/' + this.params.slug 
                        }                        
                    });
                }
            }else{
                this.render("bulletinErrorPage", {
                    data: {
                        message: 'channel not found: ' + this.params.channel 
                    }                        
                });
            }
        } else {
            this.render("bulletinErrorPage", {
                data: {
                    message: 'unauthorized access'
                }
            });
        }

    }
});


Router.route('/' + BULLETIN_CONFIG.root + '/:channel', {
    layoutTemplate: 'bulletinAllPosts',
    waitOn: function() {
        return [
            IRLibLoader.load('/scripts/jquery.easing.1.3.js'),
            IRLibLoader.load('/scripts/jquery.waypoints.min.js'),
            IRLibLoader.load('/scripts/modernizr-2.6.2.min.js'),
            IRLibLoader.load('/styles/animate.css'),
            Meteor.subscribe('channels'),
            Meteor.subscribe('bulletin_posts'),
            Meteor.subscribe('mailing_lists'),
            Meteor.subscribe('allUsers'),
            Meteor.subscribe('bulletin_images')
            ];
    },
    data: function(){
        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var channel = Channels.findOne({"path": this.params.channel});
            if (channel){
                return channel;
            }else{
                this.render("bulletinErrorPage", {
                    data: {
                        message: 'channel not found: ' + this.params.channel 
                    }                        
                });
            }
        }
    },
    action : function () {
        if (this.ready()) {
            this.render();
        }
    }
});
