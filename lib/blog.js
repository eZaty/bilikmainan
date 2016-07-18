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
