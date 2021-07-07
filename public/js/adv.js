//20210601広告を読み込んで表示する関数をここから組む感じで行こうか。久々の進捗だー！
//20210603一度広告を読み込んだら、とりあえず自動での再読み込みはしないようにしようか
var adv_flag = [true, true, true];
//関数自体は、babで切替した時に一度だけ作動するイメージ
function insert_adv(index){
    //flagがtrueなら広告をそこに挿入
    if(adv_flag[index]==true){
        //console.log(index, "広告入れるよ");
        //条件分岐して挿入する広告を分岐させる未来をイメージしてる
        //とりあえず、こっちで用意した広告を入れることを前提にして考えてみる。
        insert_adv_yar(index);
        //広告を入れたらフラグの更新を行い、再挿入を防ぐ
        adv_flag[index]=false;
    }
}

function insert_adv_yar(index){
    //広告のページごとに分岐して、背景画像と文字色を変更するつもりでっす
    if(index==0){
        document.getElementById("adv_list").style.backgroundImage= "url(images/adv/adv1.jpg)";
        document.getElementById("adv_list_link").style.color= "#fff2d3";
        document.getElementById('adv_list_link').setAttribute('href',"javascript:subscription_detail();");
    }else if(index==1){
        document.getElementById("adv_talk").style.backgroundImage= "url(images/adv/adv2.jpg)";
        document.getElementById("adv_talk_link").style.color= "#fff2d3";
        document.getElementById('adv_talk_link').setAttribute('href',"javascript:subscription_detail();");
    }else if(index==2){
        document.getElementById("adv_data").style.backgroundImage= "url(images/adv/adv3.jpg)";
        document.getElementById("adv_data_link").style.color= "#fff2d3";
        document.getElementById('adv_data_link').setAttribute('href',"javascript:subscription_detail();");
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
                document.getElementById("adv_img_pre").style.backgroundImage = "url(" + e.target.result + ")";;
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
    });
    //リンク入力イベント
    $('#adv_lin_input').on('input', function (e) {
        console.log(e.target.value);
        if(cansubmit_adv()){
            //提出要件を満たしているのでボタンを有効化
            document.getElementById("adv_crea_button").disabled = false;
        }else{
            //不適当なので、ボタン無力化
            document.getElementById("adv_crea_button").disabled = true;
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
        console.log("color code", e.target.value);
        document.getElementById("adv_crea_link").style.color = e.target.value;
        if(cansubmit_adv()){
            //提出要件を満たしているのでボタンを有効化
            document.getElementById("adv_crea_button").disabled = false;
        }else{
            //不適当なので、ボタン無力化
            document.getElementById("adv_crea_button").disabled = true;
        }
    });
    //div表示
    document.getElementById("div_for_adv").style.display = "block";
}
function adv_detail_back(){
    if(is_inputed_adv()){
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
}

//申請を記録して、課金ユーザが判断する構築を目指して、データベース、画像保存、権限などの想像をする
