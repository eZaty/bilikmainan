Template.adminMyAnnouncement.rendered = function(){

	function formatWithIcon(icon) {
	    var originalOption = icon.element;
	    return '<span class="glyphicon ' + $(originalOption).data('icon') + '" aria-hidden="true"></span> &nbsp;&nbsp;&nbsp; ' + icon.text;
	}

	$('#post-recipients-to').select2({ formatResult: formatWithIcon });
	$('#post-recipients-cc').select2();
	$('#post-recipients-bcc').select2();

	$('.js-switch').bootstrapSwitch('state', false);
	$('.js-switch').bootstrapSwitch('disabled',true);

	//$('.js-switch').bootstrapSwitch();
}

Template.adminMyAnnouncement.helpers({
	posts: function() {
		var channels;

		if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
			channels = Announcement_Channels.find();
		}else{
		 	channels = Announcement_Channels.find({
				'editors.user_id': Meteor.userId()
			});
		}

		if (channels){
			var channelIds = [];
			
			channels.forEach(function (row) {
	            channelIds.push(row._id);
	        }); 

			return Announcement_Posts.find({
				channel_id: {
					$in: channelIds
				}
			},{sort: {created_at: -1}});
		}else{
			return null;
		}
	},
	channels: function() {
		if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
			return Announcement_Channels.find();
		}else{
			return Announcement_Channels.find({
				'editors.user_id': Meteor.userId()
			});
		}
	},
	isPublished: function(id){
		var post = Announcement_Posts.findOne(id);

		if (post.status=="published"){
			return true;
		}else{
			return false;
		}
	},
	isFeatured: function(id){
		var post = Announcement_Posts.findOne(id);

		if (post.featured=="yes"){
			return true;
		}else{
			return false;
		}
	},
	isDraft: function(id){
		var post = Announcement_Posts.findOne(id);

		if (post.status=="draft"){
			return true;
		}else{
			return false;
		}
	},
	announcement_channel_path: function(id){
		var channelId = id;

		if (!id){
			channelId = Session.get('selectedChannelId');
		}
		
		var channel = Announcement_Channels.findOne(channelId);

		if (channel){
			return channel.path;
		}else{
			return '[-]';
		}
	},

 	announcement_post_cover_thumb: function(id){
 		return announcement_post_cover_photo(id,'thumbs');
 	},

 	recipients: function() {
    	var employees = Meteor.users.find().fetch().map(function(object){ return {id: object._id, name: object.profile.name, type: 'employee'}; });

    	var mailing_lists = Announcement_Mailing_Lists.find().fetch().map(function(object){ return {id: object._id, name: object.title, type: 'mailing_list'}; });

    	return employees.concat(mailing_lists);
  	}
});


