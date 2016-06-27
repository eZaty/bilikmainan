Template.blogSinglePost.rendered = function(){
	$(".btn-more").click(function() {
	    $('html, body').animate({
	        scrollTop: $("#article").offset().top
	    }, 1000);
	});

	var editable = Template.blogSinglePost.__helpers.get('isEditablePost')($('#blog').val());
	
	if (editable){
	
		var editorCT;

	    $(document).ready(function(){
	        
	        editorCT = ContentTools.EditorApp.get();
	        
	        ContentTools.StylePalette.add([
	            new ContentTools.Style('Align Left', 'align-left', ['img']),
	            new ContentTools.Style('Align Right', 'align-right', ['img']),
	            new ContentTools.Style('Align Center', 'align-center', ['img'])
	        ]);

	        editorCT.init('*[data-editable]', 'data-name');

	        ContentTools.IMAGE_UPLOADER = imageUploader;

	        editorCT.bind('save', function (regions) {
	            $('#blog-post-content').html('');

	            // Check that something changed
	            if (Object.keys(regions).length == 0) {
	                return;
	            }

	            // Set the editor as busy while we save our changes
	            this.busy(true);

	            // Collect the contents of each region into a FormData instance

	            var params = {
	                            blog_id: $('#blog').val()
	                        }

	            for (name in regions) {
	                if (regions.hasOwnProperty(name)) {
	                    if (name=="blog-post-content"){
	                        params.content = regions[name];
	                    }
	                    if (name=="blog-post-title"){
	                        params.title = $(regions[name]).text();
	                    }
	                }
	            }

	            var post_id = $('#blog-post').val();

	            Meteor.call('updateBlogPost', post_id, params, function(error, result){
	                editorCT.busy(false);

	                if(error){
	                    console.log("error", error);
	                    var msg = 'Failed to update blog post.';
	                    ClientHelper.notify('danger', msg, true);

	                    //new ContentTools.FlashUI('no');
	                }

	                if (result){
	                    //new ContentTools.FlashUI('ok');

	                    var msg = 'Your blog post has been updated successfully.';
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
	            newImage.blogPostId = $('#blog-post').val();
	            newImage.fileType = 'blog_post_content_photo';
	            newImage.status = 'uploading';

	            Blog_Images.insert(newImage, function(err, fileObj){
	                dialog.busy(false);

	                if(err){
	                    var msg = 'Failed to insert image.';
	                    ClientHelper.notify('danger', msg, true);
	                } else {
	                    var cursor = Blog_Images.find(fileObj._id);

	                    var liveQuery = cursor.observe({
	                        changed: function(newImage, oldImage) {
	                            if(newImage.url() !== null){
	                                liveQuery.stop();

	                                var msg = 'Image successfully inserted.';
	                                var imgUrl = blog_post_content_photo(fileObj._id,'full');

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
}

Template.blogSinglePost.helpers({
	prev_post: function(id){
		var post = Blog_Posts.findOne(id);

		if (post){
			var prev = Blog_Posts.find({
				blog_id: post.blog_id,
				status: 'published',
				created_at: {
					$lt: post.created_at
				}
			},{sort: {created_at: -1}, limit: 1});

			var result;

			prev.forEach(function (row) {
				result = row;
			});

			return result;
		}else{
			return null;
		}
	},

	next_post: function(id){
		var post = Blog_Posts.findOne(id);

		if (post){
			var next = Blog_Posts.find({
				blog_id: post.blog_id,
				status: 'published',
				created_at: {
					$gt: post.created_at
				}
			},{sort: {created_at: 1}, limit: 1});

			var result;

			next.forEach(function (row) {
				result = row;
			});

			return result;
		}else{
			return null;
		}
	},

	blog_post_cover: function(id){
 		return blog_post_cover_photo(id,'full');
 	},

 	comments: function(id){
 		var comments = Blog_Comments.find({
 			blog_post_id: id,
 			comment_id: null
 		});

 		if (comments){
 			return comments;
 		}else{
 			return null;
 		}
 	},

 	replies: function(id){
 		var comments = Blog_Comments.find({
 			comment_id: id
 		});

 		if (comments){
 			return comments;
 		}else{
 			return null;
 		}
 	},

 	nb_comments: function(id){
 		return Blog_Comments.find({
 			blog_post_id: id
 		}).count();
 	},

 	isEditable: function(id){
 		var comment = Blog_Comments.findOne({
 			_id: id
 		},{
 			created_by: Meteor.userId()
 		});

 		var editable = (Roles.userIsInRole(Meteor.userId(), ['admin']) || comment);

 		return editable;
 	},

 	isRemovable: function(id){
 		var comment = Blog_Comments.findOne({
 			_id: id
 		},{
 			created_by: Meteor.userId()
 		});

 		var removable = (Roles.userIsInRole(Meteor.userId(), ['admin']) || comment);

 		return removable;
 	},

 	isEditablePost: function(id){
 		var blog = Blogs.findOne({
 			_id: id,
 			'editors.user_id': Meteor.userId()
 		});

 		//var editable = (Roles.userIsInRole(Meteor.userId(), ['admin']) || blog);

 		// return editable;

 		return (blog || (Roles.userIsInRole(Meteor.userId(), ['admin'])));

 		// if (blog){
 		// 	console.log(id + ' is editable');
 		// 	return true;
 		// }else{
 		// 	console.log(id + ' is non editable');
 		// 	return false;
			// }
 	}

});

Template.blogSinglePost.events({
	
	'submit #form-blog-post-comment': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		NProgress.start();

		var params = {
			blog_post_id: $('#blog-post').val(),
			text: $('#comment-text').val()
		}

		if (mode == "create"){
			Meteor.call('addBlogComment', params, function(error, result){
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
			var blogPostCommentId = Session.get('currentBlogPostCommentId');

			Meteor.call('updateBlogComment', blogPostCommentId, params, function(error, result){
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
			var blogPostCommentId = Session.get('currentBlogPostCommentId');

			params.comment_id = blogPostCommentId;

			Meteor.call('addBlogComment', params, function(error, result){
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

		Session.set('currentBlogPostCommentId', '');
	},

	'click .edit-post-comment': function(e) {
		var elem = $(e.currentTarget);

		$('#mode').val('update');
		$('button[type="submit"]').html('Update');
		$('.modal-title').html('Update Comment');


		var blogPostCommentId = elem.data('blogpostcommentid');

		var comment = Blog_Comments.findOne(blogPostCommentId);

		$('#comment-text').val(comment.text);

		Session.set('currentBlogPostCommentId', blogPostCommentId);
	},

	'click .reply-post-comment': function(e) {
		var elem = $(e.currentTarget);

		$('#mode').val('reply');
		$('button[type="submit"]').html('Submit');
		$('.modal-title').html('Reply to a Comment');


		var blogPostCommentId = elem.data('blogpostcommentid');

		var comment = Blog_Comments.findOne(blogPostCommentId);

		$('#comment-text').val('');

		Session.set('currentBlogPostCommentId', blogPostCommentId);
	},

	'click .delete-post-comment': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var blogPostCommentId = elem.data('blogpostcommentid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete your comment?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteBlogComment', blogPostCommentId, function(error, result){
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
	}
});