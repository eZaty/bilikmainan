Meteor.startup(function () {

    LDAP_DEFAULTS.url = 'ldap://192.168.250.216';
    LDAP_DEFAULTS.port = 389;
    // LDAP_DEFAULTS.dn = '';
    LDAP_DEFAULTS.createNewUser = true;
    LDAP_DEFAULTS.base = 'dc=greenpacket,dc=com';

    LDAP_DEFAULTS.searchResultsProfileMap = [
        {
            resultKey: 'name',
            profileProperty: 'name'
        }, {
            resultKey: 'mail',
            profileProperty: 'email'
        }, {
            resultKey: 'mobile',
            profileProperty: 'phone'
        }, {
            resultKey: 'ipPhone',
            profileProperty: 'ipPhone'
        }, {
            resultKey: 'title',
            profileProperty: 'title'
        }, {
            resultKey: 'title',
            profileProperty: 'nickTitle'
        }, {
            resultKey: 'department',
            profileProperty: 'department'
        }, {
            resultKey: 'givenName',
            profileProperty: 'givenName'
        }, {
            resultKey: 'givenName',
            profileProperty: 'nickName'
        }
    ];

    Accounts.config({
        forbidClientAccountCreation: true
        // -- test from master
    });

});

// function getWordpressPosts(){
//     Meteor.http.call("GET", "http://ideabank.packet-1.com/news/wp-json/wp/v2/posts",
//     function(error, result) {
//         if (result.statusCode === 200) {
//             for (var i=0; i < result.data.length; i++) {
//                 var obj = rewriteProperties(result.data[i]);
//
//                 var post = Wordpress.findOne({"id": obj["id"], "date": obj["date"]});
//
//                 if (post==null){
//                     // console.log(i + ". insert news: " + obj);
//
//                     Wordpress.insert(obj);
//                 }else{
//                     if (post.modified != obj["modified"]){
//                         Wordpress.remove({_id: post._id});
//                         Wordpress.insert(obj);
//                         console.log(i + ". updated news: " + obj);
//                     }
//                 }
//             }
//         }
//         else {
//             console.log("error:" + result);
//         }
//     });
//
//     Meteor.http.call("GET", "http://ideabank.packet-1.com/hcd/wp-json/wp/v2/posts",
//     function(error, result) {
//         if (result.statusCode === 200) {
//             for (var i=0; i < result.data.length; i++) {
//                 var obj = rewriteProperties(result.data[i]);
//
//                 var post = Wordpress.findOne({"id": obj["id"], "date": obj["date"]});
//
//                 if (post==null){
//                     // console.log(i + ". insert hcd: " + obj);
//                     Wordpress.insert(obj);
//                 }else{
//                     if (post.modified != obj["modified"]){
//                         Wordpress.remove({_id: post._id});
//                         Wordpress.insert(obj);
//                         console.log(i + ". updated hcd: " + obj);
//                     }
//                 }
//             }
//         }
//         else {
//             console.log("error:" + result);
//         }
//     });
//
//     Meteor.http.call("GET", "http://ideabank.packet-1.com/marketinsigt/wp-json/wp/v2/posts",
//     function(error, result) {
//         if (result.statusCode === 200) {
//             for (var i=0; i < result.data.length; i++) {
//                 var obj = rewriteProperties(result.data[i]);
//
//                 var post = Wordpress.findOne({"id": obj["id"], "date": obj["date"]});
//
//                 if (post==null){
//                     // console.log(i + ". insert marketinsigt: " + obj);
//                     Wordpress.insert(obj);
//                 }else{
//                     if (post.modified != obj["modified"]){
//                         Wordpress.remove({_id: post._id});
//                         Wordpress.insert(obj);
//                         console.log(i + ". updated marketinsigt: " + obj);
//                     }
//                 }
//             }
//         }
//         else {
//             console.log("error:" + result);
//         }
//     });
// }
//
// function rewriteProperties(obj) {
//     if (typeof obj !== "object") return obj;
//     for (var prop in obj) {
//         if (obj.hasOwnProperty(prop)) {
//             obj[prop.replace(/\./g, "_dot_")] = rewriteProperties(obj[prop]);
//             if (prop.indexOf(".") > -1) {
//                 delete obj[prop];
//             }
//         }
//     }
//     return obj;
// }
