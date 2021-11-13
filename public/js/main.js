//const { result } = require("lodash");//これ自動で挿入されるの何？

var global_user;
var global_user_database;
var global_tasks = {};
var global_threads = {};
const db = firebase.firestore();
var global_timestamps = {};//要削除？
var global_comments = {};//要削除？
//var comment_listeners_global = {};
var global_now_board;//要削除？
var global_now_thread;//要削除？
//20210707広告画像保存のために作成
const storage = firebase.storage();
//20211003自宅wifi環境でのスマホを使用した時の読み込みが長い点に関する読み込み対策
firebase.firestore().settings({ experimentalForceLongPolling: true });

/* tab navigation */
var tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('#bottom_app_bar'));
//tab ページ切り替え
tabBar.listen('MDCTabBar:activated',function(event){
    var index = event["detail"]["index"];
    //console.log("index => ", index);
    //一回全部を非表示にする
    var top_level_pages = document.getElementsByClassName('top_level_page');
    for (var i=0, len=top_level_pages.length|0; i<len; i=i+1|0) {
        top_level_pages[i].style.display = "none";
    }
    //広告を読みこんでindexに該当する箇所に挿入する
    //insert_adv(index);
    //indexによって処理を分岐して記述する
    if(index==0){
        document.getElementById("list_page").style.display = "flex";
        //list_page_check は繰り返し発生することを想定していません
    }else if(index==1){
        //20210812 7:00 からと 19:00 からの一時間の範囲外なら、表示できないようにする
        var now_fire = new firebase.firestore.Timestamp.now();
        var now_date = now_fire.toDate();
        var now_hour = now_date.getHours();
        //console.log(now_hour);
        document.getElementById("talk_page").style.display = "flex";
        if(check_talk_time(now_hour)){
            //20200815 復活
            talk_page_check();
            count_page_check();//countを日記のカウントに変更して再利用する
        }else{//20210812追加
            //時間外なので、
            //console.log("koti")
            document.getElementById("talk_page_placeholder").style.display = "none";
            document.getElementById("talk_page_noresult").style.display = "none";
            document.getElementById("have_hitokoto").style.display = "none";
            document.getElementById("talk_page_timeover").style.display = "block";
            //広告の表示
            //20211113広告の形態を変えようというかシステムの全体の形もある程度変更したいので、
            //document.getElementById("adv_talk").style.display = "block";
        }
    }else if(index==2){
        //あとでデータのページを表示するための場所に切り替わるかな？
        //console.log("data_page_?");
        //切り替わりましたよ
        document.getElementById("data_page").style.display = "flex";
        data_page_check();
    }
    /*
    else if(index==1){
        //20210118 削除
        document.getElementById("count_page").style.display = "flex";
        count_page_check();
    }
    */
});

function login_card_display(){
    //ログインのためのカードを出してくる
    document.getElementById("login_card_div").style.display = "block";
}
function login_card_display_back(){
    //ログインのためのカードを消す
    document.getElementById("login_card_div").style.display = "none";
}

//google
function google_click(){
    //ログインの動き
    //console.log("google ログインします");
    //セッションの永続性を指定から、ログインしてる感じ
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return firebase.auth().signInWithRedirect(provider).then(user =>{
            // Get the user's ID token as it is needed to exchange for a session cookie.
            return user.getIdToken();/*.then(idToken => {
                // Session login endpoint is queried and the session cookie is set.
                // CSRF protection should be taken into account.
                // ...
                const csrfToken = getCookie('csrfToken')
                return postIdTokenToSessionLogin('/sessionLogin', idToken, csrfToken);
            });*/
        });
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
}
//ログアウト
function log_out(){
    firebase.auth().signOut().then(()=>{
        //console.log("ログアウトしました");
        //ログアウトしよーぜ
        //リダイレクトしてんね
        location.reload();
    })
    .catch( (error)=>{
        console.log(`ログアウト時にエラーが発生しました (${error})`);
    });
}

$(document).ready(function(){
    //chart js のグラフが表示されない問題の解決のための検証
    //document.getElementById("chart_contain").textContent = window.devicePixelRatio;
    firebase.auth().getRedirectResult().then(function(result) {
        //console.log(result);
        if (result.credential) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // ...
        //console.log(token);
        }
        // The signed-in user info.
        global_user = result.user;
        //user 登録をする関数を書く 初めてのログインのみ登録を行う
        //user_register(result.user);
        //20210806一度だけの実行という考えを見込んでここで一度だけ広告を３つ取ってきてglobal変数に入れ込む処理
        advsforDisplay();
        if(global_user != null){
            //ログインしてる場合のみ行う。匿名ユーザである場合は問題が発生しそうではある
            //firestoreのユーザデータを取得
            //非ログイン後のログイン入力でこっちは機能するけど、永続性が効いてないと判断し、下を仮設
            fire_userdata_get(global_user.uid);
            //list page の表示を切り替える関数
            list_page_check(result.user);
        }else{
            //ログインしてないときはこっちの処理でログインしてるかどうかを試みる
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // User is signed in.
                    //console.log("user", user);
                    //イケるっぽいから書き足しちゃうね＾～
                    global_user = user;
                    fire_userdata_get(global_user.uid);
                    //list page の表示を切り替える関数
                    list_page_check(user);
                } else {
                    // No user is signed in.
                    //こうなったら特に操作は発生しない感じかなと思ってたけど共通部分を持ってきました
                    //list page の表示を切り替える関数
                    list_page_check(result.user);
                    //20210603ここでログインしていないと判断して、広告後のログインボタンの表示を行う
                    document.getElementById("notloggedin").style.display = "flex";
                }
              });
        }
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
    });
});


