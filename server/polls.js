Meteor.publish('polls', function() {
  return Polls.find();
});


Meteor.methods({
    addPoll: function(params){
        return Polls.insert(params);
    },

    deletePoll: function(id) {
        return Polls.remove(id);
    },

    updatePoll: function(id, params) {
        return Polls.update(id, {
            $set: params
		});
	}
});
