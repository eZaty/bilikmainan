Announcement_Channels = new Meteor.Collection('announcement_channels');

Announcement_Posts = new Meteor.Collection('announcement_posts');

// Announcement_Comments = new Meteor.Collection('announcement_comments');

// Limited_Announcement_Posts = new Meteor.Collection('limit_announcement_posts');

// Limited_Announcement_Comments = new Meteor.Collection('limit_announcement_comments');

Announcement_Mailing_Lists = new Meteor.Collection('announcement_mailing_lists');

var createAnnouncementCover = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    //.resize('640', '640')
    .gravity('Center')
    // .crop('350', '90')
    .stream('JPG')
    .pipe(writeStream);
};

var createAnnouncementThumb = function(fileObj, readStream, writeStream) {
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
var announcementImageStore = new FS.Store.S3("announcementImages", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "images",
    ACL: "public-read",
    transformWrite: createAnnouncementCover,
    beforeWrite: renameFile,
    maxTries: 1
});

var announcementVideoStore = new FS.Store.S3("announcementVideos", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "videos",
    ACL: "public-read",
    beforeWrite: renameFile,
    maxTries: 1
});

var announcementThumbStore = new FS.Store.S3("announcementThumbs", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "thumbs",
    ACL: "public-read",
    transformWrite: createAnnouncementThumb,
    beforeWrite: renameFile,
    maxTries: 1
});

Announcement_Images = new FS.Collection("announcement_images", {
    stores: [
        announcementImageStore,
        announcementThumbStore
    ],
    filter: {
        maxSize: 2097152, //in bytes
        allow: {
          contentTypes: ['image/*'],
          extensions: ['png','jpg','gif','jpeg']
        }
    }
});

Announcement_Videos = new FS.Collection("announcement_videos", {
    stores: [
        announcementVideoStore
    ],
    filter: {
        maxSize: 10485760, //in bytes
        allow: {
          contentTypes: ['video/*'],
          extensions: ['mp4','avi']
        }
    }
});