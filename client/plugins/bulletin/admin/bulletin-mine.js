Template.adminMyBulletin.rendered = function(){

	function formatWithIcon(icon) {
	    var originalOption = icon.element;
	    return '<span class="glyphicon ' + $(originalOption).data('icon') + '" aria-hidden="true"></span> &nbsp;&nbsp;&nbsp; ' + icon.text;
	}

	$('#post-recipients-to').select2({ formatResult: formatWithIcon });
	$('#post-recipients-cc').select2();
	$('#post-recipients-bcc').select2();

	$('.js-switch').bootstrapSwitch('state', false);
	$('.js-switch').bootstrapSwitch('disabled',true);

	$('#post-content').wysihtml5();

	var table = $('#bulletinTable').DataTable();
	table.column(0).visible(false);
	table.column(1).visible(false);
	table.column(2).visible(false);
	table.column(3).visible(false);
	table.column(4).visible(false);
	table.column(5).visible(false);
	table.column(6).visible(false);

	//$('.js-switch').bootstrapSwitch();
}

Template.adminMyBulletin.helpers({
	// posts: function() {
	// 	var channels;

	// 	if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
	// 		channels = Channels.find();
	// 	}else{
	// 	 	channels = Channels.find({
	// 			'editors.user_id': Meteor.userId()
	// 		});
	// 	}

	// 	if (channels){
	// 		var channelIds = [];
			
	// 		channels.forEach(function (row) {
	//             channelIds.push(row._id);
	//         }); 

	// 		return Bulletin_Posts.find({
	// 			channel_id: {
	// 				$in: channelIds
	// 			}
	// 		},{sort: {created_at: -1}});
	// 	}else{
	// 		return null;
	// 	}
	// },
	post_types: function() {
		return Bulletin_Post_Types.find({},{sort: {title: 1}});
	},
	channels: function() {
		if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
			return Channels.find();
		}else{
			return Channels.find({
				'editors.user_id': Meteor.userId()
			});
		}
	},
	isPublished: function(id){
		var post = Bulletin_Posts.findOne(id);

		if (post.status=="published"){
			return true;
		}else{
			return false;
		}
	},
	isFeatured: function(id){
		var post = Bulletin_Posts.findOne(id);

		if (post.featured=="yes"){
			return true;
		}else{
			return false;
		}
	},
	isDraft: function(id){
		var post = Bulletin_Posts.findOne(id);

		if (post.status=="draft"){
			return true;
		}else{
			return false;
		}
	},
	bulletin_channel_path: function(id){
		var channelId = id;

		if (!id){
			channelId = Session.get('selectedChannelId');
		}
		
		var channel = Channels.findOne(channelId);

		if (channel){
			return channel.path;
		}else{
			return '[-]';
		}
	},

 	bulletin_post_cover_thumb: function(id){
 		return bulletin_post_cover_photo(id,'thumbs');
 	},

 	recipients: function() {
    	var employees = Meteor.users.find().fetch().map(function(object){ return {id: object._id, name: object.profile.name, type: 'employee'}; });

    	var mailing_lists = Mailing_Lists.find().fetch().map(function(object){ return {id: object._id, name: object.title, type: 'mailing_list'}; });

    	return employees.concat(mailing_lists);
  	}
});