function fab_task(){
    //表示を出す
    document.getElementById("task_card_div").style.display = "block";
    //textarea に対してイベントを指定する
    var $input = $('#task_text_input');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    $input.on('input', function(event) {
        var value = $input.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("task_create_button").disabled = true;
        }else{
            //入力あったらいけ
            document.getElementById("task_create_button").disabled = false;
        }
    });
}

function fab_task_back(){
    //表示を消す
    document.getElementById("task_card_div").style.display = "none";
    //このイベント投稿欄を閉じたときに停止させる
    var $input = $('#task_text_input');
    $input.off('input');
    //作成ボタンを機能停止に切り替える
    document.getElementById("talk_create_button").disabled = true;
    //入力を消す
    document.getElementById("task_text_input").value = "";
    document.getElementById("task_memo_area").value ="";
}

//userの種類によってページの表示を切り替えるための関数
function list_page_check(user){
    //20210603list_pageのみ、check関数内で広告を実行する。理由としてタブの切り替えで実行されないから
    //insert_adv(0);
    if (user) {
        // User is signed in.
        //console.log("user => ", user);
        //ログインしてたらボタンの表示を差し替える
        document.getElementById("usericon").src = user.photoURL;
        //コメント投稿のページの分も挿入しておく
        //document.getElementById("diary_comeinput_icon").src = user.photoURL;
        document.getElementById("login_icon").style.display = "flex";
        document.getElementById("login_button").style.display = "none";
        //fab を表示する
        document.getElementById("list_page_fab").style.display = "flex";
        //データベースを探ってみる
        get_all_tasks(user);
        //login_and_check(user);


        /*db.collection("users").doc(user.uid).get().then(function(doc){
            if(false){
                //本日初のログインなら、taskを書き換える
                login_and_check(user);
            }else{
                //本日二度目以降なら取得して表示するのみ
                get_all_tasks(user);
            }
        })*/


    } else {
        //console.log("ログインしてない");
        //ログインしてないならログアウトボタンは消す
        document.getElementById("logout_button").style.display = "none";
        //ここで本来は匿名ユーザでログインさせたい
        //今はログインをさせる表示的誘導のみ行う
        document.getElementById("list_page_placeholder").style.display = "none";
        document.getElementById("task_complate").style.display = "none";
        document.getElementById("to_do_items").style.display = "none";
        document.getElementById("finished_container").style.display = "none";
        document.getElementById("create_task").style.display = "none";
        document.getElementById("list_page_anonymous").style.display = "block";
        //広告の表示を追加20210502→20211113取り除く
        //document.getElementById("adv_list").style.display = "block";
        //20210603広告をあえて非表示にしてから表示にしているのかは不明。ただ、list_pageのみこのようになっている
    }
}

