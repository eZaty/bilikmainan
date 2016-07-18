Template.announcementSinglePost.rendered = function(){
	$(".btn-more").click(function() {
		$('html, body').animate({
			scrollTop: $("#article").offset().top
		}, 1000);
	});

	Tracker.autorun(function(){
		var editable = Session.get('CURRENT_USER_IS_EDITOR');
		if (editable){

			var editorCT;

			$(document).ready(function(){

				editorCT = ContentTools.EditorApp.get();

				ContentTools.StylePalette.add([
					new ContentTools.Style('Align Left', 'align-left', ['img']),
					new ContentTools.Style('Align Right', 'align-right', ['img']),
					new ContentTools.Style('Align Center', 'align-center', ['img']),
					new ContentTools.Style('Text White', 'text-white', ['h1', 'h2', 'p']),
					new ContentTools.Style('Text Black', 'text-black', ['h1', 'h2', 'p']),
					new ContentTools.Style('Text Red', 'text-red', ['h1', 'h2', 'p']),
					new ContentTools.Style('Text Orange', 'text-orange', ['h1', 'h2', 'p']),
					new ContentTools.Style('Text Green', 'text-green', ['h1', 'h2', 'p']),
					new ContentTools.Style('Text Blue', 'text-blue', ['b'])
				]);

				editorCT.init('*[data-editable]', 'data-name');

				ContentTools.IMAGE_UPLOADER = imageUploader;

				editorCT.bind('save', function (regions) {
					$('#announcement-post-content').html('');

					// Check that something changed
					if (Object.keys(regions).length == 0) {
						return;
					}

					// Set the editor as busy while we save our changes
					this.busy(true);

					// Collect the contents of each region into a FormData instance

					var params = {
						channel_id: $('#announcement-channel').val()
					}

					for (name in regions) {
						if (regions.hasOwnProperty(name)) {
							if (name=="announcement-post-content"){
								params.content = regions[name];
							}
							if (name=="announcement-post-title"){
								params.title = $(regions[name]).text();
							}
						}
					}

					var post_id = $('#announcement-post').val();

					Meteor.call('updateAnnouncementPost', post_id, params, function(error, result){
						editorCT.busy(false);

						if(error){
							console.log("error", error);
							var msg = 'Failed to update announcement post.';
							ClientHelper.notify('danger', msg, true);

							//new ContentTools.FlashUI('no');
						}

						if (result){
							//new ContentTools.FlashUI('ok');

							var msg = 'Your announcement post has been updated successfully.';
							ClientHelper.notify('success', msg, true);
						}
					});
				});
			});

			function imageUploader(dialog) {
				dialog.bind('imageUploader.mount', function () {
					$('.ct-image-dialog__view').html('<img id="upload-preview-image" src="/images/placeholder.jpg" style="width:100%; height:100%">');
				});

				dialog.bind('imageUploader.cancelupload', function () {
					dialog.state('empty');
				});

				dialog.bind('imageUploader.clear', function () {
					dialog.clear();
					$('.ct-image-dialog__view').html('<img id="upload-preview-image" src="/images/placeholder.jpg" style="width:100%; height:100%">');
				});

				dialog.bind('imageUploader.fileReady', function (file) {
					// Set the dialog state to uploading and reset the progress bar to 0
					dialog.state('uploading');
					dialog.progress(0);

					var reader = new FileReader();

					dialog.progress(50);

					reader.onload = function (ev) {
						var dataURI = ev.target.result;
						var image = document.getElementById('upload-preview-image');
						image.src = dataURI;

						$('#upload-preview-image').cropper({
							setDragMode: 'move',
							viewMode: 0
						});

						dialog.progress(100);
						dialog.state('populated');
					};

					reader.readAsDataURL(file);
				});

				dialog.bind('imageUploader.rotateCCW', function () {
					$('#upload-preview-image').cropper("rotate", -45);
				});

				dialog.bind('imageUploader.rotateCW', function () {
					$('#upload-preview-image').cropper("rotate", 45);
				});

				dialog.bind('imageUploader.save', function () {
					var cropRegion;

					dialog.busy(true);

					var file = $('#upload-preview-image').cropper('getCroppedCanvas').toDataURL();
					var newImage = new FS.File(file);
					newImage.announcementPostId = $('#announcement-post').val();
					newImage.fileType = 'announcement_post_content_photo';
					newImage.status = 'uploading';

					Announcement_Images.insert(newImage, function(err, fileObj){
						dialog.busy(false);

						if(err){
							var msg = 'Failed to insert image.';
							ClientHelper.notify('danger', msg, true);
						} else {
							var cursor = Announcement_Images.find(fileObj._id);

							var liveQuery = cursor.observe({
								changed: function(newImage, oldImage) {
									if(newImage.url() !== null){
										liveQuery.stop();

										var msg = 'Image successfully inserted.';
										var imgUrl = announcement_post_content_photo(fileObj._id,'full');

										var cropRegion = $('#upload-preview-image').cropper("getData");

										var h = cropRegion.height;
										var w = cropRegion.width;

										dialog.save(
											imgUrl,
											[w, h],
											{
												//'data-ce-max-width': $('#upload-preview-image').width()
											});
											ClientHelper.notify('success', msg, true);
										}
									}
								});
							}
						});
					});
				}
			}
		});
	}

	Template.announcementSinglePost.helpers({
		prev_post: function(id){
			var post = Announcement_Posts.findOne(id);

			if (post){
				var prev = Announcement_Posts.find({
					channel_id: post.channel_id,
					status: 'published',
					created_at: {
						$lt: post.created_at
					}
				},{sort: {created_at: -1}, limit: 1});

				if (prev){
					var result;

					prev.forEach(function (row) {
						result = row;
					});

					return result;
				}else{
					return null;
				}
			}else{
				return null;
			}
		},

		next_post: function(id){
			var post = Announcement_Posts.findOne(id);

			if (post){
				var next = Announcement_Posts.find({
					channel_id: post.channel_id,
					status: 'published',
					created_at: {
						$gt: post.created_at
					}
				},{sort: {created_at: 1}, limit: 1});

				if (next){
					var result;

					next.forEach(function (row) {
						result = row;
					});

					return result;
				}else{
					return null;
				}
			}else{
				return null;
			}

		},

		announcement_channel_footer: function(cid){
			//console.log(announcement_channel_footer_photo(cid,'full'));
			return announcement_channel_footer_photo(cid,'full');
		},

		comments: function(id){
			var comments = Comments.find({
				postId: id,
				replyTo: null
			});

			if (comments){
				return comments;
			}else{
				return null;
			}
		},

		replies: function(id){
			var comments = Comments.find({
				replyTo: id
			});

			if (comments){
				return comments;
			}else{
				return null;
			}
		},

		nb_comments: function(id){
			return Comments.find({
				postId: id
			}).count();
		},

		isEditable: function(id){
			var comment = Comments.findOne({
				_id: id
			},{
				userId: Meteor.userId()
			});

			var editable = (Roles.userIsInRole(Meteor.userId(), ['admin']) || comment);

			return editable;
		},

		isRemovable: function(id){
			var comment = Comments.findOne({
				_id: id
			},{
				userId: Meteor.userId()
			});

			var removable = (Roles.userIsInRole(Meteor.userId(), ['admin']) || comment);

			return removable;
		},

		isEditablePost: function(id){
			var channel = Announcement_Channels.findOne({
				_id: id,
				'editors.user_id': Meteor.userId()
			});

			var editable = (Roles.userIsInRole(Meteor.userId(), ['admin']) || channel);

			return editable;

			// 	if (channel){
			// 		return true;
			// 	}else{
			// 		return false;
			// 	}
		},

		isVideoPost: function(type){
			console.log(type);
			return (type=="video");
		},

		get_post_video: function(id){
			var vid_url = announcement_post_video(id);
			return vid_url;
		}

	});

	Template.announcementSinglePost.events({

		'submit #form-announcement-post-comment': function(e) {
			e.preventDefault();
			var elem = $(e.currentTarget);
			var mode = $('#mode').val();

			NProgress.start();

			var params = {
				postId: $('#announcement-post').val(),
				message: $('#comment-text').val()
			}

			if (mode == "create"){
				Meteor.call('addAnnouncementComment', params, function(error, result){
					if(error){
						console.log("error", error);
						var msg = 'Failed to submit your comment.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Your comment successfully submitted.';

						ClientHelper.notify('success', msg, true);
						elem[0].reset();
						$('.btn-close').click();
					}
				});
			}else if (mode == "update"){
				var announcementPostCommentId = Session.get('currentAnnouncementPostCommentId');

				Meteor.call('updateAnnouncementComment', announcementPostCommentId, params, function(error, result){
					if(error){
						console.log("error", error);
						var msg = 'Failed to update your comment.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Your comment successfully updated.';

						ClientHelper.notify('success', msg, true);
						elem[0].reset();
						$('.add-post-comment').click();
						$('.btn-close').click();
					}
				});
			}else if (mode == "reply"){
				var announcementPostCommentId = Session.get('currentAnnouncementPostCommentId');

				params.replyTo = announcementPostCommentId;

				Meteor.call('addAnnouncementComment', params, function(error, result){
					if(error){
						console.log("error", error);
						var msg = 'Failed to submit your comment.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Your comment successfully submitted.';

						ClientHelper.notify('success', msg, true);
						elem[0].reset();
						$('.add-post-comment').click();
						$('.btn-close').click();
					}
				});
			}
			NProgress.done();
		},

		'click .add-post-comment': function(e) {
			$('#mode').val('create');
			$('button[type="submit"]').html('Submit');
			$('.modal-title').html('Add Comment');

			$('#comment-text').val('');

			$('.btn-close').prop('disabled', false);
			$('.close').prop('disabled', false);

			Session.set('currentAnnouncementPostCommentId', '');
		},

		'click .edit-post-comment': function(e) {
			var elem = $(e.currentTarget);

			$('#mode').val('update');
			$('button[type="submit"]').html('Update');
			$('.modal-title').html('Update Comment');


			var announcementPostCommentId = elem.data('announcementpostcommentid');

			var comment = Comments.findOne(announcementPostCommentId);

			$('#comment-text').val(comment.text);

			Session.set('currentAnnouncementPostCommentId', announcementPostCommentId);
		},

		'click .reply-post-comment': function(e) {
			var elem = $(e.currentTarget);

			$('#mode').val('reply');
			$('button[type="submit"]').html('Submit');
			$('.modal-title').html('Reply to a Comment');


			var announcementPostCommentId = elem.data('announcementpostcommentid');

			var comment = Comments.findOne(announcementPostCommentId);

			$('#comment-text').val('');

			Session.set('currentAnnouncementPostCommentId', announcementPostCommentId);
		},

		'click .delete-post-comment': function(e) {
			e.preventDefault();
			NProgress.start();
			var elem = $(e.currentTarget);
			var announcementPostCommentId = elem.data('announcementpostcommentid');

			var notice = ClientHelper.confirm('danger', 'Are you sure want to delete your comment?');
			notice.get().on('pnotify.confirm', function() {
				Meteor.call('deleteAnnouncementComment', announcementPostCommentId, function(error, result){
					if(error) {
						console.log("error", error);
						var msg = 'Failed to delete comment.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Comment has been deleted.';
						ClientHelper.notify('success', msg, true);
					}
				});
			});
			NProgress.done();
		},

		'click .btn-email-preview': function(e) {
			Meteor.call('readEmailTemplate', $('#announcement-post').val(), function(error, result){
				//console.log(result);
				var startPos = result.indexOf("<!-- body -->") + 13;
				var endPos = result.indexOf("<!-- /body -->");
				var tpl = result.substring(startPos, endPos);
				$('#modal-email-preview .modal-body').html(tpl);
			});
		},

		'click .btn-publish': function(e){
			var elem = $(e.currentTarget);

			Meteor.call('publishAnnouncementPost', $('#announcement-post').val(), function(error, result){
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
		}
	});
