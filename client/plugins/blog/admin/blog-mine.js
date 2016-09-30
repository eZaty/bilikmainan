var myDropzone;

Template.adminMyBlog.rendered = function(){
	Session.set('selectedBlogId', -1);

	var table = $('#blogTable').DataTable();
	table.column(0).visible(false);
	table.column(1).visible(false);
	table.column(2).visible(false);
	table.column(3).visible(false);
	table.column(4).visible(false);
	table.column(5).visible(false);
}

Template.adminMyBlog.helpers({
	posts: function() {
		var blogs;

		if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
			blogs = Blogs.find();
		}else{
			blogs = Blogs.find({
				'editors.user_id': Meteor.userId()
			});
		}

		if (blogs){
			var blogIds = [];
			
			blogs.forEach(function (row) {
	            //console.log(row._id);
	            blogIds.push(row._id);
	        }); 

			//console.log(blogIds);

			return Blog_Posts.find({
				blog_id: {
					$in: blogIds
				}
			},{sort: {created_at: -1}});
		}else{
			return null;
		}
	},
	blogs: function() {
		if (Roles.userIsInRole(Meteor.userId(), ['admin'])){
			return Blogs.find();
		}else{
			return Blogs.find({
				'editors.user_id': Meteor.userId()
			});
		}
	},
	isPublished: function(id){
		var post = Blog_Posts.findOne(id);

		if (post.status=="published"){
			return true;
		}else{
			return false;
		}
	},
	isFeatured: function(id){
		var post = Blog_Posts.findOne(id);

		if (post.featured=="yes"){
			return true;
		}else{
			return false;
		}
	},
	isDraft: function(id){
		var post = Blog_Posts.findOne(id);

		if (post.status=="draft"){
			return true;
		}else{
			return false;
		}
	},
	blog_path: function(id){
		var blogId = id;

		if (!id){
			blogId = Session.get('selectedBlogId');
		}
		
		var blog = Blogs.findOne(blogId);

		if (blog){
			return blog.path;
		}else{
			return '[-]';
		}
	},

 	blog_post_cover_thumb: function(id){
 		return blog_post_cover_photo(id,'thumbs');
 	}
});


