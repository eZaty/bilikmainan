Meteor.publish('timelines', function() {
  return Timelines.find();
});

Meteor.methods({
    addTimeline: function(params){
        return Timelines.insert(params);
    },

    deleteTimeline: function(galleryId) {
        return Timelines.remove({
            postId: galleryId
        });
    },

    updateTimeline: function(id, params) {
        return Timelines.update(id, {
            $set: params
		});
	}
});
