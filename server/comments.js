Meteor.publish('comments', function(postId) {
    check(postId, String);
    return Comments.find({
        postId: postId
    }, {
        sort: {
            createdAt: 1
        }
    });
});

Meteor.publish('comments-count', function(postId) {
    Counts.publish(this, 'comments-'+postId, Comments.find({
        postId: postId
    }));
});

Meteor.smartPublish('comments-users', function(postId, fields){
    check(postId, String);
    check(fields, Object);

    this.addDependency('comments', 'userId', function(comment){
        return [
            Meteor.users.find({
                _id: comment.userId
            }, {
                fields: fields
            }),
            Profiles.find({
                userId: comment.userId
            })
        ];
    });

    return Comments.find({
        postId: postId
    }, {
        sort: {
            createdAt: 1
        }
    });
});

Meteor.methods({
    addComment:function(params){
        return Comments.insert(params);
    },

    removeComment: function(commentId) {
        return Comments.remove(commentId);
    }
});
