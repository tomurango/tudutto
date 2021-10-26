const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//.region('asia-northeast1')

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/* eslint-disable */

//only blaze 定期処理 0時0分 に実行します
//taskのfinishedをfalseに変更します
//と思ったけど、なんかエラーでまくるから、クライアントサイドでログインの日付が新しかったら全部書き換えるような処理に変更します
//と思ったけど、クライアント動かんくて草生えるので、eslint外して力技で行け
//exports.scheduledtaskFunction = functions.pubsub.schedule('0 0 * * *').timeZone('Asia/Tokyo').onRun((context) => { .region('asia-northeast1')を書き足した
exports.uncheckTask = functions.region('asia-northeast1').pubsub.schedule('0 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
    //console.log('This will be run every day');
    //こっちだと、then とか promise 関係でエラーが出る感じらしい
    var promise1 = db.collectionGroup('tasks').where('finish', '==', true).get().then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            doc.ref.update({
                finish: false
            });
        });
        console.log("切り替えたタスクの数", querySnapshot.size);
    }).catch(function(error){
        console.log("Error =>", error);
    });
    //これは一日一回ボタンを押すことができるように書き換えるための記述
    var promise2 = db.collection('users').where('AlreadyPushed', '==', true).get().then(function (querySnapshot) {
        querySnapshot.forEach(function(doc) {
            doc.ref.update({
                AlreadyPushed: false
            });
        });
        console.log("切り替えたユーザの数", querySnapshot.size);
    }).catch(function(error){
        console.log("Error =>", error);
    });
    //非同期化の検証のためプロミスallを戻り値にしています
    var result = Promise.all([promise1, promise2]).then((values) => {
        console.log(values);
    });
    return result;
});

