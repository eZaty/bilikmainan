var createImage = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    .resize('348', '282')
    .gravity('Center')
    // .crop('350', '90')
    .stream('PNG')
    .pipe(writeStream);
};

var createThumb = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    // .resize('161', '161', '^')
    .resize('90', '90')
    .gravity('Center')
    .crop('80', '80')
    .stream('PNG')
    .pipe(writeStream);
};

var renameFile = function (fileObj) {
    return {
        name: Random.id(),
        extension: 'png',
        type: 'image/png'
        // extension: 'jpg',
        // type: 'image/jpg'
    };
}

// S3 setups
var imageStore = new FS.Store.S3("profileImages", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "images",
    ACL: "public-read",
    transformWrite: createImage,
    beforeWrite: renameFile,
    maxTries: 1
});

var thumbStore = new FS.Store.S3("profileThumbs", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "thumbs",
    ACL: "public-read",
    transformWrite: createThumb,
    beforeWrite: renameFile,
    maxTries: 1
});

Profiles = new FS.Collection("profiles", {
    stores: [
        imageStore,
        thumbStore
    ],
    filter: {
        allow: {
            contentTypes: ['image/*']
        }
    }
});
