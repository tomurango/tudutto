var task_idbatton_edit;
function task_onclick(task_element){
    task_idbatton_edit = task_element.id;
    //詳細に関するｄiv  を開く処理を記述せよ
    document.getElementById("task_edit_div").style.display = "block";
    //中身をタグに書く
    document.getElementById("task_textedit_input").value = global_tasks[task_element.id]["text"];
    document.getElementById("task_memoedit_area").value = global_tasks[task_element.id]["memo"];
}

function task_onclick_back(){
    //変更の検証をする
    if(global_tasks[task_idbatton_edit]["text"] != document.getElementById("task_textedit_input").value || global_tasks[task_idbatton_edit]["memo"] != document.getElementById("task_memoedit_area").value){
        //console.log("書き換えます");
        //text 若しくは memo が切り替わったからglobal変数を変更
        global_tasks[task_idbatton_edit]["text"] = document.getElementById("task_textedit_input").value;
        global_tasks[task_idbatton_edit]["memo"] = document.getElementById("task_memoedit_area").value;
        //表示されてる to do の表示を変える
        var hash_id = "#" + task_idbatton_edit;
        $(hash_id).find('.todo_first').text(document.getElementById("task_textedit_input").value);
        $(hash_id).find('.todo_second').text(document.getElementById("task_memoedit_area").value);
        //データベースを書き換える
        db.collection("users").doc(global_user.uid).collection("tasks").doc(task_idbatton_edit).update({
            text: document.getElementById("task_textedit_input").value,
            memo: document.getElementById("task_memoedit_area").value
        }).then(function(){
            //console.log("データベース書き換えました");
            //バトンの中身消しとくね
            task_idbatton_edit = "";
        }).catch(function(error){
            console.log("error", error);
        });
    }
    //表示を消す
    document.getElementById("task_edit_div").style.display = "none";
    //中身を空にする
    document.getElementById("task_textedit_input").value = "";
    document.getElementById("task_memoedit_area").value = "";
}


var delete_alert_dialog = new mdc.dialog.MDCDialog(document.querySelector('#delete_alert_dialog'));

//task削除の時にdialogを表示するようにする
/* html に直接記述しました
function task_delete_alert(){
    delete_alert_dialog.open();
}
*/


//task_idbatton_editを使いましょう task onclick back からコピペで張ってるから、柿ミスには気を付けて
function task_delete(){
    //console.log(global_tasks[task_idbatton_edit]["text"], "を削除する動きを行います。");
    //変更の検証をする
    //global変数から削除する
    delete global_tasks[task_idbatton_edit];
    //表示されてる to do の表示から消す
    var hash_id = "#" + task_idbatton_edit;
    $(hash_id).remove();
    //データベースを書き換える
    db.collection("users").doc(global_user.uid).collection("tasks").doc(task_idbatton_edit).delete().then(function(){
        //console.log("データベース書き換えました");
        //バトンの中身消しとくね
        task_idbatton_edit = "";
    }).catch(function(error){
        console.log("error", error);
    });
    //表示を消す
    document.getElementById("task_edit_div").style.display = "none";
    //中身を空にする
    document.getElementById("task_textedit_input").value = "";
    document.getElementById("task_memoedit_area").value = "";
}

