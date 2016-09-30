Blogs = new Meteor.Collection('blogs');

Blog_Posts = new Meteor.Collection('blog_posts');

// Blog_Comments = new Meteor.Collection('blog_comments');

var createBlogCover = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    //.resize('640', '640')
    .gravity('Center')
    // .crop('350', '90')
    .stream('JPG')
    .pipe(writeStream);
};

var createBlogThumb = function(fileObj, readStream, writeStream) {
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
        name: Random.id(),
        extension: 'jpg',
        type: 'image/jpg'
    };
}

// S3 setups
var blogImageStore = new FS.Store.S3("blogImages", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "images",
    ACL: "public-read",
    transformWrite: createBlogCover,
    beforeWrite: renameFile,
    maxTries: 1
});

var blogThumbStore = new FS.Store.S3("blogThumbs", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "thumbs",
    ACL: "public-read",
    transformWrite: createBlogThumb,
    beforeWrite: renameFile,
    maxTries: 1
});

Blog_Images = new FS.Collection("blog_images", {
    stores: [
        blogImageStore,
        blogThumbStore
    ],
    filter: {
        allow: {
            contentTypes: ['image/*']
        }
    }
});

TabularTables = {};

TabularTables.BlogMine = new Tabular.Table({
  name: "BlogMine",
  collection: Blog_Posts,
  responsive: true,
  autoWidth: false,
  order: [[0, "asc"]],
  columns: [
    {data: "title", title: "Title"},
    {data: "blog_id", title: "Blog"},
    {data: "created_at", title: "Date"},
    {data: "created_by", title: "Creator"},
    {data: "featured", title: "Featured"},
    {data: "slug", title: "Slug"},
    {data: "_id", title: "Post",
      render: function (val, type, doc) {
        var blog = Blogs.findOne(doc.blog_id);
        var creator = Meteor.users.findOne(doc.created_by);
        var cover_photo = blog_post_cover_photo(doc._id,'thumbs');

        var creator_name = "-";

        if (creator){
            creator_name = creator.profile.name;
        }

        var ret = "<div style='float:left; margin-right: 20px;'><img src='" + cover_photo + "' class='img-circle' style='width:50px; height: 50px;'></div>" 
        + "<div style='float:left'><span class='label label-info'>" + blog.title + "</span> <br>"
        + "<a target='_blank' href='/magz/" + blog.path + "/" + doc.slug + "' style='font-family: Panton Black'>" + doc.title + "</a><br>" 
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
      tmpl: Meteor.isClient && Template.blogMineTableButtons
    }
  ]
});
