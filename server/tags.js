Meteor.publish('tags', function() {
  return Tags.find();
});

Tags.allow({
    insert: function(){
        return true;
    },
    remove: function(){
        return true;
    }
});

Meteor.methods({
	addTag: function(params){
        if(!Meteor.userId()) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in');
        }

        // check whether tag exists or not
        var tag = Tags.findOne({
        	tag: params.tag,
        	obj: params.obj
        });

        if (tag){
        	Tags.update(tag._id,{
        		$push:{
        			obj_ids: params.obj_id
        		}
        	});
        	throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Tag already exists');
        }else{
        	var now = new Date();

        	var data = {
        		'tag': params.tag,
        		'obj': params.obj,
        		'obj_ids': [ params.obj_id ],
	    		'created_at': now,
	    		'created_by': Meteor.userId()
	    	}

        	return Tags.insert(data);
        }
    },

    removeObjectTag: function(params){
        if(!Meteor.userId()) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in');
        }

        // check whether tag exists or not
        var tag = Tags.findOne({
        	tag: params.tag,
        	obj: params.obj
        });


        if (tag){
        	if (tag.obj_ids.length>1){
    			Tags.update(tag._id,{
	        		$pull:{
	        			obj_ids: params.obj_id
	        		}
	        	});
    		}else{
    			Tags.remove(tag._id);
    		}
        }else{
        	throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Tag ('+params.tag+') not found');
        }
    },

    removeAllObjectTags: function(id){
        if(!Meteor.userId()) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in');
        }

        // check whether tag exists or not
        var tags = Tags.find({
        	obj_ids: id
        });


        if (tags){
        	tags.forEach(function (tag) {
        		if (tag.obj_ids.length>1){
        			Tags.update(tag._id,{
		        		$pull:{
		        			obj_ids: id
		        		}
		        	});
        		}else{
        			Tags.remove(tag._id);
        		}
        	});
        }else{
        	throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'Object does not have any tag.');
        }
    },

    deleteTag: function(id) {
        if(!Meteor.userId()) {
            throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'User not logged in');
        }

        var tag = Tags.findOne(id);

        if (tag.obj_ids.length>0){
        	// do nothing
        	throw new Meteor.Error(500, 'Error 500: Internal Server Error', 'tag currently used by object(s)');
        }else{
	        return Tags.remove(id);
	    }
    }
});
