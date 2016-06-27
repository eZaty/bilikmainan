Template.homeHead.helpers({

});

Template.homeHead.events({
    'click .logout-btn' : function(e) {
        e.preventDefault();
        Meteor.logout(function(){
            Router.go('/login');
        });
    },

    'click #feedback' : function(){
        $('.feedback-form').removeClass('hide');
        $('#feedback-layer').removeClass('hide');
        var pageHeight = $('body').height();
        $('#feedback-layer').css('height', pageHeight);
    },

    'click a': function() {
        $('body').css('overflow', 'auto');
    }

});
