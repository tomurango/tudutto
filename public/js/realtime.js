/*onSnapshot() と get()を分ける必要がないのでは疑惑
function set_comments_listener(boardName, threadId , board_threadid ){
    comment_listeners_global[board_threadid] = db.collection("boards").doc(boardName).collection("threads").doc(threadId).collection("comments")
    .where('createDate', '<' , global_timestamps[board_threadid]).orderBy("createDate", "desc").onSnapshot(function(docs){
        console.log("listener 動いてる");
        var source = docs.metadata.hasPendingWrites ? "Local" : "Server";
        console.log(source, " data: ", docs);
        //timestamp
        global_timestamps[board_threadid] = new firebase.firestore.Timestamp.now();
        //それぞれに対してglobal代入処理
        docs.forEach(function(commentdoc){    
            //globalに入れる;
            insert_global_comment(commentdoc.data(), board_threadid);
            //コメントの中身を空にする必要はリスナではない
            //document.getElementById("comment_card_messages").innerHTML = "";
            //上記forEachないでglobal変数に入れているのでリスナではその最後尾に入っているものを指定すればよいはずである
        });
        insert_comment(board_threadid, global_comments[board_threadid].length - 1);
    });
}
*/

//clear_get_insert_listen_commentにとって代わるリスナとコメント挿入の流れを実装
