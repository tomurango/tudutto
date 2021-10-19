//20210601広告を読み込んで表示する関数をここから組む感じで行こうか。久々の進捗だー！

//const { userInfo } = require("os");
//20210710上の記述が勝手に書き込まれていた

//20210603一度広告を読み込んだら、とりあえず自動での再読み込みはしないようにしようか
var adv_flag = [true, true, true];
//関数自体は、babで切替した時に一度だけ作動するイメージ
function insert_adv(index){
    //flagがtrueなら広告をそこに挿入
    if(adv_flag[index]==true){
        //console.log(index, "広告入れるよ");
        //条件分岐して挿入する広告を分岐させる未来をイメージしてる
        //とりあえず、こっちで用意した広告を入れることを前提にして考えてみる。
        insert_adv_use(index);
        //広告を入れたらフラグの更新を行い、再挿入を防ぐ
        //adv_flag[index]=false;
        //ユーザの広告が入ったらフラグを取り除くことにする
    }
}

function insert_adv_yar(index){
    //広告のページごとに分岐して、背景画像と文字色を変更するつもりでっす
    if(index==0){
        document.getElementById("adv_list").style.backgroundImage= "url(images/adv1.jpg)";
        document.getElementById("adv_list_link").style.color= "#fff2d3";
        document.getElementById('adv_list_link').setAttribute('href',"javascript:subscription_detail();");
    }else if(index==1){
        document.getElementById("adv_talk").style.backgroundImage= "url(images/adv2.jpg)";
        document.getElementById("adv_talk_link").style.color= "#fff2d3";
        document.getElementById('adv_talk_link').setAttribute('href',"javascript:subscription_detail();");
    }else if(index==2){
        document.getElementById("adv_data").style.backgroundImage= "url(images/adv3.jpg)";
        document.getElementById("adv_data_link").style.color= "#fff2d3";
        document.getElementById('adv_data_link').setAttribute('href',"javascript:subscription_detail();");
    }
}
//20210806課金ユーザの広告を入れるための関数
function insert_adv_use(index){
    //20210806とりあえずglobal変数を参照してindexに該当する広告が変数にない場合、ヤルキーパーのやつを挿入する
    if(global_adv_dis[index] == undefined){
        //該当広告がないので
        return insert_adv_yar(index);
    }else{
        //広告のページごとに分岐して、背景画像と文字色を変更するつもりでっす
        //以下の記述法はinsert_adv_othersの関数より引用
        adv_flag[index]=false;
        if(index==0){
            //console.log(index);
            //console.log(global_adv_dis[index]);
            //console.log(global_adv_dis[index].colorCode);
            //ここでtextContentいれる
            $("#adv_list_link").css('color',global_adv_dis[index].colorCode);
            $("#adv_list_link").attr("href", global_adv_dis[index].advUrl);
            $("#adv_list").css({
                backgroundImage: 'url("'+ global_adv_dis[index].imageUrl +'")' // "" で括っていないとIEでは表示されない
            });
        }else if(index==1){
            $("#adv_talk_link").css('color',global_adv_dis[index].colorCode);
            $("#adv_talk_link").attr("href", global_adv_dis[index].advUrl);
            $("#adv_talk").css({
                backgroundImage: 'url("'+ global_adv_dis[index].imageUrl +'")' // "" で括っていないとIEでは表示されない
            });
        }else if(index==2){
            $("#adv_data_link").css('color',global_adv_dis[index].colorCode);
            $("#adv_data_link").attr("href", global_adv_dis[index].advUrl);
            $("#adv_data").css({
                backgroundImage: 'url("'+ global_adv_dis[index].imageUrl +'")' // "" で括っていないとIEでは表示されない
            });
            //document.getElementById("adv_data").style.backgroundImage= "url(images/adv3.jpg)";
            //document.getElementById("adv_data_link").style.color= "#fff2d3";
            //document.getElementById('adv_data_link').setAttribute('href',"javascript:subscription_detail();");
        }
    }
}

