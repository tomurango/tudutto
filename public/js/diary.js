var global_diary = {};
var global_diary_comment = {};

//3日以内のnagareについて扱うためのタイムスタンプ 3日としているのは記憶のイメージに追加づけるため、記録したいなら課金してほすぃ
//20210321それぞれの日の0時0分からとってくるように変えます
var today0 = new Date(new Date().setHours(0, 0, 0, 0));
//var three_date_ago_trend = new Date();
//three_date_ago_trend.setDate(three_date_ago_trend.getDate() - 3);
var diary_timestamp = firebase.firestore.Timestamp.fromDate(today0);



function fab_diary(){
    //表示を出す
    document.getElementById("talk_card_div").style.display = "block";
    //title に対してイベントを指定する
    var $input = $('#diary_input');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    $input.on('input', function(event) {
        var value = $input.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("talk_create_button").disabled = true;
        }else{
            //入力あったらいけ
            document.getElementById("talk_create_button").disabled = false;
        }
    });
}

function fab_diary_back(){
    //表示を消す
    document.getElementById("talk_card_div").style.display = "none";
    //このイベント投稿欄を閉じたときに停止させる
    var $input = $('#talk_title_input');
    $input.off('input');
    //作成ボタンを機能停止に切り替える
    document.getElementById("talk_create_button").disabled = true;
    //入力を消す
    document.getElementById("diary_input").value ="";
}

function diary_create(){
    //tutorial
    /*if(tutorial_flag){
        document.getElementById("mission_three").style.display = "none";
    }*/
    var the_diary = document.getElementById("diary_input").value;
    //入力条件を管理する
    if(diary_rule(the_diary)){
        var the_time = new firebase.firestore.Timestamp.now();
        var new_diary = {
            conTent: the_diary,
            userId: global_user.uid,
            userName: global_user.displayName,
            userIcon: global_user.photoURL,
            //userPlan: userplan,
            createdAt: the_time,
            countGood: 0
            //20210327 Gift関連は消すことにした
            //countGift: 0
        }
        //記入する
        db.collection("users").doc(global_user.uid).collection("diaries").add(new_diary).then(function(docRef){
            //入力欄の表示を消す
            fab_diary_back();
            //talk_page_check();//20210131こちらもブランチ作成で変化が反映されてなかった
            //count_page_check();//20210321ボタン等の表示切替はこの関数で行うものでしたー。一つ上の行の記述がおそらく誤りだった。これにより日記作成後の動きが正しくなった
            //20210327count_page_checkはfab_countの後じゃないとおそらくあかんので、位置を変えました
            //けど、とりあえずボタン消しとくのがいいとは思うので消しときます
            document.getElementById("talk_page_fab").style.display = "none";
            document.getElementById("talk_page_fab").disabled = true;
            //カードを挿入するけど、自分で作成したカードを再取得するのを避けるためのタイムスタンプ定義
            //理想はgetDiaryで毎回取得してみるとかだろうけど速度遅いしなぁって感じか
            diary_timestamp = the_time;
            //カード挿入
            fab_count();//20210131カウントをしっかりと増やしていく➡croudfunctionで書くのもいいのかもね
            //20210905メッセージ送信をここだと仮定して、チュートリアルチェックを配置
            tutorial_check();
        }).catch(function(error){
            console.log("error", error);
        });
    }else{
        alert("条件を満たしていません");
    }
}

function diary_rule(diary){
    if(diary==""){
        //入力がないので
        return false
    }else{
        //すべての制限を突破したので送信可能
        return true
    }

    //文字数の制限もここで書き足していく感じでよろしいかと

}


//dateオブジェクトから日付文字列を返します
function getDate_diary(date) {
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var hour  = date.getHours();
    var minute= date.getMinutes();
    return String(year) + "年" + String(month) + "月" + String(day) + "日" + String(hour) + "時" + String(minute) + "分";
}

