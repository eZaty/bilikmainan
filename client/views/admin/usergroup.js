Template.adminUserGroup.rendered = function() {
	ClientHelper.activeMenu('adminUserGroup', 'adminUsers');
}

Template.adminUserGroup.helpers({
	routes: function() {
		var newRoutes = [];
		_.each(Router.routes, function(route){
			//  	console.log(route._path);
			var name = route.getName();
			var tmp = {
				path: route._path,
				name: name
			}
			newRoutes.push(tmp);
		});
		// console.log(newRoutes);
		return newRoutes;
	},

	groups: function() {
		return Groups.find();
	},

	incremented: function(index) {
		return index+1;
	},

	checkStatus: function(groupId, route) {
		var group = Groups.findOne(groupId, {
			fields: {
				routes: 1
			}
		});
		var chk = $.inArray(route, group.routes);
		if(chk < 0) return false;
		else return true;
	}
});

Template.adminUserGroup.events({
	'keyup #group-name': function(e) {
		e.preventDefault();
		var slug = s.slugify($('#group-name').val());
		$('#group-slug').val(slug);
	},

	'submit #form-create': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		NProgress.start();
		var params = {
			name: $('#group-name').val(),
			slug: $('#group-slug').val()
		}
		Meteor.call('addGroup', params, function(error, result){
			if(error){
				console.log("error", error);
				var msg = 'Failed to add group.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Group successfully added.';
				ClientHelper.notify('success', msg, true);
				elem[0].reset();
				$('.btn-close').click();
			}
		});
		NProgress.done();
	},

	'click .delete-group': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var groupId = elem.data('groupid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this group?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteGroup', groupId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete group.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Group has been deleted.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
		NProgress.done();
	},

	'click .btn-activate, click .btn-deactivate': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var route = elem.data('route');
		var status = elem.data('status');
		var groupName = elem.data('groupname');
		var groupId = elem.data('groupid');

		var group = Groups.findOne(groupId, {
			fields: {
				routes: 1
			}
		});

		var arRoutes = [];
		var chk = 0;
		if(group.routes) {
			group.routes.forEach(function(rts){
				if(rts == route) {
					// arRoutes.push({
					// 	name: route,
					// 	active: status
					// });
					if(status) {
						arRoutes.push(route);
						chk++;
					}
				}
				else {
					arRoutes.push(rts);
				}
			});
		}

		if(chk == 0) {
			// arRoutes.push({
			// 	name: route,
			// 	active: status
			// });
			if(status) {
				arRoutes.push(route);
			}
		}

		var params = {
			routes: arRoutes
		}
		// console.log(params);

		Meteor.call('updateGroup', groupId, params, function(error, result){
			if(error){
				console.log("error", error);
				var msg = 'Failed to update group.';
				ClientHelper.notify('warning', msg, true);
			}
			if(result){
				var msg;
				if(status == 1) msg = '`'+route+'` has been added to group `'+groupName+'`.';
				else msg = '`'+route+'` has been removed from group `'+groupName+'`.';
				ClientHelper.notify('success', msg, true);
			}
		});
		NProgress.done();
	}
});
