Meteor.publish('poll_votes', function() {
  return PollVotes.find();
});


Meteor.publish('pollVotesByPollId', function(pollId) {
    check(pollId, String);
    return PollVotes.find({
        pollId: pollId
    });
});


Meteor.methods({
    addPollVote:function(params){
        return PollVotes.insert(params);
    },

    removePollVotes: function(id) {
        return PollVotes.remove(id);
    },

    removePollVotesByPollId: function(pollId) {
        return PollVotes.remove({
            pollId: pollId
        });
    }
});
