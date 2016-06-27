var loading = false;
var max = 20;
var Helpers = {
    masonry : function() {
        var $container = $('#result-container');
        $container.imagesLoaded( function(){
            $container.masonry({
                itemSelector : '.result-item',
                columnWidth: 236,
                gutter: 15
            });
        });
    },

    appendMore: function(newElements) {
        var $container = $('#result-container');
        $container.imagesLoaded( function(){
            $container.masonry()
            .append(newElements)
            .masonry('appended', newElements);
            newElements.removeClass('new');
        });
    },

    removeNew: function() {
        $('.result-item.new').each(function(){
            $(this).removeClass('new');
        });
    },

    waitToLoad: function(selector) {
        var time = 1000;
        var count = $('.result-item.new').length;

        if(document.querySelector(selector) != null) {
            // console.log("count: ", count);
            $('.result-item.new').each(function(){
                // console.log($(this));
                Helpers.appendMore($(this));
            });
            return;
        }
        else {
            setTimeout(function() {
                Helpers.waitToLoad(selector);
            }, time);
        }
    }
}

Template.photoGallery.onCreated(function() {
    Session.set('PHOTO_ID', '');
    var instance = this;

    instance.limit = new ReactiveVar(max);
    instance.max = max;
    instance.loaded = new ReactiveVar(0);

    instance.autorun(function(){
        Meteor.subscribe('comments-users', Session.get('PHOTO_ID'), {
            'profile.nickName': 1
        });
    });

    instance.autorun(function(){
        // Meteor.subscribe('limit-galleries', instance.limit.get(), instance.max);
        Meteor.subscribe('limit-galleries', 0, instance.limit.get());
    });
});

Template.photoGallery.onRendered(function(){
    Helpers.masonry();
});

Template.photoGallery.helpers({
    galleries: function(){
        return Galleries.find();
    },

    hasMore: function() {
        var loaded = Template.instance().loaded.get();
        // console.log("total:", loaded, Counts.get('galleries'));
        if(Counts.get('galleries') > loaded) {
            loading = false;
            return true;
        }
    },

    zoomphoto: function() {
        var photoId = Session.get('PHOTO_ID');
        return Galleries.findOne(photoId);
    },

    comments: function() {
        var photoId = Session.get('PHOTO_ID');
        return Comments.find({
            postId: photoId,
            collection: 'galleries'
        }, {
            sort: {
                createdAt: 1
            }
        });
    }
});


Template.photoGallery.events({
    'click .zoom-backdrop': function(e) {
        e.preventDefault();
        $('.zoom-backdrop').addClass('hide');
        $('body').css('overflow', 'auto');
    },

    'click .detail': function(e) {
        e.stopPropagation();
    },

    'click #focus-comment': function(e) {
        e.preventDefault();
        $('#comment-msg').focus();
    },

    'submit #comment-form': function(e) {
        e.preventDefault();
        var params = {
            collection: 'galleries',
            userId: Meteor.userId(),
            createdAt: new Date(),
            postId: Session.get('PHOTO_ID'),
            message: $('#comment-msg').val()
        }
        Meteor.call('addComment', params, function(error, result){
            if(error) console.log("error", error);
            else {
                $('#comment-msg').val('');
            }
        });
    },

    'click .load-more': function(e, instance) {
        e.preventDefault();
        if(loading) return;
        Helpers.removeNew();

        var skip = instance.limit.get();
        var loaded = instance.loaded.get();

        instance.limit.set(skip + instance.max);
        instance.loaded.set(loaded + instance.max);
        Helpers.waitToLoad('.result-item.new');
    },

    'click .test': function(e) {
        e.preventDefault();
        $('.result-item.new').each(function(){
            Helpers.appendMore($(this));
        });
    }
});
