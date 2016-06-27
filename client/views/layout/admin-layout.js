Template.adminLayout.helpers({
    isLoggedIn: function() {
        return Session.get('ACCESS_GRANTED');
	}
});
