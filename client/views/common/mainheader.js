
Template.mainHeader.events({
    'click .logout': function(e) {
        e.preventDefault();
        Meteor.logout(function(){
            Router.go('/');
        });
    }
});
