function tag_anke(element){
    if(element.classList.contains("disactive")){
        if(element.id == "anke_look"){
            element.classList.toggle("active");
            element.classList.toggle("disactive");
            document.getElementById("anke_follow").classList.toggle("active");
            document.getElementById("anke_follow").classList.toggle("disactive");
            document.getElementById("listforanke").style.display = "flex";
            document.getElementById("divsforanke").style.display = "none";
        }else if(element.id == "anke_follow"){
            element.classList.toggle("active");
            element.classList.toggle("disactive");
            document.getElementById("anke_look").classList.toggle("active");
            document.getElementById("anke_look").classList.toggle("disactive");
            document.getElementById("divsforanke").style.display = "block";
            document.getElementById("listforanke").style.display = "none";
        }
    }else{
        //activeのボタンを押したので何もしないで関数を終了させる
        return ;
    }
}

function dis_cre_anke_div(){
    document.getElementById("dis_cre_anke_div").style.display="block";
    //textarea に対してイベントを指定する
    var $input = $('#anke_input_title');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    $input.on('input', function(event) {
        var value = $input.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("anke_create_button").disabled = true;
        }else{
            //入力あったらいけ
            document.getElementById("anke_create_button").disabled = false;
        }
    });
}

function dis_cre_anke_div_back(){
    document.getElementById("dis_cre_anke_div").style.display="none";
    //このイベント投稿欄を閉じたときに停止させる
    var $input = $('#anke_input_title');
    $input.off('input');
    //作成ボタンを機能停止に切り替える
    document.getElementById("anke_create_button").disabled = true;
    //入力を消す
    document.getElementById("anke_input_title").value = "";
    //選択肢の入力も消す
    document.getElementById("anke_choise_1").value ="";
    document.getElementById("anke_choise_2").value ="";
}

//投稿する
function anke_create(){
    var title = document.getElementById("anke_input_title").value;
    var choise1 = document.getElementById("anke_choise_1").value;
    var choise2 = document.getElementById("anke_choise_2").value;
    //console.log(choise1, choise2);
    if(choise1 == ""){
        //console.log("未入力");
        choise1 = "入力されていません";
    }
    if(choise2 == ""){
        //console.log("未入力");
        choise2 = "入力されていません";
    }
    //dialog に文字を挿入して表示する
    document.getElementById("anke_title_con").textContent = title;
    document.getElementById("anke_one_con").textContent = choise1;
    document.getElementById("anke_two_con").textContent = choise2;
    //入力確認を出力したのちに送信する流れ
    anke_alert_dia.open();
}

function send_anke(){
    //へっだーに入力内容に間違いはありませんか？のようなガイドも欲しいかな
    //入力ナシなら入力ナシと表示する
    var title = document.getElementById("anke_input_title").value;
    var choise1 = document.getElementById("anke_choise_1").value;
    var choise2 = document.getElementById("anke_choise_2").value;
    
    var new_anke = {
        title: title,
        choises: [choise1, choise2]
    };
    db.collection("questionnaire").add(new_anke)
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        //閉じる
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

//ダイアログで質問内容の確認表示
var anke_alert_dia = new mdc.dialog.MDCDialog(document.querySelector('#anke_alert_dia'));