function error_image(element){
    element.src="/images/nanikaerror.jpg";
}

function sendcomment_todiary(){
    var tod_comment = document.getElementById("diary_comeinput_text").value;
    //入力を消す
    document.getElementById("diary_comeinput_text").value ="";
    //作成ボタンを機能停止に切り替える
    document.getElementById("diary_comeinput_send").disabled = true;
    document.getElementById("diary_comeinput_send").style.color = "#777777";
    var commentCreating = {
        commentText: tod_comment,
        userIcon: global_user.photoURL,
        userId: global_user.uid,
        userName: global_user.displayName,
        createdAt: new firebase.firestore.Timestamp.now()
    }
    db.collection("users").doc(global_diary[diary_id_batton].userId).collection("diaries").doc(diary_id_batton).collection("comments").add(
        commentCreating
    ).then(function(docRef) {
        //この辺でglobal変数に代入する処理でいいかな
        console.log("Document written with ID: ", docRef.id);
        
        //global変数にも代入して表示を変えます
        insert_comment(commentCreating, docRef.id, diary_id_batton);
        //ここで見た目をいじります
        document.getElementById("diary_comment_thread_placeholder").style.display = "none";
        document.getElementById("diary_comment_thread_nocomment").style.display = "none";
        document.getElementById("diary_comment_thread_commentarea").style.display = "flex";
    }).catch(function(error){
        console.log("error", error);
    });
}



function jusert_diary_comment(diary_id){
    //console.log(Object.keys(global_diary_comment[diary_id]).length);
    if(Object.keys(global_diary_comment[diary_id]).length == 0){
        //global変数のcommentもからなので、
        document.getElementById("diary_comment_thread_placeholder").style.display = "none";
        document.getElementById("diary_comment_thread_commentarea").style.display = "none";
        document.getElementById("diary_comment_thread_nocomment").style.display = "block";
    }else{
        //global_diary_commentは入ってるので
        /*
        global_diary_comment[diary_id].forEach(function(comment){
            insert_comment(comment, comment.id, diaryId);
        });
        */
        //なんか今のままだと、挿入の順番が古いのが上に来ちゃうよーいよい→まいっかreverse()でforの中の条件文書き換えたけど変わんなかったよん
        for (let key in global_diary_comment[diary_id]) {
            //console.log('key:' + key + ' value:' + global_diary_comment[diary_id][key]);
            insert_comment(global_diary_comment[diary_id][key], key, diary_id);
        }
        document.getElementById("diary_comment_thread_placeholder").style.display = "none";
        document.getElementById("diary_comment_thread_nocomment").style.display = "none";
        document.getElementById("diary_comment_thread_commentarea").style.display = "flex";
    }
}

/*
function diary_good(good){
    console.log(good.parentNode.parentNode.id);
}
*/

//20210210経験値からコピーして持ってきた。それを書き換える形にしようと考えている
function diary_good(good){
    var diary_id = good.parentNode.parentNode.id;
    //_で区切って分割する workcard userId jobId workId
    //var what_user_job_work = id_card.split('_');
    //userがいいねしてるかどうか確認する
    var number = 0;
    if(already_good(diary_id)){
        //すでにグッドしてる グッドを取り消す
        number = -1;
        var type = "delete";
        good.classList.remove("active");
    }else{
        //まだグッドしてない グッドをつける
        number = 1;
        var type = "add";
        good.classList.add("active");
    }
    //とりあえず以下何もしない形でエラーの反応を見る
    //t=task
    var promise_t = db.collection('users').doc(global_diary[diary_id].userId).collection('tasks').doc(global_diary[diary_id].taskId).update({
        good: firebase.firestore.FieldValue.increment(number)
    }).catch(function(error){
        console.log("Error =>", error);
    });

    //d=diary
    var promise_d = db.collection("users").doc(global_diary[diary_id].userId).collection("diaries").doc(diary_id).update({
        countGood: firebase.firestore.FieldValue.increment(number)
    }).catch((e) => console.log(e));

    //非同期化の検証のためプロミスallを戻り値にしています
    var result = Promise.all([promise_t, promise_d]).then(function(values){
        console.log("promise =>", values);
        //global変数の中身を書き換える
        global_diary[diary_id]["countGood"] += number;
        //userのgoodも書き換える
        update_user_good(type, diary_id);
    }).catch(function(error){
        console.log("error", error);
    });
    return result;
}

