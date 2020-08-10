var global_count_statics = {}
var server_time_batton;//日付の切り替わりを避ける（エラーを回避するための変数)

function graph_check(){
    //その日付の情報を参照して、中身がundefinedなら取得して挿入する処理、それ以外は何もしない処理
    //まずは今日の日付を取得しようか
    server_time_batton =  new firebase.firestore.Timestamp.now();
    for (var i = 0; i < 4; i++) {
        //4日前までデータをとってくると想定しているため、4度のループを行う
        //console.log("現在" + (i+1) + "回目の処理です。");
        var js_date = server_time_batton.toDate();
        js_date.setDate(js_date.getDate() - i);
        var date_text = getDate(js_date);
        //console.log(date_text);
        //該当する日付のデータをとってきているかいないかを判別
        if(global_count_statics[date_text] == undefined){
            //取ってくる
            db.collection("counts").doc(date_text).get().then(function(the_count_doc){
                //console.log(the_count_doc.id,the_count_doc.data());
                //代入
                global_count_statics[the_count_doc.id] = the_count_doc.data();
                //全部の代入が終わったときに、表示を計算してまとめて整えたいがそれはあきらめて、別関数内で今日の日付との比較を実施することで対応をとることにした
                //console.log("i は", i);
                insert_to_graph(the_count_doc.id);
            }).catch(function(error){
                console.log("error => ", error);
            });
        }/*else{
            console.log(date_text + "の統計はもう持ってる");
            if(i == 3){
                insert_to_graph()
            }
        }*/
    }

}

//すべての日付分をまとめて入れたいから3日前の時だけまともな動き方をするように考えている
function insert_to_graph(a_day){
    //var today_text = getDate(server_time_batton);
    //今日
    var the_date = server_time_batton.toDate();
    //3日前
    the_date.setDate(the_date.getDate() - 3);
    //3日前のテキスト
    var three_ago_text = getDate(the_date);
    if(a_day == three_ago_text){
        //3日前の処理なら、代入するよー
        //console.log("insert_tograph 起動");
        var day_count = 0;
        //数値が小さい順に動いてるみたい
        for (let key in global_count_statics) {
            //('key:' + key + ' value:' + global_count_statics[key].count);
            if(day_count == 3){
                var dom_id = "today_count"; 
            }else if(day_count == 2){
                var dom_id = "yesterday_count";
            }else if(day_count == 1){
                var dom_id = "daybeforeyesterday_count";
            }else if(day_count == 0){
                var dom_id = "threedaysago_count";
            }
            var the_height = global_count_statics[key].count;
            document.getElementById(dom_id).style.height = String(the_height) + "%";
            day_count+=1;
        }
    }else{
        return
    }
}