//20210603今後の実装メモ。１メンバープランの人は広告を出せるようにする。２メンバープランの人は広告を管理できるようにする（自分の広告の編集、他人の広告への投票？報告？）。３ユーザの報告ができるようにする。
//20210603広告申請用のdivを実装しましょう→メンバープランの人が表示→実際に画像・リンク・色を送信して保存できるようにする。
//displaycard は完了 detail cardの実装を目指す。→onclickの実装
function adv_detail(){
    //画像入力のイベントの受付
    $('#adv_img_inp').on('change', function (e) {
        var adv_img_inp = document.getElementById("adv_img_inp").value.split('.');
        if(con_file_ext(adv_img_inp[adv_img_inp.length - 1].toLowerCase())){
            //入力されている処理
            //document.getElementById("adv_img_pre").innerHTML = '<img id="preview">';
            var reader = new FileReader();
            reader.onload = function (e) {
                //$("#preview").attr('src', e.target.result);
                //console.log(e.target.result,e.target);
                //20210730画像の読み込みが以下の記述で急になされなくなった。なんでだろう、なんでだろう、なでだなんでだろう
                //document.getElementById("adv_img_pre").style.backgroundImage = "url(" + e.target.result + ");";
                $('#adv_img_pre').css({
                    backgroundImage: 'url("'+ e.target.result +'")' // "" で括っていないとIEでは表示されない
                });
            }
            reader.readAsDataURL(e.target.files[0]);
        }else{
            //入力されていない処理
            //document.getElementById("adv_img_pre").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewbox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
            document.getElementById("adv_img_pre").style.backgroundImage = "url(images/insert_image.jpg)";
            alert("svg, png, jpg, gif のいずれかの形式でアップロードしてください");
        }
        //上の画像プレビュー判定と重複はあるが、可読性を考慮して独立した処理を設けておきます。
        if(cansubmit_adv()){
            //提出要件を満たしているのでボタンを有効化
            document.getElementById("adv_crea_button").disabled = false;
        }else{
            //不適当なので、ボタン無力化
            document.getElementById("adv_crea_button").disabled = true;
        }
        //入力があり、文字が存在するとき
        if(document.getElementById("adv_img_inp").value){
            //console.log("alert flag ok");
            del_ala_img = true;
        }else{
            //console.log("alert flag no color");
            del_ala_img = false;
        }
        
    });
    //リンク入力イベント
    $('#adv_lin_input').on('input', function (e) {
        //console.log(e.target.value);
        if(cansubmit_adv()){
            //提出要件を満たしているのでボタンを有効化
            document.getElementById("adv_crea_button").disabled = false;
        }else{
            //不適当なので、ボタン無力化
            document.getElementById("adv_crea_button").disabled = true;
        }
        //入力があり、文字が存在するとき
        if(document.getElementById("adv_lin_input").value){
            //console.log("alert flag ok");
            del_ala_lin = true;
        }else{
            //console.log("alert flag no color");
            del_ala_lin = false;
        }
    });
    //カラーコード入力イベント
    /*入力と変化のイベントを別にする必要はないと感じたので除外
    $('#adv_col_input').on('change', function (e) {
        if(cansubmit_adv()){
            //提出要件を満たしているのでボタンを有効化
            document.getElementById("adv_crea_button").disabled = false;
        }else{
            //不適当なので、ボタン無力化
            document.getElementById("adv_crea_button").disabled = true;
        }
    });
    */
    //カラーコードinputイベント
    $('#adv_col_input').on('input', function (e) {
        //console.log("color code", e.target.value);
        document.getElementById("adv_crea_link").style.color = e.target.value;
        if(cansubmit_adv()){
            //提出要件を満たしているのでボタンを有効化
            document.getElementById("adv_crea_button").disabled = false;
        }else{
            //不適当なので、ボタン無力化
            document.getElementById("adv_crea_button").disabled = true;
        }
        //入力があり、文字が存在するとき
        if(document.getElementById("adv_col_input").value){
            //console.log("alert flag ok");
            del_ala_col = true;
        }else{
            //console.log("alert flag no color");
            del_ala_col = false;
        }
    });
    //自分が申請した広告が存在するかどうかの判断。
    getmyadv();
    //div表示
    document.getElementById("div_for_adv").style.display = "block";
}


