function tag_anke(element){
    if(element.classList.contains("disactive")){
        if(element.id == "anke_look"){
            element.classList.toggle("active");
            element.classList.toggle("disactive");
            document.getElementById("anke_follow").classList.toggle("active");
            document.getElementById("anke_follow").classList.toggle("disactive");
            //document.getElementById("danjon_look_page").style.display = "flex";
            //document.getElementById("danjon_follow_page").style.display = "none";
        }else if(element.id == "anke_follow"){
            element.classList.toggle("active");
            element.classList.toggle("disactive");
            document.getElementById("anke_look").classList.toggle("active");
            document.getElementById("anke_look").classList.toggle("disactive");
            //document.getElementById("danjon_follow_page").style.display = "block";
            //document.getElementById("danjon_look_page").style.display = "none";
        }
    }else{
        //activeのボタンを押したので何もしないで関数を終了させる
        return ;
    }
}