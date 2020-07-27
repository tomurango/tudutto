function task_onclick(task_element){
    //console.log("the_element => ", task_element.id);
    //詳細に関するｄiv  を開く処理を記述せよ
    document.getElementById("task_edit_div").style.display = "block";
    //document.getElementById("task_id_test").textContent = task_element.id;
}

function task_onclick_back(){
    document.getElementById("task_edit_div").style.display = "none";

}