//20210730 削除しますがよろしいのアラートを管理するためのフラグ、60行付近の関数にて管理している
var del_ala_col = false;
var del_ala_lin = false;
var del_ala_img = false;
function adv_detail_back(){
    //if(is_inputed_adv()){
    //上の記述では、自分が以前申請したいた物も取得して、反応してしまうので改定。関数に関しても記述を取り除くことがより良いと考える。
    if(del_ala_col || del_ala_img || del_ala_lin){
        //入力があったら
        //dialogを開く
        adv_del_dia.open();
    }else{
        //入力がなければ
        //表示を閉じる
        document.getElementById("div_for_adv").style.display = "none";
        //入力イベント停止
        $('#adv_img_inp').off('change');
        $('#adv_lin_input').off('input');
        //$('#adv_col_input').off('change');
        $('#adv_col_input').off('input');
        //フラグの初期化
        del_ala_col = false;
        del_ala_lin = false;
        del_ala_img = false;
    }
}

//20210603previewとinputhidden等の実装をしましょう
//20210609ファイルの拡張子を確かめる関数を経験値から持ってきた
function con_file_ext(the_extention){
    var extentions = ["svg","svgz","gif","png","jpg","jpeg","jpe","jfif","pjpeg","pjp"];
    for(var i = 0; i < extentions.length; i++){
        if(the_extention == extentions[i]){
            return true;
        }
    }
    return false;
}
//20210609文字色のプレビュー反映、広告申請ボタンの実装、実際に申請を出した時のフローを考える
//ネットで拾ったURLパターンの判定関数
/*
function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
}
*/
function isValidHttpUrl(string) {
    let url;
  
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
}
//同じくコピペコード
function isColor (color) {
    return color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) !== null;
}

function cansubmit_adv(){
    var adv_lin_input = document.getElementById("adv_lin_input").value;
    if(isValidHttpUrl(adv_lin_input)){
        //入力していて、その値が、URLなのでOKです。
        var adv_img_inp = document.getElementById("adv_img_inp").value.split('.');
        if(con_file_ext(adv_img_inp[adv_img_inp.length - 1].toLowerCase())){
            //画像が入力されていて、適切な拡張子もついてまっす
            var adv_col_input = document.getElementById("adv_col_input").value;
            if(isColor(adv_col_input)){
                //色もしっかり入力されている
                return true;
            }else{
                return false;
            }
        }else{
            //画像の入力は不適当なので、ボタン無力化
            return false;
        }
    }else{
        //入力されていない若しくは、URLとして不適当である
        //ボタンを無力化する
        return false;
    }
}

//20210609広告申請のonclick dialog と実際の申請処理、作成divを閉じるときのalert dialog と削除処理。の実装をしましょう。
var adv_crea_dia = new mdc.dialog.MDCDialog(document.querySelector('#adv_crea_dia'));
adv_crea_dia.scrimClickAction = "";
var adv_del_dia = new mdc.dialog.MDCDialog(document.querySelector('#adv_del_dia'));
adv_del_dia.scrimClickAction = "";

function send_myadv(){
    //申請をここで送信することを想定しているよー
    console.log("広告を申請します");
}
function is_inputed_adv(){
    if(document.getElementById("adv_img_inp").value == ""){
        //画像はない
        if(document.getElementById("adv_lin_input").value == ""){
            //リンクはない
            if(document.getElementById("adv_col_input").value == "#000000"){
                //色もない(黒)
                return false;
            }else{
                return true;
            }
        }else{
            //リンクはある
            return true;
        }
    }else{
        //画像がある
        return true;
    }
    
}
function del_adv_inp(){
    //ボタンの無力化
    document.getElementById("adv_crea_button").disabled = true;
    //表示を閉じる
    document.getElementById("div_for_adv").style.display = "none";
    //入力イベント停止
    $('#adv_img_inp').off('change');
    $('#adv_lin_input').off('input');
    //$('#adv_col_input').off('change');
    $('#adv_col_input').off('input');
    //プレビューを戻す
    document.getElementById("adv_img_pre").style.backgroundImage = "url(images/insert_image.jpg)";
    //サンプルカラーを戻す
    document.getElementById("adv_crea_link").style.color = "#000000";
    //入力値を初期値に戻す
    document.getElementById("adv_img_inp").value = "";
    document.getElementById("adv_lin_input").value = "";
    document.getElementById("adv_col_input").value = "#000000";
    //フラグの初期化
    del_ala_col = false;
    del_ala_lin = false;
    del_ala_img = false;
}

