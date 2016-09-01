Meteor.publish('allUsers', function (){
    return Meteor.users.find({},{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});

Meteor.publish('limitUsers', function (skip, limit){
    check(skip, Number);
    check(limit, Number);
    return Meteor.users.find({},{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        },
        skip: skip,
        limit: limit,
        sort: {
            "profile.nickName": 1
        }
    });
});

Meteor.publish('limitSearchUsers', function (query, skip, limit){
    check(query, String);
    check(skip, Number);
    check(limit, Number);
    var searchString = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    return Meteor.users.find({
        $or : [
            { 'profile.name':{ $regex:searchString, $options: 'i'} },
            { 'profile.nickName':{$regex:searchString, $options: 'i'} },
            { 'profile.department':{$regex:searchString, $options: 'i'} }
        ]
    },{
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        },
        skip: skip,
        limit: limit,
        sort: {
            "profile.nickName": 1
        }
    });
});

Meteor.publish('selectedUser', function(userId) {
    return Meteor.users.find({_id: userId}, {
        fields: {
            profile: 1,
            username: 1,
            roles: 1,
            webeeidstatus: 1
        }
    });
});

Meteor.publish('users-count', function() {
    Counts.publish(this, 'users', Meteor.users.find());
});

Meteor.publish('searchUsers-count', function(searchString) {
    check(searchString, String);
    Counts.publish(this, 'users', Meteor.users.find({
        $or : [
            { 'profile.name':{ $regex:searchString, $options: 'i'} },
            { 'profile.nickName':{$regex:searchString, $options: 'i'} },
            { 'profile.department':{$regex:searchString, $options: 'i'} }
        ]
    }));
});

Meteor.publish('user-roles', function(){
    return [
        Meteor.users.find({
            _id: this.userId
        }, {
            fields: {
                profile: 1,
                username: 1,
                roles: 1,
                webeeidstatus: 1
            }
        }),
        Groups.find(),
        Meteor.roles.find()
    ];
});

// Meteor.smartPublish('user-roles', function(userId){
//     check(userId, String);
//
//     this.addDependency('users', 'roles', function(user){
//         var roles = ['employee'];
//         _.each(user.roles, function(r){
//             roles.push(r);
//         });
//         // console.log("roles:", roles);
//         return Groups.find({
//             slug: { $in: roles }
//         });
//     });
//
//     this.addDependency('users', 'roles', function(user){
//         var roles = ['employee'];
//         _.each(user.roles, function(r){
//             roles.push(r);
//         });
//         return Meteor.roles.find({
//             name: { $in: roles }
//         });
//     });
//
//     return Meteor.users.find({
//         _id: userId
//     }, {
//         fields: {
//             profile: 1,
//             username: 1,
//             roles: 1
//         }
//     });
// });

Meteor.smartPublish('smart-users', function(skip, limit, fields){
    check(skip, Number);
    check(limit, Number);

    this.addDependency('users', '_id', function(user){
        return Profiles.find({
            userId: user._id
        });
    });

    return Meteor.users.find({}, {
        skip: skip,
        limit: limit,
        sort: {
            'profile.nickName': 1
        },
        fields: fields
    });
});

