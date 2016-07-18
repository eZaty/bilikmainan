ANNOUNCEMENT_CONFIG = {};
ANNOUNCEMENT_CONFIG.root = "announcement";
ANNOUNCEMENT_CONFIG.maxFeaturedPostsListing = 10;

Router.route('/' + ANNOUNCEMENT_CONFIG.root + '/:channel/:slug', {
    layoutTemplate: 'announcementSinglePost',
    waitOn: function() {
        return [ Meteor.subscribe('announcement_channels'),
                    Meteor.subscribe('announcement_posts'),
                    Meteor.subscribe('allUsers'),
                    Meteor.subscribe('announcement_images'),
                    Meteor.subscribe('announcement_videos'),
                    Meteor.subscribe('announcement_mailing_lists'),
                    Meteor.subscribe('profiles'),
                    IRLibLoader.load('/scripts/spectrum.js'),
                    IRLibLoader.load('/scripts/fileinput.min.js')
                ];
    },
    data: function(){
        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var channel = Announcement_Channels.findOne({"path": this.params.channel});

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

                var post = Announcement_Posts.findOne(
                    params
                );

                if (post){
                    Meteor.subscribe('comments', post._id);
                    return post;
                }else{
                    console.log('post not found: ' + channel.path + '/' + this.params.slug);
                    this.render("announcementNotFound");
                }
            }else{
                console.log('channel not found: ' + this.params.channel);
                this.render("announcementNotFound");
            }
        }
    }
});


Router.route('/' + ANNOUNCEMENT_CONFIG.root + '/:channel', {
    layoutTemplate: 'announcementAllPosts',
    waitOn: function() {
        return [
            IRLibLoader.load('/scripts/jquery.easing.1.3.js'),
            IRLibLoader.load('/scripts/jquery.waypoints.min.js'),
            IRLibLoader.load('/scripts/modernizr-2.6.2.min.js'),
            IRLibLoader.load('/styles/animate.css'),
            Meteor.subscribe('announcement_channels'),
            Meteor.subscribe('announcement_posts'),
            Meteor.subscribe('announcement_mailing_lists'),
            Meteor.subscribe('allUsers'),
            Meteor.subscribe('announcement_images')
            ];
    },
    data: function(){
        if (!Meteor.userId()) {
            Router.go('/login');
        } else {
            var channel = Announcement_Channels.findOne({"path": this.params.channel});
            if (channel){
                return channel;
            }else{
                console.log('channel not found: ' + this.params.channel);
                this.render("announcementNotFound");
            }
        }
    },
    action : function () {
        if (this.ready()) {
            this.render();
        }
    }
});