//申請を記録して、課金ユーザが判断する構築を目指して、データベース、画像保存、権限などの想像をする
//20210707以後久しぶりにcloud storage を使用するのでhttps://firebase.google.com/codelabs/firebase-web#9を参考にすると良さそう。（要観察）
//下はコピペです
// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveAdv(){
    //フラグの初期化
    del_ala_col = false;
    del_ala_lin = false;
    del_ala_img = false;
    //申請ボタンと作成するボタンのdisactive
    document.getElementById("adv_crea_button").disabled = true;
    document.getElementById("to_adv_detail").disabled = true;
    //広告のdetailを閉じる
    document.getElementById("div_for_adv").style.display = "none";
    //入力イベント停止
    $('#adv_img_inp').off('change');
    $('#adv_lin_input').off('input');
    //$('#adv_col_input').off('change');
    $('#adv_col_input').off('input');
    //経験値からコピペ加工
    var file = document.getElementById("adv_img_inp").files[0];
    var colorcode = document.getElementById("adv_col_input").value;
    var advlink = document.getElementById("adv_lin_input").value;
    //読み込み中画像
    var LOADING_IMAGE_URL = "";
    // 1 - We add a message with a loading icon that will get updated with the shared image.
    db.collection('advs').doc(global_user.uid).set({
        name: global_user.displayName,
        imageUrl: LOADING_IMAGE_URL,
        //profilePicUrl: getProfilePicUrl(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        colorCode: colorcode,
        advUrl: advlink,
        goodList:[],
        badList:[],
        //uid: global_user.uid//queryのためにfield追加 と思っていたが二度目以降は取得しない形なのでひとまず除外
        votePoint: 0 //取ってくる投票を選定するために追加20210806
    }).then(function() {
        //console.log("advRef1", advRef);
        //ここでメッセージを出す
        snackbar.open();
        // 2 - Upload the image to Cloud Storage.
        //var filePath = firebase.auth().currentUser.uid + '/' + advRef.id + '/' + file.name;
        //var filePath = firebase.auth().currentUser.uid + '/' +  file.name;
        var filePath = 'advs/' + firebase.auth().currentUser.uid;
        return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
            // 3 - Generate a public URL for the file.
            //console.log("advRef2", advRef);
            return fileSnapshot.ref.getDownloadURL().then((url) => {
                //console.log("advRef3", advRef);
                // 4 - Update the chat message placeholder with the image's URL.
                // addではなく、set なのでパスを手動で指定する return advRef.update({
                return db.collection('advs').doc(global_user.uid).update({
                    imageUrl: url,
                    storageUri: fileSnapshot.metadata.fullPath
                }).then(function(){
                    //ボタンや入力のあたいを元に戻す処理をする（後にユーザの広告がデフォで入るなら、変更あり）
                    //プレビューを戻す
                    document.getElementById("adv_img_pre").style.backgroundImage = "url(images/insert_image.jpg)";
                    //サンプルカラーを戻す
                    document.getElementById("adv_crea_link").style.color = "#000000";
                    //入力値を初期値に戻す
                    document.getElementById("adv_img_inp").value = "";
                    document.getElementById("adv_lin_input").value = "";
                    document.getElementById("adv_col_input").value = "#000000";
                    //ボタン戻し                
                    document.getElementById("to_adv_detail").disabled = false;
                });
            });
        });
    }).catch(function(error) {
        console.error('There was an error uploading a file to Cloud Storage:', error);
    });
}

const snackbar = new mdc.snackbar.MDCSnackbar(document.querySelector('.mdc-snackbar'));


//広告作成のボタンを押したときに自分のデータを取ってきてあるなら、それを代入する処理を行う。

function getmyadv(){
    db.collection("advs").doc(global_user.uid).get().then(function(result_doc){
        //console.log(result_doc.data());
        insertmyadv(result_doc.data());
    }).catch(function(error){
        console.log("error", error);
    });
}

function insertmyadv(data){
    //console.log(data, data.colorCode);
    //文字色
    document.getElementById("adv_col_input").value = data.colorCode;
    document.getElementById("adv_crea_link").style.color = data.colorCode;
    //リンク
    document.getElementById("adv_lin_input").value = data.advUrl;
    //画像
    //var urlstyle = 'url(' + data.imageUrl + ');';
    //console.log(urlstyle, typeof data.imageUrl);
    //document.getElementById("div_for_adv").style.backgroundImage = urlstyle;
    //document.getElementById("div_for_adv").style.backgroundImage = "url(" + data.imageUrl + ");";
    //document.getElementById("adv_img_pre").style.backgroundImage = "url(images/insert_image.jpg)";
    //document.getElementById("div_for_adv").style.backgroundImage = "url(https://firebasestorage.googleapis.com/v0/b/levup-5017a.appspot.com/o/advs%2F8uH1wWLpXsgOiVWrfLNDBvAd27E2?alt=media&token=9ff7495e-3d8d-479f-a526-7929babb8ca6)";
    $('#adv_img_pre').css({
        backgroundImage: 'url("'+ data.imageUrl +'")' // "" で括っていないとIEでは表示されない
    });
}

