Meteor.publish('attachments', function() {
  return Attachments.find();
});

Attachments.allow({
    insert: function(){
        return true;
    },
    update: function(){
        return true;
    },
    download: function(){
        return true;
    },
    remove: function(){
        return true;
    }
});

Meteor.methods({
    deleteAttachment: function(id){
         Attachments.remove({
             postId: id
         });
         return true;
    }
});