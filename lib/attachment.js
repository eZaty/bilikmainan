var attachmentStore = new FS.Store.S3("attachment", {
    region: "ap-southeast-1",
    accessKeyId: "AKIAIXAGQ5UGPFX3VSGA",
    secretAccessKey: "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",
    bucket: "webe-playroom",
    folder: "attachment",
    ACL: "public-read",
    beforeWrite: renameFile,
    maxTries: 1
});

var renameFile = function (fileObj) {
    return {
        name: Random.id()
    };
}

Attachments = new FS.Collection("attachments", {
    stores: [
        attachmentStore
    ],
    filter: {
        maxSize: 20971520, //in bytes = 2OMB
        allow: {
          extensions: ['zip','doc','docx','xlsx','xls','ppt','pptx','pdf']
        }
    }
});