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