function get_all_tasks(user){
    
    //console.log("get_all_task が呼び出された");
    //遅延対策でlimitを設ける
    db.collection("users").doc(user.uid).collection("tasks").limit(10).get().then(function(tasks){
        //console.log(tasks);
        //広告の表示を追加20210502
        //document.getElementById("adv_list").style.display = "block";
        if (tasks.size > 0) {
            //console.log("tasks =>", tasks);
            var task_remain = 0;
            tasks.forEach(function(task){
                //完了タスクとそうじゃないタスクに振り分ける
                insert_task(task.data(), task.id);
                if(task.data().finish == false){
                    task_remain += 1;
                }
            });
            if(task_remain == 0){
                //タスク完了してますよー(taskは存在している)
                document.getElementById("list_page_placeholder").style.display = "none";
                document.getElementById("to_do_items").style.display = "none";
                document.getElementById("list_page_anonymous").style.display = "none";
                document.getElementById("task_complate").style.display = "block";
                document.getElementById("create_task").style.display = "none";
            }else{
                //タスク残ってますよー
                document.getElementById("list_page_placeholder").style.display = "none";
                document.getElementById("list_page_anonymous").style.display = "none";
                document.getElementById("task_complate").style.display = "none";
                document.getElementById("to_do_items").style.display = "block";
                document.getElementById("create_task").style.display = "none";
            }
            finish_task_check();
        }else{
            //タスク完了してますよー(taskは存在していない)
            //タスクを作れの指令に変更しました
            document.getElementById("list_page_placeholder").style.display = "none";
            document.getElementById("to_do_items").style.display = "none";
            document.getElementById("list_page_anonymous").style.display = "none";
            document.getElementById("finished_container").style.display = "none";
            document.getElementById("task_complate").style.display = "none";
            document.getElementById("create_task").style.display = "block";
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}

function insert_task(task_data, task_id){
    
    //console.log("insert_task が呼び出された");
    global_tasks[task_id] = task_data;
    //console.log("task =>", task_data);
    if(task_data.finish){
        //check
        //buttonを押したときに詳細のダイアログを開かないようにするために、window.event.cancelBubble = true;をボタンのonclickに指定しましたよー
        /*var task_div ='<div id="' + task_id + '" style="width: 100%; display: flex" onclick="task_onclick(this)"><div style="padding: 8px; width: 64px; box-sizing: border-box;"><button class="mdc-icon-button material-icons" onclick="window.event.cancelBubble = true;task_check_back(this)">check</button></div><div style="width: calc(100% - 54px)"><p class="todo_first" style="margin:18px 10% 0px 0px">' + task_data.text + '</p><p class="todo_second" style="margin:0px 10% 0px 0px; font-size:0.8em; color:#666666">' + task_data.memo + '</p></div></div>';
        var tasks_container = document.getElementById("to_do_items_finished");
        tasks_container.insertAdjacentHTML("afterbegin", task_div);*/
        //追加実装のため、task_thirdは別記述であり、意図的変更が難しいので、insertAdjacentHTMLにて挿入
        var third_div = '<p class="todo_third" style="margin:0px 10% 0px 0px; font-size:0.8em; color:#666666">'+ cre_todothird(task_data) +'</p>';

        var task_div ='<div id="' + task_id + '" style="width: 100%; display: flex" onclick="task_onclick(this)"><div style="padding: 8px; width: 64px; box-sizing: border-box;"><button class="mdc-icon-button material-icons" onclick="window.event.cancelBubble = true;task_check_back(this)">check</button></div><div style="width: calc(100% - 54px)"><p class="todo_first" style="margin:18px 10% 0px 0px"></p><p class="todo_second" style="margin:0px 10% 0px 0px; font-size:0.8em; color:#666666"></p>'+ third_div +'</div></div>';
        var tasks_container = document.getElementById("to_do_items_finished");
        var todo_promise = new Promise(function(resolve, reject){
            tasks_container.insertAdjacentHTML("afterbegin", task_div);
            resolve();
        });
        var queryid = "#" + task_id; 
        todo_promise.then(function(){
            //ここでtextContentいれる
            $(queryid).find(".todo_first").text(task_data.text);
            $(queryid).find(".todo_second").text(task_data.memo);
        });

    }else{
        //radio_button_unchecked
        /*
        var task_div ='<div id="' + task_id + '" style="width: 100%; display: flex" onclick="task_onclick(this)"><div style="padding: 8px; width: 64px; box-sizing: border-box;"><button class="mdc-icon-button material-icons" onclick="window.event.cancelBubble = true;task_check(this)">radio_button_unchecked</button></div><div style="width: calc(100% - 54px)"><p class="todo_first" style="margin:18px 10% 0px 0px">' + task_data.text + '</p><p class="todo_second" style="margin:0px 10% 0px 0px; font-size:0.8em; color:#666666">' + task_data.memo + '</p></div></div>';
        var tasks_container = document.getElementById("to_do_items");
        tasks_container.insertAdjacentHTML("afterbegin", task_div);
        */
        var third_div = '<p class="todo_third" style="margin:0px 10% 0px 0px; font-size:0.8em; color:#666666">'+ cre_todothird(task_data) +'</p>';
        
        var task_div ='<div id="' + task_id + '" style="width: 100%; display: flex" onclick="task_onclick(this)"><div style="padding: 8px; width: 64px; box-sizing: border-box;"><button class="mdc-icon-button material-icons" onclick="window.event.cancelBubble = true;task_check(this)">radio_button_unchecked</button></div><div style="width: calc(100% - 54px)"><p class="todo_first" style="margin:18px 10% 0px 0px"></p><p class="todo_second" style="margin:0px 10% 0px 0px; font-size:0.8em; color:#666666"></p>'+ third_div +'</div></div>';
        var tasks_container = document.getElementById("to_do_items");
        var todo_promise = new Promise(function(resolve, reject){
            tasks_container.insertAdjacentHTML("afterbegin", task_div);
            resolve();
        });
        var queryid = "#" + task_id; 
        todo_promise.then(function(){
            //ここでtextContentいれる
            $(queryid).find(".todo_first").text(task_data.text);
            $(queryid).find(".todo_second").text(task_data.memo);
        });

        //タスク残ってますよー
        document.getElementById("list_page_placeholder").style.display = "none";
        document.getElementById("list_page_anonymous").style.display = "none";
        document.getElementById("task_complate").style.display = "none";
        document.getElementById("create_task").style.display = "none";
        document.getElementById("to_do_items").style.display = "block";
    }
    //ここにこれがある理由がわからん↓
    //たぶんタスクをチェックした後に画面を遷移させようとしたのだろうが、get_all_taskの時の誤作動につながっタので今取り除く
    //task_checkの関数の使用内でinsert_taskの後に実行させる記述に変更
    //finish_task_check();
}

//taskを完了させる
function task_check(radio_button){
    radio_button.textContent = "check";
    var task_id = radio_button.parentNode.parentNode.id;
    //データベースを書き換える
    db.collection("users").doc(global_user.uid).collection("tasks").doc(task_id).update({
        finish: true
    }).then(function(){
        //console.log("書き換え完了");
        //要素を消す
        radio_button.parentNode.parentNode.remove();
        global_tasks[task_id]["finish"] = true;
        //挿入する
        insert_task(global_tasks[task_id], task_id);
        finish_task_check();
        //tutorial
        //if(tutorial_flag){
        //    document.getElementById("mission_two").style.display = "none";
        //    document.getElementById("mission_three").style.display = "block";
        //}
    }).catch(function(error){
        console.log("error =>", error);
    });
}
//taskを復活させる
function task_check_back(radio_button){
    radio_button.textContent = "radio_button_unchecked";
    var task_id = radio_button.parentNode.parentNode.id;
    //データベースを書き換える
    db.collection("users").doc(global_user.uid).collection("tasks").doc(task_id).update({
        finish: false
    }).then(function(){
        //console.log("書き換え完了");//要素を消す
        radio_button.parentNode.parentNode.remove();
        global_tasks[task_id]["finish"] = false;
        //挿入する
        insert_task(global_tasks[task_id], task_id);
        finish_task_check();//ブランチ分けたほうに反映されてなかった（されてると思ってた）
    }).catch(function(error){
        console.log("error =>", error);
    });
}

function display_finished_tasks(){
    //console.log("expand 発動");
    var expand_state = document.getElementById("expand_button").textContent;
    if(expand_state == "expand_less"){
        //開く
        document.getElementById("to_do_items_finished").style.display = "block";
        document.getElementById("expand_button").textContent = "expand_more";
        //console.log("開く");
        return
    }else{
        //閉じる
        document.getElementById("to_do_items_finished").style.display = "none";
        document.getElementById("expand_button").textContent = "expand_less";
        //console.log("閉じる");
        return
    }
}

function task_create(){
    //作成内容を取得
    var task_text = document.getElementById("task_text_input").value;
    var task_memo = document.getElementById("task_memo_area").value;
    if(task_text == ""){
        //入力しないと送信できないようにしたい
        return
    }
    //tutorial
    //if(tutorial_flag){
    //    document.getElementById("mission_one").style.display = "none";
    //    document.getElementById("mission_two").style.display = "block";
    //}
    //作成
    var new_task = {
        finish: false,
        text: task_text,
        memo: task_memo
    };
    db.collection("users").doc(global_user.uid).collection("tasks").add(new_task)
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        //閉じる
        fab_task_back();
        //送信を反映させる
        insert_task(new_task, docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

//完了タスク表示欄を表示するか否かを決める関数
function finish_task_check(){
    //console.log("finish_task_check が呼び出された");
    var task_remain = 0;
    var task_finish = 0;
    var task_total = 0;
    /*global_tasks.forEach(function(task){
        if(task.finish == false){
            task_remain += 1;
        }else{
            task_finish += 1;
        }
    });*/
    for (let key in global_tasks) {
        //console.log('key:' + key + ' value:' + global_tasks[key]);
        task_total += 1;
        //console.log("total_count", task_total);
        //console.log("falseでないね" ,global_tasks[key].finish);
        if(global_tasks[key].finish == false){
            task_remain += 1;
            //console.log("remain_count", task_remain);
        }else{
            task_finish += 1;
            //console.log("finish_count", task_finish);
        }
    }
    if(task_total > 0){
        //何かしらタスクを保有している
        document.getElementById("create_task").style.display = "none";
        if(task_finish > 0){
            //終わっているタスクがある
            document.getElementById("finished_container").style.display = "block";
        }else{
            //終わっているタスクはない
            document.getElementById("finished_container").style.display = "none";
            //消えると同時に閉じておく
            document.getElementById("to_do_items_finished").style.display = "none";
            document.getElementById("expand_button").textContent = "expand_less";
        }
        if(task_remain > 0){
            
            //まだタスクはある
            document.getElementById("task_complate").style.display = "none";
            document.getElementById("to_do_items").style.display = "block";
        }else{
            //もうタスクはない
            //console.log(task_remain,"ここでの数値は0だよね？");
            document.getElementById("to_do_items").style.display = "none";
            document.getElementById("task_complate").style.display = "block";
            //ということはこれかつその日スタンプを押したかどうかを診断する
            /*これは自動で画面遷移する処理だったはず。なので、差し止め
            if(global_user_database.AlreadyPushed == false){
                if(task_total == task_finish){
                    tabBar.activateTab(1);
                }
            }
            */
        }
        document.getElementById("list_page_placeholder").style.display = "none";
        document.getElementById("list_page_anonymous").style.display = "none";
    }else{
        //そもそもタスクがない
        //createtaskの表示に変更しました
        document.getElementById("list_page_placeholder").style.display = "none";
        document.getElementById("to_do_items").style.display = "none";
        document.getElementById("list_page_anonymous").style.display = "none";
        document.getElementById("finished_container").style.display = "none";
        document.getElementById("task_complate").style.display = "none";
        document.getElementById("create_task").style.display = "block";
    }
    document.getElementById("task_finished_count").textContent = task_finish;
}


//dateオブジェクトから日付文字列を返します
function getDate(date) {
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

//count を増やす関数
function fab_count(){
    var server_time =  new firebase.firestore.Timestamp.now();
    var date_text = getDate(server_time.toDate());
    db.collection('counts').doc(date_text).update({
        count: firebase.firestore.FieldValue.increment(1)
    }).then(function(){
        //console.log("count しました");
        //数字増やす
        var pre_count = document.getElementById("hitokoto_count_num").textContent;
        document.getElementById("hitokoto_count_num").textContent = Number(pre_count) + 1;
        //ボタン消す
        /*
        document.getElementById("count_page_fab").style.display = "none";
        document.getElementById("count_page_fab").disabled = true;
        */
        //ここで一日一回だけの記述をしましょうか → データべースを書き換える
        db.collection("users").doc(global_user.uid).update({
            AlreadyPushed: true
        }).then(function(){
            //globalを変数を書き換える
            global_user_database.AlreadyPushed = true;
            //count_page_check();
            //20210327 count page check は主にカウントに関する処理を取り扱うものなので、diaryを入れ込むには少し違うと思う
        });
    }).catch(function(error){
        console.log("error =>", error);
    })
}

//データベースの日付を書き換えると同時にログインして記録を確認する
/*はずだったのだが、エラーで固まった（悲）
function login_and_check(user){
    db.collection("users").doc(user.id).get().then(function(doc){
        if (doc.data().date == undefined){
            console.log("すべてで初めてのログイン");
            //すべてを通して初めてのログインのみ動く
            db.collection("users").doc(user.id).update({
                date: new firebase.firestore.Timestamp.now()
            }).then(function(){
                //特にtrue→falseなど書き換えないからそのままどうぞ
                get_all_tasks(user);
            });
        }else{
            console.log("すべてで初めてのログインではない");
            //ログイン経験あり
            if(getDate(doc.data().date.toDate()) == getDate(new firebase.firestore.Timestamp.now().toDate())){
                console.log("今日二回目以降のログイン");
                //日付が同じ タイムスタンプ押してもいいと思うけど、押してない

                //本日二回目以降のログインなら気にせずこれで
                get_all_tasks(user);
            }else{
                console.log("今日は初めてのログイン");
                //日付が違う
                //本日初のログイン
                db.collection("users").doc(user).collection("tasks").where('finish', '==', true).get().then(function (querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                        doc.ref.update({
                            finish: false
                        });
                    });
                }).then(function(){
                    //この書き換え後の取得が上手くいかないなら cloud function 側で対応する
                    console.log("書き換え終わったよ");
                    get_all_tasks(user);
                }).catch(function(error){
                    console.log("Error =>", error);
                });
            }
        }
    })

}*/

//countを取得する関数
function count_page_check(){
    //user がログインしてたらボタンを表示する
    if(global_user == null){
        //console.log("null なのでボタンを使えません");
        //ボタン消す
        //document.getElementById("talk_page_fab").style.display = "none";
        //document.getElementById("talk_page_fab").disabled = true;
    }
    //else{
    //    if(can_user_count()){
    //        //ボタン出す
    //        document.getElementById("talk_page_fab").style.display = "flex";
    //        document.getElementById("talk_page_fab").disabled = false;
    //    }else{
    //        //ボタン消す
    //        document.getElementById("talk_page_fab").style.display = "none";
    //        document.getElementById("talk_page_fab").disabled = true;
    //    }
    //}
    //今の処理だとタブ切り替えで毎回やってるから、見直しが必要かもしれない
    var server_time =  new firebase.firestore.Timestamp.now();
    var date_text = getDate(server_time.toDate());
    //console.log(date_text);
    db.collection("counts").doc(date_text).get().then(function(doc){
        var today_count = doc.data().count;
        document.getElementById("hitokoto_count_num").textContent = today_count;
        /*20210131countの取得ナシはdiaryと同期するので非表示だと思われる。
        document.getElementById("count_day").textContent = date_text;
        //表示を切り替える
        document.getElementById("count_page_noresult").style.display = "none";
        document.getElementById("loading_container").style.display = "none";
        document.getElementById("count_container").style.display = "flex";
        */
    }).catch(function(error){
        console.log("error =>", error);
        //firestoreの作成し忘れなどでもエラーは発生するその時の表示切替はここで行う感じかな
        /*
        document.getElementById("count_container").style.display = "none";
        document.getElementById("loading_container").style.display = "none";
        document.getElementById("count_page_noresult").style.display = "block";
        */
    });
}

//fab diary 作ったよーこれたぶん使わない
function fab_talk(){
    //表示を出す
    document.getElementById("talk_card_div").style.display = "block";
    //title に対してイベントを指定する
    var $input = $('#talk_title_input');
    var $input_b = $('#talk_board_input');
    //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
    $input.on('input', function(event) {
        var value = $input.val();
        var value_b = $input_b.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("talk_create_button").disabled = true;
        }else{
            if(value_b == ""){
                document.getElementById("talk_create_button").disabled = true;
            }else{
                //入力あったらいけ
                document.getElementById("talk_create_button").disabled = false;
            }
        }
    });
    $input_b.on('input', function(event) {
        var value = $input.val();
        var value_b = $input_b.val();
        //console.log(value, event);
        if(value == ""){
            document.getElementById("talk_create_button").disabled = true;
        }else{
            if(value_b == ""){
                document.getElementById("talk_create_button").disabled = true;
            }else{
                //入力あったらいけ
                document.getElementById("talk_create_button").disabled = false;
            }
        }
    });
}

//fab diary back 作ったんで使用することはおそらくない20200815
function fab_talk_back(){
    //表示を出す
    document.getElementById("talk_card_div").style.display = "none";
    //このイベント投稿欄を閉じたときに停止させる
    var $input = $('#talk_title_input');
    $input.off('input');
    var $input_b = $('#talk_board_input');
    $input_b.off('input');
    //作成ボタンを機能停止に切り替える
    document.getElementById("talk_create_button").disabled = true;
    //入力を消す
    document.getElementById("talk_board_input").value ="";
    document.getElementById("talk_title_input").value = "";
    document.getElementById("talk_comment_input").value = "";
}


//この関数でthreadの同線になるけど、それを取り除いていかないとワールドチャット形式では対応できないよね
function talk_page_check(){
    //user がログインしてたらボタンを表示する
    if(global_user == null){
        //console.log("null なのでボタンを使えません");
    }
    //else{
    //    document.getElementById("talk_page_fab").style.display = "flex";
    //    document.getElementById("talk_page_fab").disabled = false;
    //}
    //取得のタイムスタンプの流れとかあった気がする→重複取得に関して制限を考える感じで
    //それに関する対応を考えてから実装しようか
    //get_threads();
    //get threads 関数の再利用はちょっと挙動怖いんで、get diary 作る
    //get_diary();
}

//これもdiaryの置換によりあまり使用しないことになるであろう
/*
function talk_create(){
    //作成内容を取得
    var talk_board_pre = document.getElementById("talk_board_input").value;
    //後にidに含むため _ は使用をできなくする
    var talk_board = underbar_check(talk_board_pre);
    var talk_title = document.getElementById("talk_title_input").value;
    var talk_comment = document.getElementById("talk_comment_input").value;
    if(talk_board == ""){
        //入力しないと送信できないようにしたい
        return
    }else if(talk_title == ""){
        //入力必須
        return
    }
    //コメントは別にあってもなくてもいい
    if(talk_comment == ""){
        var comment_count = 0;
    }else{
        var comment_count = 1;
    }
    var new_thread = {
        createUser: global_user.uid,
        userName: global_user.displayName,
        createDate: new firebase.firestore.Timestamp.now(),
        commentCount: comment_count,
        talkTitle: talk_title,
        boardName: talk_board
    }
    db.collection("boards").doc(talk_board).collection("threads").add(new_thread).then(function(docRef){
        if(comment_count == 1){
            //コメントを入力する
            db.collection("boards").doc(talk_board).collection("threads").doc(docRef.id).collection("comments").add({
                createDate: new firebase.firestore.Timestamp.now(),
                commentText : talk_comment,
                displayName: global_user.displayName
            }).then(function(){
                //作成したら閉じる
                fab_talk_back();
                //反映を表示させる
                insert_thread(new_thread);
                //表示する
                document.getElementById("talk_page_noresult").style.display = "none";
                document.getElementById("have_hitokoto").style.display = "block";
            })
        }else{
            //作成したら閉じる
            fab_talk_back();
            //反映を表示させる
            insert_thread(new_thread);
            //表示する
            document.getElementById("talk_page_noresult").style.display = "none";
            document.getElementById("have_hitokoto").style.display = "block";
        }
    }).catch(function(error) {
        console.error("Error adding document: ", error);
    });
}*/

//ここもdirayに置き換えだねー
function insert_thread(thread_doc_data, thread_id){
    //console.log("insert_thread", thread_doc_data);
    //global_threadsに代入
    insert_global_thread(thread_doc_data.boardName, thread_id, thread_doc_data);
    //表示を切り替える
    var li_id = thread_doc_data.boardName + "_" + thread_id;
    var firedate = thread_doc_data.createDate;
    var date_text = date_nor_display(firedate);
    var thread_li = '<li id=' + li_id + ' class="mdc-list-item" tabindex="0" onclick="comment_card_display(this)"><span class="mdc-list-item__text"><span class="mdc-list-item__primary-text">' + thread_doc_data.talkTitle + ' (' + thread_doc_data.commentCount + ')</span><span class="mdc-list-item__secondary-text">' + thread_doc_data.userName + ' ' + date_text + '</span></span></li>';
    var threads_container = document.getElementById("thread_container");
    threads_container.insertAdjacentHTML("afterbegin", thread_li);
}

//firebaseのタイムスタンプをthreadに表示できる形で返す関数
function date_nor_display(fire_date){
    var date = fire_date.toDate();
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var hours  = date.getHours();
    var minutes  = date.getMinutes();
    return String(year) + "年" + String(month) + "月" + String(day) + "日 " + String(hours) + ":" + String(minutes);
}

var threads_get_flag = true;
//とってきて挿入までするよ
//おそらく以後は未使用になるけどdiaryのほうの関数とかの処理が上手く動いてから削除かな～？
/*function get_threads(){
    if(threads_get_flag){
        //とる
        //今はいってる分をすべて消す
        document.getElementById("thread_container").innerHTML = "";
        //id重複の恐れがあるので、そこを一つ警戒及び把握をしておく
        db.collectionGroup("threads").orderBy("createDate", "desc").limit(10).get().then(function(threads){
            if(threads.size == 0){
                document.getElementById("talk_page_placeholder").style.display = "none";
                document.getElementById("talk_page_noresult").style.display = "block";
            }else{
                threads.forEach(function(thread){
                    insert_thread(thread.data(), thread.id);
                });
                document.getElementById("talk_page_placeholder").style.display = "none";
                document.getElementById("have_hitokoto").style.display = "block";
            }
        });
    }else{
        //とらない
        return
    }
} */

//underbar を使用不可にするための関数
function underbar_check(sourceStr){
    var result = sourceStr.replace( /_/g , "" ) ;
    return result
}

function comment_card_display(li_element){
    //したは表示を変えるためにいろいろしてます
    var board_threadId = li_element.id;
    board_threadId = board_threadId.split("_");
    document.getElementById("comment_card_div").style.display = "block";
    document.getElementById("comment_card_board_name").textContent = board_threadId[0];
    var the_time = date_nor_display(global_threads[board_threadId[0]][board_threadId[1]].createDate);
    var indetail = global_threads[board_threadId[0]][board_threadId[1]].userName + '　' + the_time;
    //comment用のglobal変数に代入する
    global_now_board = board_threadId[0];
    global_now_thread = board_threadId[1];
    //threadの中身をとって入れ込む
    document.getElementById("comment_card_mimic_title").textContent = global_threads[board_threadId[0]][board_threadId[1]].talkTitle;
    document.getElementById("comment_card_mimic_detail").textContent = indetail;
    //document.getElementById("comment_card_mimic").innerHTML = li_element.innerHTML;なんか表示崩れた
    clear_get_insert_listen_comment(board_threadId[0], board_threadId[1], li_element.id);
    //inputのリスナーですね
    if(global_user == null){
        //console.log("null なのでコメントできません");
        document.getElementById("comment_card_input_input").placeholder = "コメントするにはログインが必要です";
    }else{
        var $input = $('#comment_card_input_input');
        //このイベント投稿欄を閉じたときに停止させたりしたほうがいいとかあるかね？
        $input.on('input', function(event) {
            var value = $input.val();
            //console.log(value, event);
            if(value == ""){
                document.getElementById("comment_card_input_button").disabled = true;
                //色変え
                document.getElementById("comment_card_input_button").style.color = "#595959";
            }else{
                //入力あったらいけ
                document.getElementById("comment_card_input_button").disabled = false;
                //色変え
                document.getElementById("comment_card_input_button").style.color = "#2979ff";
            }
        });
    }
}

function comment_card_display_back(){
    document.getElementById("comment_card_div").style.display = "none";
    //中身を空にする
    document.getElementById("comment_card_board_name").textContent = "";
    //このイベント投稿欄を閉じたときに停止させる
    if(global_user == null){
        //console.log("null なのでなんもしません");
    }else{
        var $input = $('#comment_card_input_input');
        $input.off('input');
        //送信ボタンを機能停止に切り替える
        document.getElementById("comment_card_input_button").disabled = true;
        //色変え
        document.getElementById("comment_card_input_button").style.color = "#595959";
        //入力を消す
        document.getElementById("comment_card_input_input").value ="";
    }
}

//commentを取得して挿入する動きを取り入れたい関数、いつかリアルタイムの取得に関しても取り組んでいこうと思案している
function clear_get_insert_listen_comment(boardname, threadid, board_threadid){
    //とりあえず重複取得に関しての対策を組み込んでいく必要がある
    insert_global_timestamp(boardname, threadid, board_threadid, true);
    db.collection("boards").doc(boardname).collection("threads").doc(threadid).collection("comments").where('createDate', '>' , global_timestamps[board_threadid]).get().then(function(commentdocs){
        //timestamp この関数の中でlistenerも配置している
        insert_global_timestamp(boardname, threadid, board_threadid, false);
        commentdocs.forEach(function(commentdoc){
            insert_global_comment(commentdoc.data(), board_threadid);
        });
        //コメントの中身を空にする
        document.getElementById("comment_card_messages").innerHTML = "";
        for(var i= 0; i< global_comments[board_threadid].length; i++){
            insert_comment(board_threadid, i);
        }
    }).catch(function(error){
        console.log("error =>", error);
    })
}

function insert_comment( board_threadid, number ){
    //console.log("insert して", board_threadid, number);
    var commentdoc = global_comments[board_threadid][number];
    //console.log(board_threadid, number, commentdoc);
    //global変数に入れる
    //insert_global_comment(commentid, commentdoc, board_threadId);
    /*console.log("insert_thread", thread_doc_data);
    var li_id = thread_doc_data.boardName + "_" + thread_id;
    var firedate = thread_doc_data.createDate;
    var date_text = date_nor_display(firedate);*/
    var maintext_style = "margin: 0px; padding-left: 13px;";
    var subtext_style = "margin: 0px; padding-left: 13px; font-size: 0.8em; color: #777777;";
    var the_time = date_nor_display(commentdoc.createDate);
    var comment_div = '<div style="margin: 12px 0px"><p style="' + subtext_style + '">' + commentdoc.displayName + ' ' + the_time + '</p><p style="' + maintext_style + '">' + commentdoc.commentText + '</p></div>';
    var comments_container = document.getElementById("comment_card_messages");
    comments_container.insertAdjacentHTML("afterbegin", comment_div);
}

function insert_global_thread(boardName, threadId, threadDoc){
    //板がそもそも入っているか
    if(global_threads[boardName] == undefined){
        global_threads[boardName] = {};
    }
    //ぶち込め
    global_threads[boardName][threadId] = threadDoc;
}

function insert_global_timestamp(boardName, threadId, board_threadid, first_true){
    //初めての定義かそれ以外で分岐
    if(global_timestamps[board_threadid] == undefined){
        //までタイムスタンプ定義してないとき
        global_timestamps[board_threadid] = firebase.firestore.Timestamp.fromDate(new Date("December 10, 1815"));
    }else{
        //今
        if(first_true){
            return
        }else{
            //取得の上側で実行されるのは初回のみにする。そうじゃないと、取得タイミングが重なってよくないことになるからね
            var the_time = new firebase.firestore.Timestamp.now();
            global_timestamps[board_threadid] = the_time;
            //set_comments_listener(boardName, threadId , board_threadid);
        }
    }
}

function insert_global_comment( commentdoc, board_threadid){
    //未定義なときとそうでないときで分ける
    if(global_comments[board_threadid] == undefined){
        //未定義なら、リストを作成する
        global_comments[board_threadid] = [];
    }
    //配列の末尾に入れる
    global_comments[board_threadid].push(commentdoc);
}


function send_comment(){
    var the_comment = document.getElementById("comment_card_input_input").value;
    db.collection("boards").doc(global_now_board).collection("threads").doc(global_now_thread).collection("comments").add({
        createDate: new firebase.firestore.Timestamp.now(),
        commentText : the_comment,
        displayName: global_user.displayName
    }).then(function(){
        //中身をとりあえず消す
        document.getElementById("comment_card_input_input").value = "";
        //作成したら今は再取得にするが、いつかリスナにしたほうがスタイリッシュだと思うなー
        clear_get_insert_listen_comment(global_now_board, global_now_thread, global_now_board + "_" + global_now_thread);
        //コメントの数を増やす記述をするかも
        db.collection("boards").doc(global_now_board).collection("threads").doc(global_now_thread).update({
            commentCount: firebase.firestore.FieldValue.increment(1)
        }).then(function(){
            //console.log("カウント");
        });
    }).catch(function(error){
        console.log("error", error);
    });
}

//この関数でボタンを押せるかどうか判別する条件としてタスクを一個以上完了し、残りタスクが０、今日はカウントしてないなどの条件が必要になる
function can_user_count(){
    //global_task と global_user_databaseを用いて、正負判定を行う
    if(global_user_database == undefined){
        //データベースが未定義、匿名ユーザで発生。（ログインしたら基本的にデータベースにデータを作る処理になっているので）
        return false
    }else{
        //タスクの数についてカウントしましょうか
        var task_remain = 0;
        var task_finish = 0;
        var task_total = 0;
        for (let key in global_tasks) {
            //console.log('key:' + key + ' value:' + global_tasks[key]);
            task_total += 1;
            if(global_tasks[key].finish == false){
                task_remain += 1;
            }else{
                task_finish += 1;
            }
        }
        if(task_total == 0){
            //タスクがそもそもないので
            return false
        }else if(task_finish == 0){
            //タスクが一つも完了していないので
            return false
        }else if(task_finish > 0 && task_remain == 0){
            //タスクの数の条件に関してはオッケー
            if(global_user_database.AlreadyPushed == false){
                //まだクリックしてないのでカウントしてどうぞ
                return true
            }else{
                //もう今日はクリックしたと思われるのでカウントできません
                return false
            }
        }
    }
}

var tutorial_flag = false;
//firestoreのユーザデータをとってきてglobal変数に入れるための記述
function fire_userdata_get(uid){
    db.collection("users").doc(uid).get().then(function(doc){
        //データが未定義の時（初めての取得の時）
        if(doc.data() == undefined){
            //利用規約を表示する
            use_terms_dialog.open();
            //20210816 tutorialのためのフラグ起動
            tutorial_flag = true;
            //20210210 Good Gift の初期化の追加
            var regist_doc = {   
                AlreadyPushed:false,
                Good: []
                //Gift: []
            }
            db.collection("users").doc(uid).set(regist_doc).then(function(){
                global_user_database = regist_doc;
            });
        }else{
            global_user_database = doc.data();

        }
    }).catch(function(error){
        console.log("error", error);
    });
    //20210320グラフ系はもろとも停止
    //20210409サブすく系統は再開
    //ログインしているのでchart-2を表示する（subscrtionのためのカード）
    document.getElementById("chart_two").style.display = "flex";
    //20210312ユーザがstripeに登録するためのカードも追加でーす
    //document.getElementById("chart_three").style.display = "flex";
    getCustomClaimRole();
}

function reload(){
    location.reload();
}

function data_page_check(){
    //とりあえずグラフを表示するのがやるべきやね
    graph_check();
};

/// グローバル定数を定義する
function define(name, value){
    Object.defineProperty(window, name, { 
        get: function(){return value;},
        set: function(){throw(name+' is already defined !!');},
    });
}

function close_userterm(){
    use_terms_dialog.close();
    //if(tutorial_flag){
        //ミッション１を開く
    //    document.getElementById("mission_one").style.display = "block";
    //}
}

function check_talk_time(now_hour){
    //auto_hitokotoですべてオッケーにしたよ
    return true
    /*
    if(now_hour==6||now_hour==7||now_hour==8||now_hour==9||now_hour==10||now_hour==12||now_hour==13||now_hour==14||now_hour==15||now_hour==18||now_hour==19||now_hour==20||now_hour==21||now_hour==22){
        return true
    }else{
        return false
    }
    */
}

//チュートリアルチップのダイアログの実装
var tutorial_one = new mdc.dialog.MDCDialog(document.querySelector('#tutorial_one'));
var tutorial_two = new mdc.dialog.MDCDialog(document.querySelector('#tutorial_two'));
var tutorial_three = new mdc.dialog.MDCDialog(document.querySelector('#tutorial_three'));
var tutorial_four = new mdc.dialog.MDCDialog(document.querySelector('#tutorial_four'));
var tutorial_five = new mdc.dialog.MDCDialog(document.querySelector('#tutorial_five'));


//ヒトコトコメントを送信した後にデータベースを検証して、チュートリアルチップを表示するための関数
function tutorial_check(){
    if(global_user.tutorial[0]){
        //一度目は完了
        if(global_user.tutorial[1]){
            //二度目は完了
            if(global_user.tutorial[2]){
                //三度目は完了
                if(global_user.tutorial[3]){
                    //四度目は完了
                    if(global_user.tutorial[4]){
                        //五度目も完了
                        //何もしない
                        return
                    }else{
                        //データベースに登録
                        db.collection("users").doc(global_user.uid).update({
                            tutorial:firebase.firestore.FieldValue.arrayUnion(true)
                        }).then(function(){
                            //5度目のチップを表示
                            tutorial_five.open();
                        }).catch(function(error){
                            console.log("error",error);
                        });
                    }
                }else{
                    //データベースに登録
                    db.collection("users").doc(global_user.uid).update({
                        tutorial:firebase.firestore.FieldValue.arrayUnion(true)
                    }).then(function(){
                        //4度目のチップを表示
                        tutorial_four.open();
                    }).catch(function(error){
                        console.log("error",error);
                    });
                }
            }else{
                //データベースに登録
                db.collection("users").doc(global_user.uid).update({
                    tutorial:firebase.firestore.FieldValue.arrayUnion(true)
                }).then(function(){
                    //3度目のチップを表示
                    tutorial_three.open();
                }).catch(function(error){
                    console.log("error",error);
                });
            }
        }else{
            //データベースに登録
            db.collection("users").doc(global_user.uid).update({
                tutorial:firebase.firestore.FieldValue.arrayUnion(true)
            }).then(function(){
                //2度目のチップを表示
                tutorial_two.open();
            }).catch(function(error){
                console.log("error",error);
            });
        }
    }else{
        //データベースに登録
        db.collection("users").doc(global_user.uid).update({
            tutorial:[true]
        }).then(function(){
            //一度目のチップを表示
            tutorial_one.open();
        }).catch(function(error){
            console.log("error",error);
        });
    }
}

//insert_task内で、連続、合計、goodの表示する文字を生成するための関数
function cre_todothird(db_task){
    if(db_task.combo==undefined){var combo = 0}else{var combo = db_task.combo}
    if(db_task.total==undefined){var total = 0}else{var total = db_task.total}
    if(db_task.good==undefined){var good = 0}else{var good = db_task.good}
    var result = '連続' + combo +'  合計'+ total +'  いいね'+ good ;
    return result
}