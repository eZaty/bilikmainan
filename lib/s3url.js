FS.File.prototype.S3Url = function(storeName) {
    var self = this;
    if (!self.isMounted()) return null;

    var store = self.getCollection().storesLookup[storeName];
    if(!store.bucket) return null;

    var urlHost = 'https://s3-'+store.region+'.amazonaws.com/';
    if(!self.copies) return null;

	if(!self.copies[storeName]) return null;

    var urlPath = [store.bucket, store.folder, self.copies[storeName].key].join('/');
    return urlHost + urlPath;
}
