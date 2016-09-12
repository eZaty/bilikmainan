Channels = new Meteor.Collection('channels');

var createChannelCover = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    //.resize('640', '640')
    .gravity('Center')
    // .crop('350', '90')
    .stream('JPG')
    .pipe(writeStream);
};

var createChannelThumb = function(fileObj, readStream, writeStream) {
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
var channelImageStore = new FS.Store.S3("channelImages", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "images",
    ACL: "public-read",
    transformWrite: createChannelCover,
    beforeWrite: renameFile,
    maxTries: 1
});

var channelThumbStore = new FS.Store.S3("channelThumbs", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "thumbs",
    ACL: "public-read",
    transformWrite: createChannelThumb,
    beforeWrite: renameFile,
    maxTries: 1
});

Channel_Images = new FS.Collection("channel_images", {
    stores: [
        channelImageStore,
        channelThumbStore
    ],
    filter: {
        allow: {
            contentTypes: ['image/*']
        }
    }
}); 