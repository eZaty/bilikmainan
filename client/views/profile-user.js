var max = 20;
var Helpers = {
    picsLoaded: function(oldpic, thumbpic) {
        var newpic = $('#photo > img').attr('src');

        if((newpic != oldpic && newpic != '/images/default-id.png') || thumbpic == '/images/default-id.png') {
            $('#loading-pic').addClass('hide');
        } else {
            setTimeout(function () {
                Helpers.picsLoaded(oldpic, thumbpic);
            }, 1000);
        }
    }
}

Template.profileUser.onCreated(function(){
    instance = this;
    instance.profileOwner = new ReactiveVar('');

    instance.autorun(function(){
        var profileId = Router.current().params._id;
        instance.profileOwner.set(Meteor.users.findOne(profileId));

        Meteor.subscribe('uploadsByUserId', profileId);
        Meteor.subscribe('selectedUser', profileId);
        Meteor.subscribe('selectedUserProfile', profileId);
        Meteor.subscribe('currentUserCover', profileId);
    });

    // -- user directory
    instance.skip = new ReactiveVar(0);
    instance.limit = max;
    instance.loaded = new ReactiveVar(max);

    instance.autorun(function() {
        if(Session.get('SEARCH_QUERY')) {
            Meteor.subscribe('limitSearchUsers', Session.get('SEARCH_QUERY'), instance.skip.get(), instance.limit);
            Meteor.subscribe('searchUsers-count', Session.get('SEARCH_QUERY'));
        } else {
            Meteor.subscribe('limitUsers', instance.skip.get(), instance.limit);
            Meteor.subscribe('users-count');
        }
        Meteor.subscribe('profiles');
    });
});

Template.profileUser.onRendered(function(){
    ClientHelper.fixedHeader();
    instance = this;

    var hash = Router.current().params.hash;
    if(hash) {
        $('a[href="#'+hash+'"]').click();
    }

});

Template.profileUser.helpers({
    'uploads':function(){
        return Uploads.find();
    },

    'currentUser': function() {
        return Template.instance().profileOwner.get();
    },

    'getNickName': function() {
        var profileOwner = Template.instance().profileOwner.get();
        if(!profileOwner) return;

        if(!profileOwner.profile.nickName) {
            return profileOwner.profile.givenName;
        } else {
            return profileOwner.profile.nickName;
        }
    },

    'getWebeeId': function() {
        var profileOwner = Template.instance().profileOwner.get();
        if(!profileOwner) return;
        if(!profileOwner.profile.webeeId) {
            return '0000';
        } else {
            return profileOwner.profile.webeeId;
        }
    },

    'getGreeting': function() {
        var profileOwner = Template.instance().profileOwner.get();
        if(!profileOwner) return;
        if(!profileOwner.profile.greeting) {
            return 'hi, i\'m';
        } else {
            return profileOwner.profile.greeting;
        }
    },

    'getLogo': function() {
        var profileOwner = Template.instance().profileOwner.get();
        if(!profileOwner) return;
        if(profileOwner.profile.logo) return '/images/logos/'+profileOwner.profile.logo+'.png';
        else return '/images/logos/logo0.png';
    },

    'getPattern': function() {
        var profileOwner = Template.instance().profileOwner.get();
        if(!profileOwner) return;
        if(profileOwner.profile.pattern) return '/images/patterns/'+profileOwner.profile.pattern+'.png';
        else return '/images/patterns/pattern1.png';
    },

    'getColor': function() {
        var profileOwner = Template.instance().profileOwner.get();
        if(!profileOwner) return;

        if(profileOwner.profile.color) return profileOwner.profile.color;
        else return '00A6A3';
    },

    // 'usersIndex': function() {
    //     // console.log("UsersIndex", UsersIndex);
    //     // UsersIndex.forEach(function(u) {
    //     //     console.log("user", u);
    //     // });
    //     return UsersIndex;
    // },
    // 'searchAttribs': function() {
    //     return {
    //         placeholder: 'Search by webee name, email or department...',
    //         class: 'form-control'
    //     }
    // }

    'searchedUsers': function() {
        var searchString = Session.get('SEARCH_QUERY');
        if(searchString) {
            return Meteor.users.find({
                $or : [
                    { 'profile.name':{ $regex:searchString, $options: 'i'} },
                    { 'profile.nickName':{$regex:searchString, $options: 'i'} },
                    { 'profile.department':{$regex:searchString, $options: 'i'} }
                ]
            });
        } else {
            return Meteor.users.find();
        }
    },

    'pagings': function() {
        var total = Counts.get('users');
        var totalPage = Math.ceil(total / max);
        var arr = [];
        for (var i = 0; i < totalPage; i++) {
            arr.push({
                number: (i + 1),
                skip: (i * max)
            });
        }
        return arr;
    }
});

Template.profileUser.events({
    'click .logout-btn' : function(e) {
        e.preventDefault();
        Meteor.logout();
    },

    'click .smooth-scroll': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var div = elem.attr('href');
        var navbarHeight = $('.navbar').height();
        $('.head-fixed').addClass('fixed');
        $('html, body').animate({
            scrollTop: $(div).offset().top - navbarHeight - 15
        }, 1000);
        $('.smooth-scroll').each(function(){
            $(this).closest('li').removeClass('active');
        });
        elem.closest('li').addClass('active');
    },

    'click .paging-btn': function(e, instance) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var skip = elem.data('skip');
        instance.skip.set(skip);
        $('.paging-btn').each(function(){
            $(this).removeClass('bg-primary');
        });
        elem.addClass('bg-primary');
    },

    'keyup #search-keyword': function(e, instance) {
        e.preventDefault();
        var keyword = $('#search-keyword').val();
        instance.skip.set(0);
        Session.set('SEARCH_QUERY', keyword);
    },

    'mouseover .media-list .link': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var href = elem.data('href');
        window.status = href;
    },

    'click .media-list .link': function(e) {
        e.preventDefault();
        var elem = $(e.currentTarget);
        var href = elem.data('href');
        var oldpic = $('#photo > img').attr('src');
        var thumbpic = elem.find('.thumbpic').first().attr('src');

        $('#photo > img').attr('src', '/images/default-id.png');
        $('#loading-pic').removeClass('hide');
        Router.go(href);
        Helpers.picsLoaded(oldpic, thumbpic);
    }
});
