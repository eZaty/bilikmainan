Template.userTableButtons.helpers({
	hasRole: function(role, roles) {
		if($.inArray(role, roles) >= 0) {
			return true;
		} else {
			return false;
		}
	},

	isNotPlayroomAdmin: function(username) {
		if(username == 'playroom') return false;
		else return true;
	},

	groups: function() {
		var groups = Groups.find({
			slug: {
				$nin: ['employee']
			}
		}, {
			fields: {
				name: 1,
				slug: 1
			}
		}).fetch();
		groups.push({
			name: 'Admin',
			slug: 'admin'
		});
		return groups;
	}
});