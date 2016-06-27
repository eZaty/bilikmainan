if(Meteor.settings.public.mode == 'live') {
    CONSTANT = {
        CFS_PATH: '/data',
        // CFS_PATH_THUMB: '/data/galleries/thumbs',
        CFS_URL: 'https://playroom.webe.com.my/cfs/files/galleries'
    }
} else {
    CONSTANT = {
        CFS_PATH: '~/Downloads/playroom-upload',
        // CFS_PATH_THUMB: '~/Downloads/playroom-upload/galleries/thumbs',
        CFS_URL: 'http://localhost:5000/cfs/files/galleries'
    }
}
