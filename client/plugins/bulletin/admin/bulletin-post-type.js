Template.adminBulletinPostTypes.rendered = function() {

};

Template.adminBulletinPostTypes.helpers({
	post_types: function() {
		return Bulletin_Post_Types.find();
	},

	post_type: function(){
		return Bulletin_Post_Types.findOne(Session.get('selectedPostTypeId'));
	}
});


Template.adminBulletinPostTypes.events({
	'submit #form-post-type': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		NProgress.start();

		var params = {
			title: $('#post-type-title').val()
		}

		if (mode == "create"){
			Meteor.call('addBulletinPostType', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add post type.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Bulletin post type successfully added.';

					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('.btn-close').click();
				}
			});
		}else if (mode == "update"){
			var postTypeId = Session.get('selectedPostTypeId');

			Meteor.call('updateBulletinPostType', postTypeId, params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to update post type.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Bulletin post type successfully updated.';

				
					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('.btn-close').click();
				}
			});
		}

		NProgress.done();
	},

	'click .add-post-type': function(e) {
		
		$('#mode').val('create');
		$('button[type="submit"]').html('Create');
		$('.modal-title').html('Add New Post Type');
		
		$('#post-type-title').val('');

		Session.set("selectedPostTypeId", '');
	},

	'click .edit-post-type': function(e) {
		var elem = $(e.currentTarget);
		var postTypeId = elem.data('posttypeid');

		
		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Post Type');

		var post_type = Bulletin_Post_Types.findOne(postTypeId);

		$('#post-type-title').val(post_type.title);

		Session.set("selectedPostTypeId", postTypeId);
	},

	'click .delete-post-type': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var postTypeId = elem.data('posttypeid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this post type?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteBulletinPostType', postTypeId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete post type.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Bulletin post type has been deleted.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
		NProgress.done();
	}
});