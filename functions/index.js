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


//20210214 こっからはGiftのための記述を設ける
const stripe = require('stripe')('sk_test_51HJd7bK4amKkUSI0gd1p6xtB6vVoOeuaV8Ek8gvoPHUvl5vICWTbdXnR1lQySaBxymTWEUOqm3HMteZqbgJ3F71n00n3SyqMYc');
const express = require('express');
const app = express();

//20210217ここからhttp request を受け取るための追加記述
// Automatically allow cross-origin requests
const cors = require('cors');
app.use(cors({ origin: true }));


app.use(express.static('.'));
const YOUR_DOMAIN = 'http://yarukeeper.com';
app.post('/create-checkout-session', async (req, res) => {
    //console.log("とだい", req.body["diaryTo"]);
    //console.log("ゆざふろ", req.body["userFrom"]);
    //console.log("ゆざと", req.body["userTo"]);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                currency: 'jpy',
                product_data: {
                    name: 'チア―',
                    images: ['https://yarukeeper.com/images/rogoann_game.jpg'],
                },
                unit_amount: 500
                },
                quantity: 1
            },
        ],
        /*line_items: [
            {price: 'price_1IKH71K4amKkUSI0W0l7TI78', quantity: 1},
        ],*/
        payment_intent_data:{
            metadata: { fromUser : req.body["userFrom"], toDiary: req.body["diaryTo"], toUser: req.body["userTo"]}
        },
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    });
    res.json({ id: session.id });
});
//実行例を確認するためのapp.listenと認識書かなくてもいい感じ？
//app.listen(4242, () => console.log('Running on port 4242'));


//成功後の処理は以下と認識
// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/account/apikeys
//const stripe = require('stripe')('sk_test_51HJd7bK4amKkUSI0gd1p6xtB6vVoOeuaV8Ek8gvoPHUvl5vICWTbdXnR1lQySaBxymTWEUOqm3HMteZqbgJ3F71n00n3SyqMYc');
// This example uses Express to receive webhooks
//const app = require('express')();
// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

// Match the raw body to content type application/json
app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
    let event;
    //console.log("リクエスト", request);
    //console.log("レスポンス", response);
    //console.log("ボディ", request.body);
    try {
        //event = JSON.parse(request.body);
        event=request.body;
        //console.log("event", event);
    } catch (err) {
        console.log("error message", err.message);
        response.status(400).send(`Webhook Error: ${err.message}`);
    }
    //console.log("イベント", event);
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            //console.log("ペイメントインテント", paymentIntent);
            //ここにGiftのグラフを増やす処理を書く
            //console.log("めたでた１", paymentIntent.charges.data[0].metadata);
            //console.log("めたでた２", paymentIntent.metadata);
            var toDiaryId = paymentIntent.metadata.toDiary;
            //console.log("トダイアリ", toDiaryId);
            var toUserId = paymentIntent.metadata.toUser;
            //console.log("とゆざあいで", toUserId);
            var fromUserId = paymentIntent.metadata.fromUser;
            //console.log("ふろゆざ", fromUserId);
            //diaryのGIFTのカウントを増やす処理
            var promiseDiary = db.collection('users').doc(toUserId).collection("diaries").doc(toDiaryId).update({
                countGift: admin.firestore.FieldValue.increment(1)
            }).then(function(data){
                console.log("Gift完了",data);
            }).catch(function(error){
                console.log("Error =>", error);
            });
            //ユーザ側で何にGiftを送ったのか記す処理
            var promiseUser = db.collection('users').doc(fromUserId).update({
                Gift: admin.firestore.FieldValue.arrayUnion(toDiaryId)
            }).then(function(data){
                console.log("Gift完了",data);
            }).catch(function(error){
                console.log("Error =>", error);
            });
            //20210305支払いのフラグをユーザのデータベースに書き込む
            //promiseGiftじゃなくてmoney_dataをプロミスに代入してその下の階層でpromiseGiftを動かすとかのがいいかも
            var promiseGift = db.collection("users").doc(toUserId).get().then(function(firedata){
                //ユーザがstripeのIdを持ってるかどうかで分岐
                //ユーザの継続数などに応じて分岐
                var result_amount = GiftMoneyF(firedata.data());
                var result = {
                    Date: admin.firestore.FieldValue.serverTimestamp(),
                    From: fromUserId,
                    IdStripe: firedata.data().IdStripe,
                    Amount: result_amount
                }
                db.collection('users').doc(toUserId).collection("money").add(result).then((docRef) => {
                    console.log("Document written with ID: ", docRef.id);
                }).catch((error) => {
                    console.error("Error adding document: ", error);
                });
            }).catach(function(error){
                console.log("Error", error);
            });
            //非同期化の検証のためプロミスallを戻り値にしています➡問題なさそう
            Promise.all([promiseDiary, promiseUser,promiseGift]).then((values) => {
                console.log(values);
            });
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.json({received: true});
});