//すでにグッドしたものかどうかの確認
function already_good(diary_id){
    for(var i=0; i< global_user_database.Good.length; i++){
        if(global_user_database.Good[i] == diary_id){
            //すでにグッドしている
            return true;
        }
    }
    return false;
}

//userのgoodeのカラムを書き換える
function update_user_good(type, diary_id){
    //global変数のほうを書き換える
    if(type == "add"){
        global_user_database.Good.push(diary_id);
    }else if(type == "delete"){
        /*spliceだと最後の一つになったときに挙動が怪しい
        for(var i=0; i<global_user_database.good.length; i++){
            if(global_user_database.good[i] == diary_id){
                global_user_database.good.splice(i, i);
            }
        }
        */
        global_user_database.Good = global_user_database.Good.filter(function( item ) {
            return item !== diary_id;
        });
    }
    //console.log( "update", type , diary_id, global_user_database.good );
    //firestore のデータベースを書き換える
    var change;
    if(type == "add"){
        change = firebase.firestore.FieldValue.arrayUnion(diary_id);
    }else if(type == "delete"){
        change = firebase.firestore.FieldValue.arrayRemove(diary_id);
    }
    db.collection("users").doc(global_user.uid).update({
        Good: change
    }).then( function(){
        //good処理完了
        //console.log("good処理 ユーザ側完了");
        //20210210 ここでカードの中のグラフの高さを挙げる処理をする
        var good_height = document.getElementById(diary_id).getElementsByClassName("good_bar")[0].clientHeight;
        if(type == "add"){
            document.getElementById(diary_id).getElementsByClassName("good_bar")[0].style.height = String(good_height + 5) + "px";
        }else if(type == "delete"){
            document.getElementById(diary_id).getElementsByClassName("good_bar")[0].style.height = String(good_height - 5) + "px";
        }
    }).catch(function(error){
        console.log("error => ", error)
    });
}


//const dialog = new MDCDialog(document.querySelector('.mdc-dialog'));
//var gift_dialog = new mdc.dialog.MDCDialog(document.querySelector('#gift_dialog'));
//gift_dialog.scrimClickAction = "";

//var giftalreadydialog = new mdc.dialog.MDCDialog(document.querySelector('#gift_already_dialog'));
//giftalreadydialog.scrimClickAction = "";

//送信するギフトのための変数
//var PostGiftId;
//var PostUserId;
/*
function diary_gift(gift){
    var diary_id = gift.parentNode.parentNode.id;
    PostGiftId = diary_id;
    PostUserId = global_diary[diary_id].userId;
    //console.log(PostGiftId , PostUserId);
    //Giftを既に送っていたら表面上はとりあえず贈れないようにする
    //セキュリティなどの観点では不確定なのでとりあえずといった感じ
    if(already_gift(diary_id)){
        //console.log("ここ");
        giftalreadydialog.open();
    }else{
        gift_dialog.open();
    }
}
*/

/*function gift_stripe(){
    この関数はstripe の checkout を利用することで必要ない感じになったはずです
}*/

//すでにグッド(Giftの間違いだろ)したものかどうかの確認
/*
function already_gift(diary_id){
    for(var i=0; i< global_user_database.Gift.length; i++){
        if(global_user_database.Gift[i] == diary_id){
            //すでにグッドしている
            return true;
        }
    }
    return false;
}
*/