Template.adminMyBlog.events({
	'change #post-title': function(e){
		var formattedSlug = blog_format_slug($('#post-title').val());
		$('#post-slug').val(formattedSlug);
	},

	'submit #form-blog-post': function(e) {
		e.preventDefault();
		var elem = $(e.currentTarget);
		var mode = $('#mode').val();

		NProgress.start();


		// console.log(myDropzone.files);
		// console.log(myDropzone.getQueuedFiles());
		// var status = 'draft';

		// if ($('#post-status').bootstrapSwitch('state')){
		// 	status = 'published';
		// }

		var params = {
			blog_id: $('#post-blog').val(),
			title: $('#post-title').val(),
			tags: $('#post-tags').val(),
			slug: $('#post-slug').val(),
			status: $('#post-status').val()
			//status: status
		}

		if (mode == "create"){
			//params.content = '<p>Start editing here...</p>';
			params.content = '';

			Meteor.call('addBlogPost', params, function(error, result){
				if(error){
					console.log("error", error);
					var msg = 'Failed to add blog post.';
					ClientHelper.notify('danger', msg, true);
				}
				if(result){
					var msg = 'Blog post successfully added.';

					if ($('#post-cover-photo').val()!=""){
				      var cover = $('#post-cover-photo').get(0).files[0];
				      var newCover = new FS.File(cover);
				      newCover.blogPostId = result;
				      newCover.fileType = 'blog_post_cover_photo';
				      newCover.status = 'uploading';

				      Blog_Images.insert(newCover, function(err, fileObj){
				          if(err){
				          	msg += '<br>Cover photo not uploaded.';
				          } else {
				              elem[0].reset();
				              //$('#uniform-upload-cover .filename').html('No file selected');
				          }
				      });
				    }

				    if ($('#post-attachment').val()!=""){
				      var attachment = $('#post-attachment').get(0).files[0];
				      var newAttachment = new FS.File(attachment);
				      newAttachment.postId = result;
				      newAttachment.fileType = 'blog_post_attachment';
				      newAttachment.status = 'uploading';

				      Attachments.insert(newAttachment, function(err, fileObj){
				          if(err){
				          	msg += '<br>Attachment not uploaded.';
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
			var blogPostId = Session.get('currentBlogPostId');

			if ($('#post-cover-photo').val()!=""){
				var cover = $('#post-cover-photo').get(0).files[0];
				var newCover = new FS.File(cover);
				newCover.blogPostId = blogPostId;
				newCover.fileType = 'blog_post_cover_photo';
				newCover.status = 'uploading';

				Meteor.call('removeBlogPostCoverImage', blogPostId, function(err, res){

				});

				Blog_Images.insert(newCover, function(err, fileObj){
				  if(err){
				  	
				  } else {
				  		var cursor = Blog_Images.find(fileObj._id);

	                    var liveQuery = cursor.observe({
	                        changed: function(newImage, oldImage) {
	                            if(newImage.url() !== null){
	                                liveQuery.stop();

	                                Meteor.call('updateBlogPost', blogPostId, params, function(error, result){
										if(error){
											console.log("error", error);
											var msg = 'Failed to update blog post.';
											ClientHelper.notify('danger', msg, true);
										}
										if(result){
											var msg = 'Blog post successfully updated.';

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
				Meteor.call('updateBlogPost', blogPostId, params, function(error, result){
					if(error){
						console.log("error", error);
						var msg = 'Failed to update blog post.';
						ClientHelper.notify('danger', msg, true);
					}
					if(result){
						var msg = 'Blog post successfully updated.';

						ClientHelper.notify('success', msg, true);
						elem[0].reset();
						$('.add-post').click();
						$('.btn-close').click();
					}
				});
			}

			if ($('#post-attachment').val()!=""){
            	Meteor.call('deleteAttachment',blogPostId, function(err, res){

				});
				
			      var attachment = $('#post-attachment').get(0).files[0];
			      var newAttachment = new FS.File(attachment);
			      newAttachment.postId = blogPostId;
			      newAttachment.fileType = 'blog_post_attachment';
			      newAttachment.status = 'uploading';

			      Attachments.insert(newAttachment, function(err, fileObj){
			          if(err){
			          	msg += '<br>Attachment not uploaded.';
			          } else {
			              elem[0].reset();
			              //$('#uniform-upload-cover .filename').html('No file selected');
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

		$('.js-switch').bootstrapSwitch('state', false);
		$('.js-switch').bootstrapSwitch('disabled', true);

		$('#post-blog').val('-1');
		$('#post-title').val('');
		$('#post-slug').val('');
		$('#post-tags').val('');
		$('#post-status').val('draft');
		$('#preview-cover-photo').prop('src', '/images/placeholder.jpg');

		$('#form-blog-post input,textarea,button,select').prop('disabled', true);
		$('#post-blog').prop('disabled', false);
		$('.btn-close').prop('disabled', false);
		$('.close').prop('disabled', false);

		$('#currentAttachment').html("");

		Session.set('currentBlogPostId', '');
	},

	'click .edit-post': function(e) {
		var elem = $(e.currentTarget);

		$('#mode').val('update');
		$('button[type="submit"]').html('Save');
		$('.modal-title').html('Update Post');


		var blogPostId = elem.data('blogpostid');

		var post = Blog_Posts.findOne(blogPostId);

		var blog = Blogs.findOne(post.blog_id);

		Session.set('selectedBlogId',blog._id);

		$('.js-switch').bootstrapSwitch('disabled', false);

		// if (post.status === 'published'){
		// 	$('#post-status').bootstrapSwitch('state', true);
		// }else{ //draft
		// 	$('#post-status').bootstrapSwitch('state', false);
		// }

		$('#post-blog').val(blog._id);
		$('#post-title').val(post.title);
		$('#post-slug').val(post.slug);
		$('#post-tags').val(post.tags);
		$('#post-status').val(post.status);
		//$('#post-content').val(post.content);
		$('#preview-cover-photo').prop('src', blog_post_cover_photo(post._id,'full'));

		$('#form-blog-post input,textarea,button,select').prop('disabled', false);
		$('#post-slug').prop('disabled', true);

		var attachment = Attachments.findOne({
			postId: blogPostId
		});

		if (attachment){
			$('#currentAttachment').html("<a href='"+attachment.S3Url('attachment')+"' target='_blank'>"+attachment.original.name+"</a>");
		}else{
			$('#currentAttachment').html("");
		}

		Session.set('currentBlogPostId', blogPostId);
	},

	'click .delete-post': function(e) {
		e.preventDefault();
		NProgress.start();
		var elem = $(e.currentTarget);
		var blogpostId = elem.data('blogpostid');

		var notice = ClientHelper.confirm('danger', 'Are you sure want to delete this post?');
		notice.get().on('pnotify.confirm', function() {
			Meteor.call('deleteBlogPost', blogpostId, function(error, result){
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
		var blogpostId = elem.data('blogpostid');

		Meteor.call('setFeaturedBlogPost', blogpostId, function(error, result){
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
		var blogpostId = elem.data('blogpostid');

		Meteor.call('revokeFeaturedBlogPost', blogpostId, function(error, result){
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

	'change #post-blog': function(e) {
		var blogId = $('#post-blog').val();

		Session.set('selectedBlogId',blogId);

		if (blogId=="-1"){
			$('#form-blog-post input,textarea,button,select').prop('disabled', true);
			$('#post-blog').prop('disabled', false);
			$('.btn-close').prop('disabled', false);
			$('.close').prop('disabled', false);
			$('.js-switch').bootstrapSwitch('state', false);
			$('.js-switch').bootstrapSwitch('disabled',true);
		}else{
			$('#form-blog-post input,textarea,button,select').prop('disabled', false);
			$('#post-slug').prop('disabled', true);
			$('.js-switch').bootstrapSwitch('disabled',false);
		}
	},

	'change #post-cover-photo': function(e){
		var file = e.currentTarget.files[0];
		var url = $('#post-cover-photo').val();
	    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

	    $('#upload-msg').html('');

	    if (file) 
	     {
	     	if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg"){
		     	if (file.size < 1024000){
			        var reader = new FileReader();

			        reader.onload = function (e) {
			           $('#preview-cover-photo').attr('src', e.target.result);
			        }
			       reader.readAsDataURL(file);
			   }else{
		    		$('#upload-msg').html('Your file is too big (more than 1MB). Please select another file.');
		    	}
		    }else{
		    	$('#upload-msg').html('Your file format is not supported. Please select another file.');
		    }
	    }
	    else
	    {
	    	$('#preview-cover-photo').attr('src', '');
	    }
	},

	'click .publish': function(e){
		e.preventDefault();
		var elem = $(e.currentTarget);
		var blogpostId = elem.data('blogpostid');
		
		Meteor.call('publishBlogPost', blogpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to publish the post.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Post has been published successfully.';

				ClientHelper.notify('success', msg, true);
			}
		});
	},

	'click .unpublish': function(e){
		e.preventDefault();
		var elem = $(e.currentTarget);
		var blogpostId = elem.data('blogpostid');
		
		Meteor.call('unpublishBlogPost', blogpostId, function(error, result){
			if(error) {
				console.log("error", error);
				var msg = 'Failed to unpublish the post.';
				ClientHelper.notify('danger', msg, true);
			}
			if(result){
				var msg = 'Post has been unpublished successfully.';

				ClientHelper.notify('success', msg, true);
			}
		});
	}
});