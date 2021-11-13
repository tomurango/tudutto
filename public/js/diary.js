var global_diary = {};
var global_diary_comment = {};

//3日以内のnagareについて扱うためのタイムスタンプ 3日としているのは記憶のイメージに追加づけるため、記録したいなら課金してほすぃ
//20210321それぞれの日の0時0分からとってくるように変えます
var today0 = new Date(new Date().setHours(0, 0, 0, 0));
//var three_date_ago_trend = new Date();
//three_date_ago_trend.setDate(three_date_ago_trend.getDate() - 3);
var diary_timestamp = firebase.firestore.Timestamp.fromDate(today0);

function get_diary(){
    //とりあえず、見た目の動きをそれっぽくする
    /* 
    setTimeout(function(){
        document.getElementById("talk_page_placeholder").style.display = "none";
        document.getElementById("talk_page_noresult").style.display = "block";
    },1000);
    */
    //id重複の恐れがあるので、そこを一つ警戒及び把握をしておく
    db.collectionGroup("diaries").where('createdAt', '>' , diary_timestamp).orderBy("createdAt", "desc").limit(10).get().then(function(threads){
        //timestampの書き換え
        diary_timestamp = new firebase.firestore.Timestamp.now();
        //広告の表示
        document.getElementById("adv_talk").style.display = "block";
        if(threads.size == 0){
            //連想配列の長さ取得サンプル
            if(Object.keys(global_diary).length == 0){
                //global変数のdiaryもからなので、
                document.getElementById("have_hitokoto").style.display = "none";
                document.getElementById("talk_page_placeholder").style.display = "none";
                document.getElementById("talk_page_noresult").style.display = "block";
                document.getElementById("talk_page_timeover").style.display = "none";
            }else{
                //global_diaryは入ってるので
                document.getElementById("talk_page_placeholder").style.display = "none";
                document.getElementById("talk_page_noresult").style.display = "none";
                document.getElementById("have_hitokoto").style.display = "flex";
                document.getElementById("talk_page_timeover").style.display = "none";
            }
        }else{
            //threadsはreverseしないと時間順で挿入されて行かないっぽい
            var threads_reverse = threads.docs.reverse();
            threads_reverse.forEach(function(thread){
                insert_diary(thread.data(), thread.id);
            });
            document.getElementById("talk_page_placeholder").style.display = "none";
            document.getElementById("have_hitokoto").style.display = "flex";
            //なぜか追加されてなかったので、非表示を追加
            document.getElementById("talk_page_timeover").style.display = "none";
            document.getElementById("talk_page_noresult").style.display = "none";
        }
    }).catch(function(error){
        console.log("error =>", error);
        //取得できなかった出力
        setTimeout(function(){
            document.getElementById("talk_page_placeholder").style.display = "none";
            document.getElementById("talk_page_noresult").style.display = "block";
            document.getElementById("talk_page_timeover").style.display = "none";
            document.getElementById("have_hitokoto").style.display = "none";
        },1000);
    });
}

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
    if(tutorial_flag){
        document.getElementById("mission_three").style.display = "none";
    }
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
            insert_diary(new_diary, docRef.id)
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

