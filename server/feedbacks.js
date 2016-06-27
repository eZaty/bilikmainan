Meteor.publish('feedbacks', function() {
  return Feedbacks.find();
});

Meteor.methods({
    addFeedback:function(params){
         return Feedbacks.insert(params);
    }
});