//一覧投票するを表示する関数
function adv_others(){
    get_adv_others();
    document.getElementById("div_for_othersadv").style.display = "block";
}

function adv_others_back(){
    document.getElementById("div_for_othersadv").style.display = "none";
}

//2度目以降は今よりあとのやつを取得したい（重複を避けるため）
var adv_others_flag = true;
//var adv_others_time;
function get_adv_others(){
    //.where(firebase.firestore.FieldPath.documentId(), "in", listOfReferences)
    //db.collection('books').where('__name__', '==' ,'fK3ddutEpD2qQqRMXNW5').get().
    var uid = global_user.uid;
    //console.log(typeof uid);
    //db.collection("advs").where(firebase.firestore.FieldPath.documentId(), "not-in", uid)
    if(adv_others_flag){
        //flagの挿入とタイムスタンプの定義をここで行いたい感じ。
        adv_others_flag = false;
        //adv_others_time = new firebase.firestore.Timestamp.now();
        db.collection("advs").where('__name__', '!=' , uid).get()
        .then((querySnapshot) => {
            //global変数二も入れ込む感じで

            //挿入
            get_after_otheadv(querySnapshot);
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }else{
        //二度目以降なのでtimestampにしたがって取得してもらう。
        //.orderBy('createdAt', 'asc').startAt(startDate).endAt(endDate).
        //と思っていたが、難しいからパス。2回目以降は取得しないくする
        /*
        db.collection("advs").orderBy('timestamp', 'asc').startAt(adv_others_time).endAt(new firebase.firestore.Timestamp.now()).where("uid", "!=", global_user.uid).get()
        //.then(get_after_otheadv(querySnapshot))
        .then((querySnapshot) => {
            adv_others_time = new firebase.firestore.Timestamp.now();
            get_after_otheadv(querySnapshot)
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
        */
       return
    }
}

function get_after_otheadv(querySnapshot){
    if(querySnapshot.size > 0){
        //一つ以上あるので挿入
        querySnapshot.forEach((doc) => {
            insert_other_adv(doc.id, doc.data())
            //console.log(doc.id, ' => ', doc.data());
        });
        document.getElementById("otheradv_lis").style.display = "block";
        document.getElementById("otheradv_non").style.display = "none";
        document.getElementById("otheradv_pla").style.display = "none";
    }else{
        //一つもないので
        document.getElementById("otheradv_lis").style.display = "none";
        document.getElementById("otheradv_non").style.display = "block";
        document.getElementById("otheradv_pla").style.display = "none";
    }
}

var global_adv_other = {};
function insert_other_adv(id, data){
    //global変数に代入
    global_adv_other[id] = data;
    //console.log(id,data);
    //原型を作ってそれをコピーしていく
    //insert_taskをコピーしてそれを書き換える形で実装目指す
    var vote_div = '<div id="' + id + '_advcard" class="mdc-card vote_card"><a id="' + id + '_advlink" class="adv_link"><p style="margin: 0px;"><span class="material-icons adv_icon">open_in_new</span>広告を開く</p></a><div class="vote_madia"></div><div class="vote_footer"><button class="material-icons mdc-icon-button vote_button good" onclick="adv_ok(this)">thumb_up</button><button class="material-icons mdc-icon-button vote_button bad" onclick="adv_no(this)">thumb_down</button></div></div>';
    var votes_container = document.getElementById("otheradv_lis");
    var vote_promise = new Promise(function(resolve, reject){
        votes_container.insertAdjacentHTML("afterbegin", vote_div);
        resolve();
    });
    var queryid = "#" + id + "_advcard"; 
    vote_promise.then(function(){
        //ここでtextContentいれる
        $(queryid).find(".adv_link").css('color',data.colorCode);
        $(queryid).find(".adv_link").attr("href", data.advUrl);
        $(queryid).find(".vote_madia").css({
            backgroundImage: 'url("'+ data.imageUrl +'")' // "" で括っていないとIEでは表示されない
        });
        //過去にボタンを押したかどうかで処理を追加で書いていこう
        if(data.goodList.includes(global_user.uid)){
            //goodListにある
            $(queryid).find(".good").addClass("active");
        }else if(data.badList.includes(global_user.uid)){
            //badList
            $(queryid).find(".bad").addClass("active");
        }
    });
}

function adv_ok(good_element){
    //表示の切替等
    var adv_id = good_element.parentNode.parentNode.id.split('_')[0];
    //console.log("adv ok !", adv_id);
    bad_element = good_element.nextSibling;
    good_element.classList.toggle("active");
    bad_element.classList.remove("active");
    //toggle_goodbad(good_element);
    //toggle_goodbad(bad_element);
    //でーたべすの書き換え
    if(global_adv_other[adv_id]["goodList"].includes(global_user.uid)){
        //goodlistに記述があるとき
        db.collection("advs").doc(adv_id).update({
            goodList: firebase.firestore.FieldValue.arrayRemove(global_user.uid),
            votePoint: firebase.firestore.FieldValue.increment(-1)
        }).then(function(){
            //申請を受け付けたの表示をする と思ったけどいちいちうざいので取り除く 
            //と思ったけどやっぱとりあえず入れとく
            snackbar.open();
        }).catch(function(error){
            console.log("error", error);
        });
    }else{
        //goodlistに記述がない時
        db.collection("advs").doc(adv_id).update({
            goodList: firebase.firestore.FieldValue.arrayUnion(global_user.uid),
            badList: firebase.firestore.FieldValue.arrayRemove(global_user.uid),
            votePoint: firebase.firestore.FieldValue.increment(1)
        }).then(function(){
            //申請を受け付けたの表示をする
            snackbar.open();
        }).catch(function(error){
            console.log("error", error);
        });
    }
}

function adv_no(bad_element){
    good_element = bad_element.previousSibling;
    //console.log("adv no !");
    good_element.classList.remove("active");
    bad_element.classList.toggle("active");
    //toggle_goodbad(good_element);
    //toggle_goodbad(bad_element);
    //表示の切替等
    var adv_id = bad_element.parentNode.parentNode.id.split('_')[0];
    //でーたべすの書き換え
    if(global_adv_other[adv_id]["badList"].includes(global_user.uid)){
        //badlistに記述がある時
        db.collection("advs").doc(adv_id).update({
            badList: firebase.firestore.FieldValue.arrayRemove(global_user.uid),
            votePoint: firebase.firestore.FieldValue.increment(1)
        }).then(function(){
            //申請を受け付けたの表示をする
            snackbar.open();
        }).catch(function(error){
            console.log("error", error);
        });
    }else{
        //badlistに記述がない時
        db.collection("advs").doc(adv_id).update({
            badList: firebase.firestore.FieldValue.arrayUnion(global_user.uid),
            goodList: firebase.firestore.FieldValue.arrayRemove(global_user.uid),
            votePoint: firebase.firestore.FieldValue.increment(-1)
        }).then(function(){
            //申請を受け付けたの表示をする
            snackbar.open();
        }).catch(function(error){
            console.log("error", error);
        });
        //badlistに記述がある時
    }
}

/*
function toggle_goodbad(element){
    if(element.classList.contains("active")){
        element.classList.remove("active");
    }else{
        element.classList.add("active");
    }
}
*/

//20210806投票でgoodの多い広告のみ取ってきて、表示するなどの条件を設けたいが
//実装可能だろうか？私たちは真実を知るためにジャングルの奥地へと向かった
//一度取得だけしてglobal変数に入れ込んだのちにそれぞれを必要なとき広告に入れるようにした
//なぜなら、そのようにサンプルの広告を入れるように実装してしまっているから
var global_adv_dis = [];
function advsforDisplay(){
    db.collection("advs").where('votePoint', '>' , 0).limit(3).get()
    .then((querySnapshot) => {
        //広告は3つでひとまず桶にする20210806
        //querySnapshot.forEach(function(adv){
        //    console.log("adv",adv);
        //});
        //for (let i = 0; i < 3; i++) {
            // 値が 0 から 2 まで計 3 回実行される
            //console.log("adv",i,querySnapshot);
        //}
        querySnapshot.forEach(function(adv){
            global_adv_dis.push(adv.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
}