//only blaze 定期処理 23時0分 に実行します
//countを今日の一か月後に作成します
//exports.scheduledcountFunction = functions.pubsub.schedule('23 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
exports.createCount = functions.region('asia-northeast1').pubsub.schedule('23 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
    //console.log('This will be run every day');
    //var today = admin.firestore.FieldValue.serverTimestamp().toDate();
    var today = new Date();
    var month_after_text = getDatethirty(today);
    var count_promise = db.collection('counts').doc(month_after_text).set({
        count: 0
    }).then(function (doc) {
        console.log(today, "にて", month_after_text , "作成しました");
    }).catch(function(error){
        console.log("Error =>", error);
    });
    return count_promise;
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

//3日前の日記を削除する挙動
//exports.deletenormaldiaryFunction = functions.pubsub.schedule('23 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
/*なんか動いてないし、意味ない気がするので止める20211024
exports.deleteDiary = functions.region('asia-northeast1').pubsub.schedule('23 0 * * *').timeZone('Asia/Tokyo').onRun((context) => {
    var controll_date = new Date();
    controll_date.setDate(controll_date.getDate() - 3);
    var three_days_ago = admin.firestore.Timestamp.fromDate(controll_date);
    //消す動き
    var delete_promise = db.collectionGroup('diaries').where('userPlan', '==', 'normal').where('createdAt', '<', three_days_ago).get()
    .then(function (snapshot) {
        console.log(snapshot);
        // When there are no documents left, we are done
        if (snapshot.size == 0) {
            return 0;
        }
        // Delete documents in a batch
        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
    }).catch(function(error){
        console.log("Error =>", error);
    });
    return delete_promise;
});
*/


//20210309 diary と user の total のカウントの紐づけを行いたいので、oncreate で増加させる
//exports.DiaryToCount = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
//20210327上の記述じゃあ、ユーザ作られたらtotal追加するみたいなよくわからん状況なので書き換える
exports.DiaryToCount = functions.firestore.document('users/{userId}/diaries/{diaryId}').onCreate((snap, context) => {
// Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = snap.data();

    // access a particular field as you would any JS property
    const name = newValue.name;

    // perform desired operations ...
    //
    var promisetotal = db.collection("users").doc(context.params.userId).update({
        total: admin.firestore.FieldValue.increment(1)
    });
    return promisetotal;
});


//20211016auto_hitokotoのための関数
exports.updatetask = functions.firestore
.document('users/{userId}/tasks/{taskId}')
.onUpdate(async (change, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    // ...or the previous value before this update
    // access a particular field as you would any JS property
    //const name = newValue.name;
    // perform desired operations ...
    
    
    const previousValue = change.before.data();
    const newValue = change.after.data();
    if(newValue.finish){
        //taskを完了した時の処理なので、とりあえず報告を入れる方針で実装
        //userの情報を取ってくる
        var user_id = context.params.userId;
        var task_id = context.params.taskId;
        var timestamp = previousValue.timestamp;

        //ここでtimestampを参照して、存在しない及び未完了の時にdiary作成その他は、何もしないreturn
        if(timestamp==undefined){
            //t=task
            var promise_t = db.collection('users').doc(user_id).collection('tasks').doc(task_id).update({
                total: 1,
                combo: 1,
                good: 0,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            }).catch(function(error){
                console.log("Error =>", error);
            });

            //d=diary
            var promise_d = admin.auth().getUser(user_id).then((userRecord) => {
                var new_diary = {
                    conTent: newValue.text,
                    userId: user_id,
                    userName: userRecord.displayName,
                    userIcon: userRecord.photoURL,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    countGood: 0,
                    taskId: task_id
                }
                console.log("user id =>", user_id);
                return db.collection("users").doc(user_id).collection("diaries").add(new_diary).then(function(){
                    countdbtask(user_id,task_id,timestamp)
                }).catch(function(error){
                    console.log("error", error);
                });
            }).catch((e) => console.log(e));

            //非同期化の検証のためプロミスallを戻り値にしています
            var result = Promise.all([promise_t, promise_d]).then((values) => {
                console.log("Promise all ", values);
            });
            return result;
        }else if(istoday(timestamp)){
            //return 0
            return 0
        }else{
            //diary作成//d=diary
            var promise_d = admin.auth().getUser(user_id).then((userRecord) => {
                var new_diary = {
                    conTent: newValue.text,
                    userId: user_id,
                    userName: userRecord.displayName,
                    userIcon: userRecord.photoURL,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    countGood: 0,
                    taskId: task_id
                }
                console.log("user id =>", user_id);
                return db.collection("users").doc(user_id).collection("diaries").add(new_diary).then(function(){
                    countdbtask(user_id,task_id,timestamp)
                }).catch(function(error){
                    console.log("error", error);
                });
            }).catch((e) => console.log(e));
            return promise_d;
        }
    }
});

//引数の日時を参考にそれが本日であるかどうかを参考にする。
function istoday(timestamp){
    //引数からの日時を取得
    var got_info = timestamp.toDate();
    var fire_now = admin.firestore.FieldValue.serverTimestamp();
    var now_info = fire_now.toDate();
    if(got_info.getFullYear()==now_info.getFullYear() && got_info.getMonth()==now_info.getMonth() && got_info.getDate()==now_info.getDate()){
        return true
    }else{
        return false
    }
}

//Diaryを作成した後に、taskのcombo,total,timestampの更新を行うための関数
function countdbtask(user_id,task_id,beforetime){
    //達成が前日かどうかでコンボの判断を行う。
    var beforedate = beforetime.toDate();
    //一日送らせて、日付比較を行う
    beforedate.setDate(beforedate.getDate() + 1);
    var nowstamp = admin.firestore.FieldValue.serverTimestamp();
    var nowdate = nowstamp.toDate();
    if(beforedate.getFullYear()==nowdate.getFullYear() && beforedate.getMonth()==nowdate.getMonth() && beforedate.getDate()==nowdate.getDate()){
        var comboresult = admin.firestore.FieldValue.increment(1);
    }else{
        var comboresult = 0;
    }
    var promise_tc = db.collection('users').doc(user_id).collection('tasks').doc(task_id).update({
        count: admin.firestore.FieldValue.increment(1),
        combo: comboresult,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    }).catch(function(error){
        console.log("error", error);
    });
    return promise_tc
}