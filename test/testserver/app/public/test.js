track(()=>{
    test();
});

//test();

function test(){
    let b1 = document.getElementById("b1");
    b1.addEventListener("click", ()=>{
        $.get("abc.json");
    })

    let b2 = document.getElementById("b2");
    b2.addEventListener("click", (event)=>{
        event.preventDefault();
        $.get("abc1.json");
        th();
    })

    let b3 = document.getElementById("b3");
    let b = false;
    b3.addEventListener("click", (event)=>{
        let myimg = document.getElementById("myimg");
        myimg.style.display = b?"block":"none";
        b=!b;
    })

    let input = document.getElementById("input1");
    input.addEventListener("keyup",function(){
        console.log("input somethine....");
    })
}

function th(){
    throw new Error("dededede");
}