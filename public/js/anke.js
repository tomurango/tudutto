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
}

function dis_cre_anke_div_back(){
    document.getElementById("dis_cre_anke_div").style.display="none";
}

function anke_create(){
    console.log("作成する");
}