//20210312 とりあえず追加しましたが、StripeConnectStandard登録のGitにはもうちょい書かれてるのでこれで完遂なのかはちょっと不明
app.post("/onboard-user", async (req, res) => {
    try {
        /*
        const account = await stripe.accounts.create({type: "standard"});
        req.session.accountID = account.id;
    
        const origin = `${req.headers.origin}`;
        const accountLinkURL = await generateAccountLink(account.id, origin);
        res.send({ url: accountLinkURL });
        */

        /*上Git 下Doc*/
        const account = await stripe.accounts.create({
            type: 'standard',
        });
        //refreshとかで使いそうだからsessionなんちゃらに代入だね
        //req.session.accountID = account.id;20210312ここの時点でなぜかエラーはいたから除外する
        //20210312アカウントのID的なやつ、Documentで書かれてるやつを基本的に参考にしたよおそらくこれで動いてくれるはずなんだがどうだわからん
        //sample ? acct_1032D82eZvKYlo2C このアカウントらしきものの正体がわからん

        //本当はこの辺りで、IDをfirestore側に登録する喜寿を書くのが順当なんだろうが、standardアカウントは
        //ユーザにやさしくない（手続きがめんどい）のでcustomに変更する一応git commit しておく
        //データベース統合ができてないのでユーザはアカウント作っても何もできないナウ

        //202210313上で作ったアカウントに関するIDを使う必要があるっぽいね
        const accountLinks = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: 'https://asia-northeast1-levup-5017a.cloudfunctions.net/widgets/onboard-user',
            return_url: 'https://yarukeeper.com/stripe-success.html',
            type: 'account_onboarding',
        }).then((link) => link.url);
        res.send({ url: accountLinks });
    } catch (err) {
        res.status(500).send({
            error: err.message,
        });
    }
});

//20210312なんかrefreshも指定した方がベストプラクティスらしいので。
app.get("/onboard-user/refresh", async (req, res) => {
    if (!req.session.accountID) {
        res.redirect("/");
        return;
    }
    try {
        const { accountID } = req.session;
        //20210312refreshじゃない上でのエラーに基づいて対応しました
        /*
        const origin = `${req.secure ? "https://" : "https://"}${req.headers.host}`;
        const accountLinkURL = await generateAccountLink(accountID, origin);
        res.redirect(accountLinkURL);
        */
        const accountLinks = await stripe.accountLinks.create({
            account: accountID,
            refresh_url: 'https://asia-northeast1-levup-5017a.cloudfunctions.net/widgets/onboard-user',
            return_url: 'https://yarukeeper.com/stripe-success.html',
            type: 'account_onboarding',
        }).then((link) => link.url);
        res.redirect(accountLinks);
    } catch (err) {
        res.status(500).send({
            error: err.message,
        });
    }
});

app.listen(4242, () => console.log('Running on port 4242'));//これ上でも書いてるから消した

//202210217 ここもhttp request を受け取るための記述
// Expose Express API as a single Cloud Function:
exports.widgets = functions.region('asia-northeast1').https.onRequest(app);

function GiftMoneyF(userdata){
    var result = userdata.total + 299;
    if(result > 400){
        result = 400;
    }
    return result;
};

//20210309 diary と user の total のカウントの紐づけを行いたいので、oncreate で増加させる
exports.DiaryToCount = functions.firestore.document('users/{userId}').onCreate((snap, context) => {
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