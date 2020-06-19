const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/* eslint-disable */

//only blaze 定期処理 0時0分 に実行します
//taskのfinishedをfalseに変更します
//と思ったけど、なんかエラーでまくるから、クライアントサイドでログインの日付が新しかったら全部書き換えるような処理に変更します
//と思ったけど、クライアント動かんくて草生えるので、eslint外して力技で行け
exports.scheduledtaskFunction = functions.pubsub.schedule('0 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
    //console.log('This will be run every day');
    //こっちだと、then とか promise 関係でエラーが出る感じらしい
    db.collectionGroup('tasks').where('finish', '==', true).get().then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            doc.ref.update({
                finish: false
            });
        });
    }).catch(function(error){
        console.log("Error =>", error);
    });
    //これは一日一回ボタンを押すことができるように書き換えるための記述
    db.collection('users').where('AlreadyPushed', '==', true).get().then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            doc.ref.update({
                AlreadyPushed: false
            });
        });
    }).catch(function(error){
        console.log("Error =>", error);
    });
    
   /*Parsing error: Can not use keyword 'await' outside an async function
    const querySnapshot = await db.collectionGroup('tasks').where('finish', '==', true).get();
    querySnapshot.docs.forEach(snapshot => {
        snapshot.ref.update({
            finish: false
        });
    });*/
    /*
    const querySnapshot = await db.collectionGroup('tasks').where('finish', '==', true).get();
    querySnapshot.docs.forEach(snapshot => {
        snapshot.ref.update({
            finish: false
        });
    });
    */
    return null;
});

//only blaze 定期処理 23時0分 に実行します
//countを今日の一か月後に作成します
exports.scheduledcountFunction = functions.pubsub.schedule('23 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
    //console.log('This will be run every day');
    //var today = admin.firestore.FieldValue.serverTimestamp().toDate();
    var today = new Date();
    var month_after_text = getDatethirty(today);
    db.collection('counts').doc(month_after_text).set({
        count: 0
    }).then(function (doc) {
        console.log(today, "にて", month_after_text , "作成しました");
    }).catch(function(error){
        console.log("Error =>", error);
    });
    return null;
});

//日付の文字列を js の date Object から 作成するための関数
//一か月後を返します
function getDatethirty(date) {
    date.setDate(date.getDate() + 30);
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    if(month<10){
        month = "0" + String(month);
    }else{
        month = String(month);
    }
    var day   = date.getDate();
    if(day<10){
        day = "0" + String(day);
    }else{
        day = String(day);
    }
    return String(year) + month + day;
}