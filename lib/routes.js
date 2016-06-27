var RoutePermission = function(routeName) {
    if (!Meteor.userId()) {
        Router.go('/login');
        return false;
    } else {
        var roles = ['admin'];
        var groups = Groups.find({
            routes: routeName
        });

        groups.forEach(function(group){
            roles.push(group.slug);
        });

        if(Roles.userIsInRole(Meteor.userId(), roles) || $.inArray('employee', roles) > 0) {
            // console.log(routeName, roles, 'permitted');
            Session.set('ACCESS_GRANTED', true);
            return true;
        }
        else {
            // console.log(routeName, roles, 'prohibited');
            Session.set('ACCESS_GRANTED', false);
            Router.go('/');
            ClientHelper.notify('danger', 'You do not have sufficient access to enter this page. Please <a href="/logout" class="text-white"><u><strong>re-login</strong></u></a> as appropriate user.', true);
            return false;
        }
    }
}

Router.configure({
    layoutTemplate: 'main.layout',
    loadingTemplate: 'loading'
});

// -- public
Router.route('/', {
    name: 'home',
    layoutTemplate: 'main.layout',
    waitOn: function() {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('feedbacks')
            // Meteor.subscribe('chats')
            // Meteor.subscribe('allUsers')
        ]
    },
    onBeforeAction: function() {
        // if (!Meteor.userId()) {
        //     Router.go('/login');
        // } else {
        //     ClientHelper.checkPermission();
        //     this.next();
        // }
        RoutePermission('home');
        this.next();
    },
    fastRender: true
});

Router.route('/webeme', {
    name: 'webeme',
    layoutTemplate: 'main.layout',
    waitOn: function() {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('feedbacks')
        ]
    },
    onBeforeAction: function() {
        RoutePermission('webeme');
        this.next();
    },
    fastRender: true
});

Router.route('/profile', {
    name: 'profile',
    layoutTemplate: 'main.layout',
    waitOn: function() {
        if(Meteor.isClient){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('feedbacks'),
                IRLibLoader.load('/scripts/spectrum.js'),
                IRLibLoader.load('/scripts/fileinput.min.js')
            ];
        } else if(Meteor.isServer){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('feedbacks')
            ];
        }
    },
    onBeforeAction: function() {
        RoutePermission('profile');
        this.next();
    },
    fastRender: true
});

Router.route('/profile/user/:_id', {
    name: 'profile-user',
    layoutTemplate: 'main.layout',
    waitOn: function() {
        if(Meteor.isClient){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('feedbacks'),
                IRLibLoader.load('/scripts/spectrum.js'),
                IRLibLoader.load('/scripts/fileinput.min.js')
            ];
        } else if(Meteor.isServer){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('feedbacks'),
            ];
        }
    },
    onBeforeAction: function() {
        RoutePermission('profile-user');
        this.next();
    },
    fastRender: true
});

Router.route('/photo-gallery', {
    name: 'photo-gallery',
    layoutTemplate: 'main.layout',
    waitOn: function() {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('tags'),
            Meteor.subscribe('limit-galleries', 0, 20),
            Meteor.subscribe('galleries-count')
        ];
    },
    onBeforeAction: function() {
        RoutePermission('photo-gallery');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin', {
    name: 'adminDashboard',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            Meteor.subscribe('user-roles')
        ];
    },
    onBeforeAction: function() {
        RoutePermission('adminDashboard');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin/users', {
    name: 'adminUserList',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('groups')
        ];
    },
    onBeforeAction: function() {
        RoutePermission('adminUserList');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin/groups', {
    name: 'adminUserGroup',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('groups')
        ];
    },
    onBeforeAction: function() {
        RoutePermission('adminUserGroup');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin/photo-gallery', {
    name: 'adminPhotoGallery',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        if(Meteor.isClient){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('galleries'),
                Meteor.subscribe('tags'),
                IRLibLoader.load('/scripts/fancybox.min.js'),
                IRLibLoader.load('/scripts/datatables.min.js'),
                IRLibLoader.load('/scripts/fileinput.min.js')
            ];
        } else if(Meteor.isServer){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('galleries'),
                Meteor.subscribe('tags')
            ];
        }
    },
    onBeforeAction: function() {
        RoutePermission('adminPhotoGallery');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin/polls', {
    name: 'adminPolls',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        if(Meteor.isClient){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('polls'),
                IRLibLoader.load('/scripts/datatables.min.js'),
            ];
        } else if(Meteor.isServer){
            return [
                Meteor.subscribe('user-roles'),
                Meteor.subscribe('polls'),
            ];
        }
    },
    onBeforeAction: function() {
        RoutePermission('adminPolls');
        this.next();
    },
    fastRender: true
});


