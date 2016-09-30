TabularTables = {};

TabularTables.Users = new Tabular.Table({
  name: "Users",
  collection: Meteor.users,
  responsive: true,
  autoWidth: false,
  order: [[3, "asc"]],
  columns: [
    {data: "profile.name", title: "Name"},
    {data: "profile.email", title: "Email"},
    {data: "_id", title: "", orderable: false,
      render: function (val, type, doc) {
        var photo = Profiles.findOne({userId: val},
        {
          sort: {
            uploadedAt: 1,
            limit: 1
          }
        });

        if (photo){
          var thumb = photo.S3Url('profileThumbs');

          if (thumb){
            return "<a target='_blank' href='/profile/user/"+val+"'><img src='" + thumb + "' class='img-circle' style='width:40px; height: 40px;'></a>";
          }else{
            return "<a target='_blank' href='/profile/user/"+val+"'><img src='/images/default-id.png' class='img-circle' style='width:40px; height: 40px;'></a>";
          }
        }else{
          return "<a target='_blank' href='/profile/user/"+val+"'><img src='/images/default-id.png' class='img-circle' style='width:40px; height: 40px;'></a>";
        }
      }
    },
    {data: "profile", title: "webees",
      render: function (val, type, doc) {
        return "<a target='_blank' href='/profile/user/"+doc._id+"' style='font-family: Panton-Black'>" + val.name + "</a><br>" + val.nickName + " / <i>" + val.email + "</i><br>" + val.department;
      }
    },
    {data: "roles", title: "Roles",
      render: function (val, type, doc) {
        var ret = "";

        if (val){
          for (i=0; i<val.length; i++){
            if (val[i]!="admin")
              ret += "<span class='label label-success'>" + val[i] + "</span> &nbsp;";
            else
              ret += "<span class='label label-warning'>" + val[i] + "</span> &nbsp;";
          }
        }

        return ret;
      }
    },
    {
      tmpl: Meteor.isClient && Template.userTableButtons
    }
  ]
});