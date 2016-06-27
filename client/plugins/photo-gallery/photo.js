Template.photo.onRendered(function(){
    Meteor.subscribe('comments-count', this.data.gallery._id);
});

Template.photo.helpers({
    totalComments: function(galleryId) {
        return Counts.get('comments-'+galleryId);
    }
});

Template.photo.events({
    "click .zoom-link": function(e){
        e.preventDefault();
        var elem = $(e.currentTarget);
        var photoId = elem.data('photoid');
        $('#photo-zoom').removeClass('hide');
        $('body').css('overflow', 'hidden');
        Session.set('PHOTO_ID', photoId);
    }
});