Meteor.methods({
    deleteUser: function(userId) {
        return Meteor.users.remove(userId);
    },

    updateUser: function(userId, params){
        return Meteor.users.update(userId, {$set: params});
    },

    updateWebeeIDStatus: function(userId, params){
        var user = Meteor.users.findOne(userId);
        if(!user) return;

        if (params.webeeidstatus=="rejected"){

            //send email
            var dataContext={
                userNickname: user.profile.nickName,
                comment: params.webeeidcomment
            };

            SSR.compileTemplate('emailTemplate', Assets.getText('emailwebeeIDTemplate-rejected.html'));
            var html = SSR.render('emailTemplate', dataContext);

            Email.send({
                //from: "webe Playroom <playroom@packet-1.com>",
                from: "webe Playroom <playroom@webe.com.my>",
                to: user.profile.email,
                subject: "webee ID Rejected",
                html: html
            });
        }

        // if (params.webeeidstatus=="accepted"){
        //
        //     // send email
        //     var dataContext={
        //       userNickname: user.profile.nickName,
        //     };
        //
        //     SSR.compileTemplate('emailTemplate', Assets.getText('emailwebeeIDTemplate-accepted.html'));
        //     var html = SSR.render('emailTemplate', dataContext);
        //
        //     Email.send({
        //         from: "webe Playroom <playroom@webe.com.my>",
        //         to: user.profile.email,
        //         subject: "webee ID Approved",
        //         html: html
        //     });
        // }

        if (params.webeeidstatus=="printed"){
        
            // send email
            var dataContext={
              userNickname: user.profile.nickName,
            };
        
            SSR.compileTemplate('emailTemplate', Assets.getText('emailwebeeIDTemplate-printed.html'));
            var html = SSR.render('emailTemplate', dataContext);
        
            Email.send({
                from: "webe Playroom <playroom@webe.com.my>",
                to: user.profile.email,
                subject: "webee ID ready for collection",
                html: html
            });
        }

        if (params.webeeidstatus=="collected"){
            var now = new Date();

            var audit = {
                'webeeidcollected_at': now,
                'webeeidcollected_by': Meteor.userId()
            }
            // var data = merge2JsonObjects(params, audit);

            var data = {};
            Object.assign(data, params, audit);

            return Meteor.users.update(userId, {$set: data});

        }else{
            return Meteor.users.update(userId, {$set: params});
        }
    },

    webeIDAutoUpdate: function(data){
        check( data, Array );

        var result;
        var userNotFound = "<h3>MISSING USERS</h3>";
        var userUpdated = "<h3>USERS LIST</h3>";
        var userNotFoundCount = 0;
        var userUpdatedCount = 0;

        for ( i = 0; i < data.length; i++ ) {
            var item   = data[i];
            var email = item.email;
            var code = item.code;

            var ind = email.indexOf("@");

            var emailID = email.slice(0,ind);

            var emailWebe = emailID + '@webe.com.my';

            var user = Meteor.users.findOne( { 'profile.email': { $in: [email, emailWebe] } } );

            // var match = Regex.Match(item.code,new RegExp("(\d+)$"));
            // if(match.Success)
            //     code = 'wbx' + match.Groups[1].ToString();
            code = code.replace("P1N", "");
            code = code.replace("HR", "");
            code = code.replace("M", "");

            if ( !user ) {
                userNotFoundCount ++;
                userNotFound += userNotFoundCount + '. [ ' + item.code + ' ] ' +item.name + ' - ' + item.email + '<br>';

                // insert user
                // var params = {
                //     'username': emailID,
                //     'profile': {
                //         'name': item.name,
                //         'email': emailWebe,
                //         'title': '',
                //         'department': '',
                //         'givenName': item.name,
                //         'nickName': '',
                //         'greeting': '',
                //         'webeeId': code,
                //         'pattern': '',
                //         'color': ''
                //     }
                // }

                // Meteor.users.insert(params);

            } else {
                var codeStatus = "ok";
                if (code != user.profile.webeeId)
                codeStatus = "updated";

                userUpdatedCount ++;
                userUpdated += userUpdatedCount + '. [ ' + item.code + ' ] ' +item.name + ' - ' + item.email + ' [ <b>' + codeStatus + '</b> ]<br>';

                var params = {
                    'profile.webeeId': code
                }

                Meteor.users.update(user._id,{$set: params});
            }
        }

        result = userUpdated + userNotFound;

        return result;
    },

    sendWebeeIDReminder: function(){
        var users = Meteor.users.find({
            'profile.pattern': {$exists : false}
        });

        users.forEach(function(user) {
            if(!user.profile.email) return;
            // send email
            var dataContext={
                userNickname: user.profile.givenName
            };

            SSR.compileTemplate('emailTemplate', Assets.getText('emailwebeeIDTemplate-reminder.html'));
            var html = SSR.render('emailTemplate', dataContext);

            Email.send({
                //from: "webe Playroom Admin <playroom@packet-1.com>",
                from: "webe Playroom <playroom@webe.com.my>",
                to: user.profile.email,
                subject: "webee ID Reminder",
                html: html
            });
        });

        return true;
    }
});
