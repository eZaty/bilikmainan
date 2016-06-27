var createImage = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    .resize('640', '')
    .gravity('Center')
    // .crop('350', '90')
    .stream('JPG')
    .pipe(writeStream);
};

var createThumb = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    // .resize('161', '161', '^')
    .resize('200', '')
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
var imageStore = new FS.Store.S3("galleryImages", {
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

var thumbStore = new FS.Store.S3("galleryThumbs", {
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

Galleries = new FS.Collection("galleries", {
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
