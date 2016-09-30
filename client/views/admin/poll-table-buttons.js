Template.pollTableButtons.helpers({
	isPublished: function(id){
		var poll = Polls.findOne(id);

		if (poll.status=="published"){
			return true;
		}else{
			return false;
		}
	},
	isDraft: function(id){
		var poll = Polls.findOne(id);

		if (poll.status=="draft"){
			return true;
		}else{
			return false;
		}
	}
});