Template.adminMyAnnouncement.events({
	'change #post-title': function(e){
		var formattedSlug = announcement_format_slug($('#post-title').val());
		$('#post-slug').val(formattedSlug);
	},

	'submit #form-announcement-post': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		var type = Session.get('currentAnnouncementType');

		NProgress.start();

		// var status = 'draft';

		// if ($('#post-status').bootstrapSwitch('state')){
		// 	status = 'published';
		// }

		var recipients_to = [];
		var tmp = $('#post-recipients-to').val();
		
		if (tmp!=null){
			for (i=0; i<tmp.length; i++){
				var recipient = {
					user_id: tmp[i]
				}
				recipients_to.push(recipient);
			}
		}

		var recipients_cc = [];
		tmp = $('#post-recipients-cc').val();
		
		if (tmp!=null){
			for (i=0; i<tmp.length; i++){
				var recipient = {
					user_id: tmp[i]
				}
				recipients_cc.push(recipient);
			}
		}

		var recipients_bcc = [];
		tmp = $('#post-recipients-bcc').val();
		
		if (tmp!=null){
			for (i=0; i<tmp.length; i++){
				var recipient = {
					user_id: tmp[i]
				}
				recipients_bcc.push(recipient);
			}
		}

		var mediums = [];

		if ($('#post-comm-playroom').bootstrapSwitch('state')){
			mediums.push("playroom");
		}

		if ($('#post-comm-email').bootstrapSwitch('state')){
			mediums.push("email");
		}


		var params = {
			channel_id: $('#post-channel').val(),
			title: $('#post-title').val(),
			tags: $('#post-tags').val(),
			slug: $('#post-slug').val(),
			status: $('#post-status').val(),
			//status: status,
			recipients: {
				to: recipients_to,
				cc: recipients_cc,
				bcc: recipients_bcc
			},
			type: type,
			mediums: mediums
		}

		if (mode == "create"){
			//params.content = '<p>Start editing here...</p>';
			params.content = '';

			Meteor.call('addAnnouncementPost', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add announcement post.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Announcement post successfully added.';

					if (type==="text" && $('#post-cover-photo').val()!=""){
				      var cover = $('#post-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.announcementPostId = result;
				      newCover.fileType = 'announcement_post_cover_photo';
				      newCover.status = 'uploading';

				      Announcement_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

				    if (type==="video" && $('#post-video').val()!=""){
				      var video = $('#post-video').get(0).files[0];
				      var newVideo = new FS.File(video);
				      newVideo.announcementPostId = result;
				      newVideo.fileType = 'announcement_post_video';
				      newVideo.status = 'uploading';

				      Announcement_Videos.insert(newVideo, function(err, fileObj){
				          if(err){
				          	msg += '<br>Video not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

					ClientHelper.notify('success', msg, true);
					elem[0].reset();
					$('.btn-close').click();
				}
			});
		}else if (mode == "update"){
			var announcementPostId = Session.get('currentAnnouncementPostId');

			if (type==="text" && $('#post-cover-photo').val()!=""){
				var cover = $('#post-cover-photo').get(0).files[0];
				var newCover = new FS.File(cover);
				newCover.announcementPostId = announcementPostId;
				newCover.fileType = 'announcement_post_cover_photo';
				newCover.status = 'uploading';

				Meteor.call('removeAnnouncementPostCoverImage', announcementPostId, function(err, res){

				});

				Announcement_Images.insert(newCover, function(err, fileObj){
				  if(err){
				  	
				  } else {
				  		var cursor = Announcement_Images.find(fileObj._id);

	                    var liveQuery = cursor.observe({
	                        changed: function(newImage, oldImage) {
	                            if(newImage.url() !== null){
	                                liveQuery.stop();

	                                Meteor.call('updateAnnouncementPost', announcementPostId, params, function(error, result){
										if(error){
											console.log("error", error);
											var msg = 'Failed to update announcement post.';
											ClientHelper.notify('danger', msg, true);
										}
										if(result){
											var msg = 'Announcement post successfully updated.';

											ClientHelper.notify('success', msg, true);
											elem[0].reset();
											$('.add-post').click();
											$('.btn-close').click();
										}
									});

							  		elem[0].reset();
	                            }
	                        }
	                    });

				  		
				      //$('#uniform-upload-cover .filename').html('No file selected');
				  }
				});
		    }else if(type==="video" && $('#post-video').val()!=""){
		    	var video = $('#post-video').get(0).files[0];
				var newVideo= new FS.File(video);
				newVideo.announcementPostId = announcementPostId;
				newVideo.fileType = 'announcement_post_video';
				newVideo.status = 'uploading';

				Meteor.call('removeAnnouncementPostVideo', announcementPostId, function(err, res){

				});

				Announcement_Videos.insert(newVideo, function(err, fileObj){
				  if(err){
				  	console.log("error: " + err);
				  } else {
				  		var cursor = Announcement_Videos.find(fileObj._id);

				  		console.log(fileObj);

	                    var liveQuery = cursor.observe({
	                        changed: function(newImage, oldImage) {
	                            if(newImage.url() !== null){
	                                liveQuery.stop();

	                                Meteor.call('updateAnnouncementPost', announcementPostId, params, function(error, result){
										if(error){
											console.log("error", error);
											var msg = 'Failed to update announcement post.';
											ClientHelper.notify('danger', msg, true);
										}
										if(result){
											var msg = 'Announcement post successfully updated.';

											ClientHelper.notify('success', msg, true);
											elem[0].reset();
											$('.add-post').click();
											$('.btn-close').click();
										}
									});

							  		elem[0].reset();
	                            }
	                        }
	                    });

				  		
				      //$('#uniform-upload-cover .filename').html('No file selected');
				  }
				});
		    }else{
				Meteor.call('updateAnnouncementPost', announcementPostId, params, function(error, result){
					if(error){
						console.log("error", error);
						var msg = 'Failed to update announcement post.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Announcement post successfully updated.';

						ClientHelper.notify('success', msg, true);
						elem[0].reset();
						$('.add-post').click();
						$('.btn-close').click();
					}
				});
			}
		}
		NProgress.done();
	},

	'click .add-post': function(e) {
		$('#mode').val('create');
		$('button[type="submit"]').html('Create');
		$('.modal-title').html('Add New Post');

		$('#video-upload').hide();
		$('#image-upload').show();

		$('#post-channel').val('-1');
		$('#post-title').val('');
		$('#post-slug').val('');
		$('#post-tags').val('');
		$('#post-recipients-to').val('').trigger('change');
		$('#post-recipients-cc').val('').trigger('change');
		$('#post-recipients-bcc').val('').trigger('change');

		$('#preview-cover-photo').prop('src', '/images/placeholder.jpg');

		$('#form-announcement-post input,textarea,button,select').prop('disabled', true);
		$('#post-channel').prop('disabled', false);
		$('.btn-close').prop('disabled', false);
		$('.close').prop('disabled', false);

		$('#post-status').val('draft');
		// $('.js-switch').bootstrapSwitch('state', false);
		// $('.js-switch').bootstrapSwitch('disabled', true);

		Session.set('currentAnnouncementPostId', '');
		Session.set('currentAnnouncementType', 'text');
	},

	'click .add-video-post': function(e) {
		$('#mode').val('create');
		$('button[type="submit"]').html('Create');
		$('.modal-title').html('Add New Video Post');

		$('#video-upload').show();
		$('#image-upload').hide();

		$('#post-channel').val('-1');
		$('#post-title').val('');
		$('#post-slug').val('');
		$('#post-tags').val('');
		$('#post-recipients-to').val('').trigger('change');
		$('#post-recipients-cc').val('').trigger('change');
		$('#post-recipients-bcc').val('').trigger('change');

		$('#preview-video').prop('src', '/images/placeholder.jpg');


		$('#form-announcement-post input,textarea,button,select').prop('disabled', true);
		$('#post-channel').prop('disabled', false);
		$('.btn-close').prop('disabled', false);
		$('.close').prop('disabled', false);

		$('#post-status').val('draft');
		// $('.js-switch').bootstrapSwitch('state', false);
		// $('.js-switch').bootstrapSwitch('disabled', true);

		$('#preview-video').html('');

		Session.set('currentAnnouncementPostId', '');
		Session.set('currentAnnouncementType', 'video');
	},

	'click .edit-post': function(e) {
		var elem = $(e.currentTarget);

		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Post');


		var announcementPostId = elem.data('announcementpostid');

		var post = Announcement_Posts.findOne(announcementPostId);

		var channel = Announcement_Channels.findOne(post.channel_id);

		Session.set('selectedChannelId', channel._id);

		$('#post-channel').val(channel._id);
		$('#post-title').val(post.title);
		$('#post-slug').val(post.slug);
		$('#post-tags').val(post.tags);
		$('#post-status').val(post.status);

		var recipients_to = post.recipients.to;

		if (recipients_to){
			var recipients_id = [];

			$.each(recipients_to, function(key, item) {
				recipients_id.push(item.user_id);
			});

			$('#post-recipients-to').val(recipients_id).trigger("change");
		}

		var recipients_cc = post.recipients.cc;

		if (recipients_cc){
			var recipients_id = [];

			$.each(recipients_cc, function(key, item) {
				recipients_id.push(item.user_id);
			});

			$('#post-recipients-cc').val(recipients_id).trigger("change");
		}

		var recipients_bcc = post.recipients.bcc;

		if (recipients_bcc){
			var recipients_id = [];

			$.each(recipients_bcc, function(key, item) {
				recipients_id.push(item.user_id);
			});

			$('#post-recipients-bcc').val(recipients_id).trigger("change");
		}

		if (post.type==="video"){
			$('#video-upload').show();
			$('#image-upload').hide();
			$('#preview-video').html('');

			var video = document.getElementById('preview-video');
			var source = document.createElement('source');

			source.setAttribute('src', announcement_post_video(post._id));

			video.appendChild(source);
			//video.play();

			Session.set('currentAnnouncementType', 'video');
		}else{
			$('#video-upload').hide();
			$('#image-upload').show();
			$('#preview-cover-photo').prop('src', announcement_post_cover_photo(post._id,'full'));
			Session.set('currentAnnouncementType', 'text');
		}

		$('#form-announcement-post input,textarea,button,select').prop('disabled', false);
		$('#post-slug').prop('disabled', true);

		// $('.js-switch').bootstrapSwitch('disabled', false);

		// if (post.status === 'published'){
		// 	$('#post-status').bootstrapSwitch('state', true);
		// }else{ //draft
		// 	$('#post-status').bootstrapSwitch('state', false);
		// }

		var mediums = post.mediums;

		if (mediums){
			$.each(mediums, function(key, item) {
				$('#post-comm-' + item).bootstrapSwitch('state', true);
			});
		}

		Session.set('currentAnnouncementPostId', announcementPostId);
	},

	'click .delete-post': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var announcementpostId = elem.data('announcementpostid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this post?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteAnnouncementPost', announcementpostId, function(error, result){
				if(error) {
					console.log("error", error);
					var msg = 'Failed to delete post.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Post has been deleted.';
					ClientHelper.notify('success', msg, true);
				}
			});
		});
		NProgress.done();
	},

	'click .set-featured': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var announcementpostId = elem.data('announcementpostid');

		Meteor.call('setFeaturedAnnouncementPost', announcementpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to set post as "featured".';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Post has been set as "featured".';
				ClientHelper.notify('success', msg, true);
			}
		});
		NProgress.done();
	},

	'click .revoke-featured': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var announcementpostId = elem.data('announcementpostid');

		Meteor.call('revokeFeaturedAnnouncementPost', announcementpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to revoke "featured" status.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = '"Featured" status has been revoke.';
				ClientHelper.notify('success', msg, true);
			}
		});
		NProgress.done();
	},

	'change #post-channel': function(e) {
		var channelId = $('#post-channel').val();

		Session.set('selectedChannelId', channelId);

		if (channelId=="-1"){
			$('#form-announcement-post input,textarea,button,select').prop('disabled', true);
			$('#post-channel').prop('disabled', false);
			$('.btn-close').prop('disabled', false);
			$('.close').prop('disabled', false);

			$('.js-switch').bootstrapSwitch('state', false);
			$('.js-switch').bootstrapSwitch('disabled',true);
		}else{
			$('#form-announcement-post input,textarea,button,select').prop('disabled', false);
			$('#post-slug').prop('disabled', true);

			$('.js-switch').bootstrapSwitch('disabled',false);
		}
	},

	'change #post-cover-photo': function(e){
		var file = e.currentTarget.files[0];
		var url = $('#post-cover-photo').val();
	    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

	    if (file && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) 
	     {
	        var reader = new FileReader();

	        reader.onload = function (e) {
	           $('#preview-cover-photo').attr('src', e.target.result);
	        }
	       reader.readAsDataURL(file);
	    }
	    else
	    {
	    	$('#preview-cover-photo').attr('src', '');
	    }
	},

	'click .publish': function(e){
		e.preventDefault();
		var elem = $(e.currentTarget);
		var announcementpostId = elem.data('announcementpostid');
		
		Meteor.call('publishAnnouncementPost', announcementpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to publish the announcement.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Announcement has been published successfully.';

				ClientHelper.notify('success', msg, true);
			}
		});
	},

	'click .unpublish': function(e){
		e.preventDefault();
		var elem = $(e.currentTarget);
		var announcementpostId = elem.data('announcementpostid');
		
		Meteor.call('unpublishAnnouncementPost', announcementpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to unpublish the announcement.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Announcement has been unpublished successfully.';

				ClientHelper.notify('success', msg, true);
			}
		});
	}
});