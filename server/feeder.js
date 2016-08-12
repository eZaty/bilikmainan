Meteor.startup(function(){

    // -- initialize admin account
    var users = [
          {
              name:"Playroom Admin",
              username: 'playroom',
              password: 'Zaq!Xsw@Cde#',
              email: "playroom@packet-1.com",
              title: "Playroom Admin",
              department: "Service Innovation",
              roles: ['admin']
          },
          {
              name:"Viewer",
              username: 'viewer',
              password: 'Viewer!',
              email: "viewer@packet-1.com",
              title: "Viewer",
              department: "Service Innovation",
              roles: []
          }
    ];
    _.each(users, function (user) {
          var chkusr = Meteor.users.findOne({'profile.email': user.email});
          if(!chkusr) {
             var id = Accounts.createUser({
                username: user.username,
                password: user.password,
                profile: {
                    email: user.email,
                    name: user.name,
                    givenName: user.name,
                    // displayName: user.name,
                    nickName: user.name,
                    title: user.title,
                    department: user.department
                }
             });

             if (user.roles.length > 0) {
                 Roles.addUsersToRoles(id, user.roles);
             }
          }
    });


    // -- initialize user group
    var groups = [
          {
              name: 'Employee',
              slug: 'employee',
              routes: []
          }
    ];
    _.each(groups, function (group) {
          var chkgrp = Groups.findOne({'slug': group.slug});
          if(!chkgrp) {
             var id = Groups.insert({
                name: group.name,
                slug: group.slug,
                routes: group.routes
             });
          }
    });

});
