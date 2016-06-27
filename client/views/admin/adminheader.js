Template.adminHeader.events({
    'click .logout': function(e) {
        e.preventDefault();
        Meteor.logout(function(){
            Router.go('/login');
        });
    }
});
