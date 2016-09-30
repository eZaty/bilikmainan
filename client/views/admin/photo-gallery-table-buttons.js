Template.albumTableButtons.helpers({
	isPublished: function(id){
		var album = Albums.findOne(id);

		if (album.status=="published"){
			return true;
		}else{
			return false;
		}
	},
	isDraft: function(id){
		var album = Albums.findOne(id);

		if (album.status=="draft"){
			return true;
		}else{
			return false;
		}
	}
});