Template.adminMyBulletin.events({
	'change #post-title': function(e){
		var formattedSlug = bulletin_format_slug($('#post-title').val());
		$('#post-slug').val(formattedSlug);
	},

	'submit #form-bulletin-post': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		var content_type = Session.get('currentBulletinType');

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
			type: $('#post-type').val(),
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
			content_type: content_type,
			short_content: $('#post-short-content').val(),
			content: $('#post-content').val(),
			mediums: mediums
		}

		if (mode == "create"){
			//params.content = '<p>Start editing here...</p>';
			params.content = '';

			Meteor.call('addBulletinPost', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add bulletin post.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Bulletin post successfully added.';

					if (content_type==="text" && $('#post-cover-photo').val()!=""){
				      var cover = $('#post-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.bulletinPostId = result;
				      newCover.fileType = 'bulletin_post_cover_photo';
				      newCover.status = 'uploading';

				      Bulletin_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

				    if (content_type==="video" && $('#post-video').val()!=""){
				      var video = $('#post-video').get(0).files[0];
				      var newVideo = new FS.File(video);
				      newVideo.bulletinPostId = result;
				      newVideo.fileType = 'bulletin_post_video';
				      newVideo.status = 'uploading';

				      Bulletin_Videos.insert(newVideo, function(err, fileObj){
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
			var bulletinPostId = Session.get('currentBulletinPostId');

			if (content_type==="text" && $('#post-cover-photo').val()!=""){
				var cover = $('#post-cover-photo').get(0).files[0];
				var newCover = new FS.File(cover);
				newCover.bulletinPostId = bulletinPostId;
				newCover.fileType = 'bulletin_post_cover_photo';
				newCover.status = 'uploading';

				Meteor.call('removeBulletinPostCoverImage', bulletinPostId, function(err, res){

				});

				Bulletin_Images.insert(newCover, function(err, fileObj){
				  if(err){
				  	
				  } else {
				  		var cursor = Bulletin_Images.find(fileObj._id);

	                    var liveQuery = cursor.observe({
	                        changed: function(newImage, oldImage) {
	                            if(newImage.url() !== null){
	                                liveQuery.stop();

	                                Meteor.call('updateBulletinPost', bulletinPostId, params, function(error, result){
										if(error){
											console.log("error", error);
											var msg = 'Failed to update bulletin post.';
											ClientHelper.notify('danger', msg, true);
										}
										if(result){
											var msg = 'Bulletin post successfully updated.';

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
		    }else if(content_type==="video" && $('#post-video').val()!=""){
		    	var video = $('#post-video').get(0).files[0];
				var newVideo= new FS.File(video);
				newVideo.bulletinPostId = bulletinPostId;
				newVideo.fileType = 'bulletin_post_video';
				newVideo.status = 'uploading';

				Meteor.call('removeBulletinPostVideo', bulletinPostId, function(err, res){

				});

				Bulletin_Videos.insert(newVideo, function(err, fileObj){
				  if(err){
				  	console.log("error: " + err);
				  } else {
				  		var cursor = Bulletin_Videos.find(fileObj._id);

				  		console.log(fileObj);

	                    var liveQuery = cursor.observe({
	                        changed: function(newImage, oldImage) {
	                            if(newImage.url() !== null){
	                                liveQuery.stop();

	                                Meteor.call('updateBulletinPost', bulletinPostId, params, function(error, result){
										if(error){
											console.log("error", error);
											var msg = 'Failed to update bulletin post.';
											ClientHelper.notify('danger', msg, true);
										}
										if(result){
											var msg = 'Bulletin post successfully updated.';

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
				Meteor.call('updateBulletinPost', bulletinPostId, params, function(error, result){
					if(error){
						console.log("error", error);
						var msg = 'Failed to update bulletin post.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Bulletin post successfully updated.';

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

		$('#form-bulletin-post input,textarea,button,select').prop('disabled', true);
		$('#post-channel').prop('disabled', false);
		$('#post-type').prop('disabled', false);
		$('.btn-close').prop('disabled', false);
		$('.close').prop('disabled', false);

		$('#post-status').val('draft');
		// $('.js-switch').bootstrapSwitch('state', false);
		// $('.js-switch').bootstrapSwitch('disabled', true);

		Session.set('currentBulletinPostId', '');
		Session.set('currentBulletinType', 'text');
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


		$('#form-bulletin-post input,textarea,button,select').prop('disabled', true);
		$('#post-channel').prop('disabled', false);
		$('.btn-close').prop('disabled', false);
		$('.close').prop('disabled', false);

		$('#post-status').val('draft');
		// $('.js-switch').bootstrapSwitch('state', false);
		// $('.js-switch').bootstrapSwitch('disabled', true);

		$('#preview-video').html('');

		Session.set('currentBulletinPostId', '');
		Session.set('currentBulletinType', 'video');
	},

	'click .edit-post': function(e) {
		var elem = $(e.currentTarget);

		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Post');


		var bulletinPostId = elem.data('bulletinpostid');

		var post = Bulletin_Posts.findOne(bulletinPostId);

		var channel = Channels.findOne(post.channel_id);

		Session.set('selectedChannelId', channel._id);

		//console.log(post);

		$('#post-type').val(post.type);
		$('#post-channel').val(channel._id);
		$('#post-title').val(post.title);
		$('#post-slug').val(post.slug);
		$('#post-tags').val(post.tags);
		$('#post-status').val(post.status);
		$('#post-short-content').val(post.short_content);
		$('#post-content').data("wysihtml5").editor.setValue(post.content);

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

		if (post.content_type==="video"){
			$('#video-upload').show();
			$('#image-upload').hide();
			$('#preview-video').html('');

			var video = document.getElementById('preview-video');
			var source = document.createElement('source');

			source.setAttribute('src', bulletin_post_video(post._id));

			video.appendChild(source);
			//video.play();

			Session.set('currentBulletinType', 'video');
		}else{
			$('#video-upload').hide();
			$('#image-upload').show();
			$('#preview-cover-photo').prop('src', bulletin_post_cover_photo(post._id,'full'));
			Session.set('currentBulletinType', 'text');
		}

		$('#form-bulletin-post input,textarea,button,select').prop('disabled', false);
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

		Session.set('currentBulletinPostId', bulletinPostId);
	},

	'click .delete-post': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var bulletinpostId = elem.data('bulletinpostid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this post?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteBulletinPost', bulletinpostId, function(error, result){
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
		var bulletinpostId = elem.data('bulletinpostid');

		Meteor.call('setFeaturedBulletinPost', bulletinpostId, function(error, result){
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
		var bulletinpostId = elem.data('bulletinpostid');

		Meteor.call('revokeFeaturedBulletinPost', bulletinpostId, function(error, result){
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
			$('#form-bulletin-post input,textarea,button,select').prop('disabled', true);
			$('#post-channel').prop('disabled', false);
			$('.btn-close').prop('disabled', false);
			$('.close').prop('disabled', false);

			$('.js-switch').bootstrapSwitch('state', false);
			$('.js-switch').bootstrapSwitch('disabled',true);
		}else{
			$('#form-bulletin-post input,textarea,button,select').prop('disabled', false);
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
		var bulletinpostId = elem.data('bulletinpostid');
		
		Meteor.call('publishBulletinPost', bulletinpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to publish the bulletin.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Bulletin has been published successfully.';

				ClientHelper.notify('success', msg, true);
			}
		});
	},

	'click .unpublish': function(e){
		e.preventDefault();
		var elem = $(e.currentTarget);
		var bulletinpostId = elem.data('bulletinpostid');
		
		Meteor.call('unpublishBulletinPost', bulletinpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to unpublish the bulletin.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Bulletin has been unpublished successfully.';

				ClientHelper.notify('success', msg, true);
			}
		});
	}
});