Template.bulletinMineTableButtons.helpers({
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
	}
});