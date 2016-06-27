Meteor.publish('groups', function() {
  return Groups.find();
});


Meteor.methods({
    addGroup: function(params){
        return Groups.insert(params);
    },

    deleteGroup: function(id) {
        return Groups.remove(id);
    },

    updateGroup: function(id, params) {
        return Groups.update(id, {
            $set: params
		});
	}
});
