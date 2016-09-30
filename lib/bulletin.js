Bulletin_Posts = new Meteor.Collection('bulletin_posts');

Bulletin_Post_Types = new Meteor.Collection('bulletin_post_types');

// Bulletin_Comments = new Meteor.Collection('bulletin_comments');

// Limited_Bulletin_Posts = new Meteor.Collection('limit_bulletin_posts');

// Limited_Bulletin_Comments = new Meteor.Collection('limit_bulletin_comments');

var createBulletinCover = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    //.resize('640', '640')
    .gravity('Center')
    // .crop('350', '90')
    .stream('JPG')
    .pipe(writeStream);
};

var createBulletinThumb = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    // .resize('161', '161', '^')
    .resize('161', '161')
    .gravity('Center')
    // .crop('161', '161')
    .stream('JPG')
    .pipe(writeStream);
};


var renameFile = function (fileObj) {
    return {
        name: Random.id()
    };
    // return {
    //     name: Random.id(),
    //     extension: 'jpg',
    //     type: 'image/jpg'
    // };
}

// S3 setups
var bulletinImageStore = new FS.Store.S3("bulletinImages", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "images",
    ACL: "public-read",
    transformWrite: createBulletinCover,
    beforeWrite: renameFile,
    maxTries: 1
});

var bulletinVideoStore = new FS.Store.S3("bulletinVideos", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "videos",
    ACL: "public-read",
    beforeWrite: renameFile,
    maxTries: 1
});

var bulletinThumbStore = new FS.Store.S3("bulletinThumbs", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "thumbs",
    ACL: "public-read",
    transformWrite: createBulletinThumb,
    beforeWrite: renameFile,
    maxTries: 1
});

Bulletin_Images = new FS.Collection("bulletin_images", {
    stores: [
        bulletinImageStore,
        bulletinThumbStore
    ],
    filter: {
        maxSize: 4194304, //in bytes
        allow: {
          contentTypes: ['image/*'],
          extensions: ['png','jpg','gif','jpeg']
        }
    }
});

Bulletin_Videos = new FS.Collection("bulletin_videos", {
    stores: [
        bulletinVideoStore
    ],
    filter: {
        maxSize: 52428800, //in bytes
        allow: {
          contentTypes: ['video/*'],
          extensions: ['mp4','avi','3gp','wmv']
        }
    }
});


TabularTables = {};

TabularTables.BulletinMine = new Tabular.Table({
  name: "BulletinMine",
  collection: Bulletin_Posts,
  responsive: true,
  autoWidth: false,
  order: [[0, "asc"]],
  columns: [
    {data: "title", title: "Title"},
    {data: "channel_id", title: "Channel"},
    {data: "type", title: "Type"},
    {data: "created_at", title: "Date"},
    {data: "created_by", title: "Creator"},
    {data: "featured", title: "Featured"},
    {data: "slug", title: "Slug"},
    {data: "_id", title: "Post",
      render: function (val, type, doc) {
        var channel = Channels.findOne(doc.channel_id);
        var type = Bulletin_Post_Types.findOne(doc.type);
        var creator = Meteor.users.findOne(doc.created_by);
        var cover_photo = bulletin_post_cover_photo(doc._id,'thumbs');

        var creator_name = "-";

        if (creator){
            creator_name = creator.profile.name;
        }

        var ret = "<div style='float:left; margin-right: 20px;'><img src='" + cover_photo + "' class='img-circle' style='width:50px; height: 50px;'></div>" 
        + "<div style='float:left'><span class='label label-info'>" + channel.title + "</span> / <span class='label label-default'>"+ type.title + "</span> <br>"
        + "<a target='_blank' href='/bulletin/" + channel.path + "/" + doc.slug + "' style='font-family: Panton Black'>" + doc.title + "</a><br>" 
        + "created by <span style='font-family:Panton ExtraBold; color: #de1175;'>" + creator_name + "</span> on <i class='bulletin-post-date'>" + doc.created_at + "</i></div>";

        return ret;
      }
    },
    {data: "status", title: "Status",
      render: function (val, type, doc) {
        var cls = "label-warning";

        if (val=='published'){
            cls = 'label-success';
        }

        var ret = "<span class='label " + cls + "'>" + val + "</span>";

        if (doc.featured == "yes"){
            ret += "<br><span class='label label-info'>Featured</span>";
        }

        return ret;
      }
    },
    {
      tmpl: Meteor.isClient && Template.bulletinMineTableButtons
    }
  ]
});