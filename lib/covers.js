var createImage = function(fileObj, readStream, writeStream) {
    gm(readStream, fileObj.name())
    .resize('1245', '350', '^')
    .gravity('Center')
    .extent('1245', '350')
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
var imageStore = new FS.Store.S3("coverImages", {
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

Covers = new FS.Collection("covers", {
    stores: [
        imageStore
    ],
    filter: {
        allow: {
            contentTypes: ['image/*']
        }
    }
});