function insert_diary(diary_doc_data, diary_id){
    //とりあえずglobal変数作って格納しておく
    global_diary[diary_id] = diary_doc_data;
    //console.log(diary_doc_data, diary_id);
    //20210212 既にgoodやギフトをしていたらボタンの色を塗り替える
    if(already_good(diary_id)){
        var goodclass = "active";
    }else{
        var goodclass = "";
    }
    //Goodの高さの処理
    if(diary_doc_data.countGood){
        //console.log("カウントあり");
        var goodheight = diary_doc_data.countGood * 5;
        //console.log(goodheight , typeof goodheight);
    }else{
        //console.log("undefined でカウントなし");
        var goodheight = 0;
    }

    //20210220 Giftの支払いテストがいい感じだから実装
    /*
    if(already_gift(diary_id)){
        console.log("これどう？");
        var giftclass = "active";
    }else{
        var giftclass = "";
    }
    Goodの高さの処理
    if(diary_doc_data.countGift){
        console.log("カウントあり");
        var giftheight = diary_doc_data.countGift * 5;
        console.log(goodheight , typeof goodheight);
    }else{
        console.log("undefined でカウントなし");
        var giftheight = 0;
    }
    */

    //textContent挿入の儀式を執り行う  
    //20210204 graph_areaの追加
    //var graph_area = '<div class="graph_area"><div class="gift_bar" style="height:' + giftheight + 'px"></div><div class="good_bar" style="height:' + goodheight + 'px"></div></div>'
    //20210321giftを取り除いた
    var graph_area = '<div class="graph_area"><div class="good_bar" style="height:' + goodheight + 'px"></div></div>';
    var footer_area = '<div class="footer_area"><button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon diary_good ' +goodclass+ '" style="top:6px" onclick="diary_good(this)" title="Good">thumb_up</button></div>'
    //20210204 footerareaの追加
    //var footer_area = '<div class="footer_area"><button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon diary_gift ' + giftclass + '" onclick="diary_gift(this)" style="top: 6px;" title="Cheer">card_giftcard</button><button class="material-icons mdc-icon-button mdc-card__action mdc-card__action--icon diary_good ' +goodclass+ '" style="top:6px" onclick="diary_good(this)" title="Good">thumb_up</button></div>'
    //20210202 onclick="detail_of_diary(this)" 今のところは左の記述を消してコメントをできなくしときました。コメントの可能性を残して変な気を使わせないためです（まだスタンプとかのがまし）
    var content = '<div id="'+ diary_id +'" class="mdc-card diary-card"><div class="header_erea"><img class="who_icon" src="'+ diary_doc_data.userIcon +'"  onerror="error_image(this)"><p class="whos_diary"></p><p class="what_time"></p></div><div class="content_erea"><p class="content_diary"></p></div>' + graph_area + footer_area + '</div>';
    var promise = new Promise((resolve, reject) => {
        /*setTimeout(() => { 
            console.log('hello');
            resolve();
        }, 500);*/
        //ここでhtmlの骨格をisertadgestment
        document.getElementById("thread_container").insertAdjacentHTML("afterbegin", content);
        resolve();
    });
    var queryid = "#" + diary_id; 
    var time_text = getDate_diary(diary_doc_data.createdAt.toDate());
    promise.then(function(){
        //ここでtextContentいれる
        $(queryid).find(".whos_diary").text(diary_doc_data.userName);
        $(queryid).find(".content_diary").text(diary_doc_data.conTent);
        $(queryid).find(".what_time").text(time_text);
        //20210409diary入ったら表示を切り替えたいのでその記述 createdairy の中に入れてもいいかもね
        document.getElementById("talk_page_placeholder").style.display = "none";
        document.getElementById("talk_page_noresult").style.display = "none";
        document.getElementById("have_hitokoto").style.display = "flex";
        document.getElementById("talk_page_timeover").style.display = "none";
    });
    
}

