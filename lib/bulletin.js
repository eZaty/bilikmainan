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