// by fahmi --
Router.route('/playbook', {
    name: 'playbook',
    layoutTemplate: 'main.layout',
    waitOn: function () {
        return [
            Meteor.subscribe('user-roles')
        ];
    },
    onBeforeAction: function() {
        RoutePermission('playbook');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin/webeeID', {
    name: 'adminWebeeID',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('pendingUsers'),

            Meteor.subscribe('users-count'),
            Meteor.subscribe('pendingUsers-count'),
            Meteor.subscribe('newUsers-count'),
            Meteor.subscribe('approvedUsers-count'),
            Meteor.subscribe('printedUsers-count'),
            Meteor.subscribe('rejectedUsers-count'),
            Meteor.subscribe('collectedUsers-count')
        ];
    },
    onBeforeAction: function() {
        RoutePermission('adminWebeeID');
        this.next();
    },
    fastRender: true
});

Router.route('/__admin/webeeID/updateNumber', {
    name: 'IDNumberUpdate',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            Meteor.subscribe('user-roles'),
            Meteor.subscribe('allUsers')
        ];
    },
    onBeforeAction: function() {
        // if (!Meteor.userId()) {
        //     Router.go('/login');
        // } else if(!Roles.userIsInRole(Meteor.userId(), ['admin','editor'])) {
        //     Router.go('/');
        // } else {
        //     this.next();
        // }
        RoutePermission('IDNumberUpdate');
        this.next();
    },
    fastRender: true
});


// -- authentication
Router.route('/login', {
    name: 'login',
    layoutTemplate: 'auth.layout',
    onBeforeAction: function() {
        if (Meteor.userId()) {
            Router.go('/');
        }
        this.next();
    },
    fastRender: true
});

Router.route('/logout', {
    name: 'logout',
    layoutTemplate: 'auth.layout',
    onBeforeAction: function() {
        if (Meteor.userId()) {
            Meteor.logout(function(){
                Router.go('/login');
            });
        }
        this.next();
    },
    fastRender: true
});







Router.route('/__admin/blog', {
    name: 'adminBlogList',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            IRLibLoader.load('/scripts/select2/js/select2.min.js'),
            IRLibLoader.load('/scripts/select2/css/select2.min.css'),
            Meteor.subscribe('roles'),
            Meteor.subscribe('admins', Meteor.userId()),
            Meteor.subscribe('groups'),
            Meteor.subscribe('allUsers'),
            Meteor.subscribe('blog_images'),
            Meteor.subscribe('profiles'),
            Meteor.subscribe('blogs')
        ];
    },
    onBeforeAction: function() {
        if (!Meteor.userId()) {
            Router.go('/login');
        } else if(!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
            Router.go('/');
        } else {
            this.next();
        }
    }
});

Router.route('/__admin/blog/mine', {
    name: 'adminMyBlog',
    layoutTemplate: 'adminLayout',
    waitOn: function () {
        return [
            Meteor.subscribe('roles'),
            Meteor.subscribe('admins', Meteor.userId()),
            Meteor.subscribe('groups'),
            Meteor.subscribe('allUsers'),
            Meteor.subscribe('blog_images'),
            Meteor.subscribe('profiles'),
            Meteor.subscribe('blogs'),
            Meteor.subscribe('blog_posts')
        ];
    },
    onBeforeAction: function() {
        if (!Meteor.userId()) {
            Router.go('/login');
        } else if(!Roles.userIsInRole(Meteor.userId(), ['admin','blog-editor'])) {
            Router.go('/');
        } else {
            this.next();
        }
    }
});