//commentする用の変数
var diary_id_batton;
//diaryの詳細のdivを開く関数
//20210327コメントの実装今は無いからこれ使ってないよね現在（確認）
function detail_of_diary(diary_element){
    //console.log(diary_element.id);
    //中身を書き足す
    /*
    console.log(diary_element);
    console.log(diary_element.children);
    console.log(diary_element.children[0]);
    console.log(diary_element.children[1]);
    var content = diary_element;
    console.log(content.children.length);
    for (i = 0; i < content.children.length; i++) {
        console.log(i,content.children[i]);
    }
    */
    //真似て見やすくしようと思ったけど、結局わかりにくそうだからとりあえずやめといた
    //document.getElementById("diary_mimic").innerHTML = diary_element.innerHTML;
    //diary_content_mimic
    document.getElementById("diary_content_mimic").textContent = global_diary[diary_element.id].conTent;
    //開く
    document.getElementById("diary_detail_div").style.display = "block";
    //comment入力のinputに対してイベントを指定する
    var diary_input = $('#diary_comeinput_text');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    diary_input.on('input', function(event) {
        var value = diary_input.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("diary_comeinput_send").disabled = true;
            document.getElementById("diary_comeinput_send").style.color = "#777777";
        }else{
            //入力あったらいけ
            document.getElementById("diary_comeinput_send").disabled = false;
            document.getElementById("diary_comeinput_send").style.color = "#99cc33";
        }
    });
    //diaryに対するコメントを取得してから表示を切り替えるまでの処理を記述
    //一度取得しようとしてたら動かないようになってるはず
    if(global_diary_comment[diary_element.id] == undefined){
        //console.log("comment 取りに行きますねー");
        //ここでdiaryごとの連想配列を定義しておく
        global_diary_comment[diary_element.id] = {};
        get_diary_comment(diary_element.id);
        diary_id_batton = diary_element.id;
    }else{
        //こっちのバトンはコメントを作成するときに使うよねー
        diary_id_batton = diary_element.id;
        //console.log("このdiaryのコメントはもうすでに取りに行こうとしちゃったよねー");
        //二度目に開いたときにはglobalに入ってるとき（自分でコメントした時の動き）と二度目で結局何もしてない動きの時
        jusert_diary_comment(diary_element.id);
    }
}
//diaryの詳細のdivを閉じる関数
function detail_of_diary_back(){
    //中身をきれいにしておく
    document.getElementById("diary_content_mimic").innerHTML = "";
    //閉じる
    document.getElementById("diary_detail_div").style.display = "none";
    //このイベント投稿欄を閉じたときに停止させる
    var diary_input = $('#diary_comeinput_text');
    diary_input.off('input');
    //作成ボタンを機能停止に切り替える
    document.getElementById("diary_comeinput_send").disabled = true;
    document.getElementById("diary_comeinput_send").style.color = "#777777";
    //入力を消す
    document.getElementById("diary_comeinput_text").value ="";
    diary_id_batton = "";
    //commentのplaceholderを治しておく
    document.getElementById("diary_comment_thread_placeholder").style.display = "block";
    document.getElementById("diary_comment_thread_nocomment").style.display = "none";
    document.getElementById("diary_comment_thread_commentarea").style.display = "none";
    //insertしたコメントを消す
    document.getElementById("diary_comment_thread_commentarea").innerHTML = "";
    //contentの中身も消しておく
    document.getElementById("diary_content_mimic").innerHTML = "";
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


//取得の重複等改良は必要である → ひとまず、一度取得しようとしたら二度目は取得しない処理にしますね、実装早いんでたぶん
function get_diary_comment(diaryId){
    var createrId = global_diary[diaryId].userId;
    db.collection("users").doc(createrId).collection("diaries").doc(diaryId).collection("comments").limit(10).get().then(function(docs){
        if(docs.size == 0){
            /*
            if(Object.keys(global_diary).length == 0){
                //global変数のdiaryもからなので、
                document.getElementById("thread_container").style.display = "none";
                document.getElementById("talk_page_placeholder").style.display = "none";
                document.getElementById("talk_page_noresult").style.display = "block";
            }else{
                document.getElementById("talk_page_placeholder").style.display = "none";
                document.getElementById("thread_container").style.display = "flex";
            }
            */
            //取得がゼロなので、nocommentimageを出力して完了する
            //global_diary_comment[diaryId] = {};
            document.getElementById("diary_comment_thread_placeholder").style.display = "none";
            document.getElementById("diary_comment_thread_commentarea").style.display = "none";
            document.getElementById("diary_comment_thread_nocomment").style.display = "block";
        }else{
            /*
            //threadsはreverseしないと時間順で挿入されて行かないっぽい
            var threads_reverse = threads.docs.reverse();
            threads_reverse.forEach(function(thread){
                insert_diary(thread.data(), thread.id);
            });
            document.getElementById("talk_page_placeholder").style.display = "none";
            document.getElementById("thread_container").style.display = "flex";
            */
            //取得がゼロなので、nocommentimageを出力して完了する
            docs.forEach(function(comment){
                insert_comment(comment.data(), comment.id, diaryId);
            });
            document.getElementById("diary_comment_thread_placeholder").style.display = "none";
            document.getElementById("diary_comment_thread_nocomment").style.display = "none";
            document.getElementById("diary_comment_thread_commentarea").style.display = "flex";
        }
    }).catch(function(error){
        console.log("error", error);
    });
}

function insert_comment(comment_data, comment_id, diary_id){
    //global変数に入れる動きで行きましょう
    //global_diary_comment[diary_id] = {};
    global_diary_comment[diary_id][comment_id] = comment_data;

    //次に表示に挿入していく感じかなー
    //var content = '<div id="'+ diary_id +'" class="mdc-card diary-card" onclick="detail_of_diary(this)"><div class="header_erea_comment"><img class="who_icon_comment" src="'+ diary_doc_data.userIcon +'"  onerror="error_image(this)"><p class="whos_diary_comment"></p><p class="what_time_comment"></p></div><div class="content_erea_comment"><p class="content_diary_comment"></p></div></div>';
    
    var content = '<div id="'+ comment_id + '" class="diary_card_comment"><div class="header_erea_comment"><img class="who_icon_comment" src="'+ comment_data.userIcon +'"  onerror="error_image(this)"><p class="whos_diary_comment"></p><p class="what_time_comment"></p></div><div class="content_erea_comment"><p class="content_diary_comment"></p></div></div>';
    var promise = new Promise((resolve, reject) => {
        //ここでhtmlの骨格をisertadgestment
        document.getElementById("diary_comment_thread_commentarea").insertAdjacentHTML("afterbegin", content);
        resolve();
    });
    var queryid = "#" + comment_id; 
    var time_text = getDate_diary(comment_data.createdAt.toDate());
    promise.then(function(){
        //ここでtextContentいれる
        //console.log(comment_data["commentText"]);
        //$(queryid).find(".thecomment").text(comment_data["commentText"]);
        /*$(queryid).find(".content_diary").text(diary_doc_data.conTent);
        $(queryid).find(".what_time").text(time_text);*/
        $(queryid).find(".whos_diary_comment").text(comment_data.userName);
        $(queryid).find(".content_diary_comment").text(comment_data.commentText);
        $(queryid).find(".what_time_comment").text(time_text);
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
    db.collection("users").doc(global_diary[diary_id].userId).collection("diaries").doc(diary_id).update({
        countGood: firebase.firestore.FieldValue.increment(number)
    }).then(function(){
        //global変数の中身を書き換える
        global_diary[diary_id]["countGood"] += number;
        //userのgoodも書き換える
        update_user_good(type, diary_id);
    }).catch(function(error){
        console.log("error", error);
    });
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


