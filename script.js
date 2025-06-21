var chatOpenBtn = document.querySelector(".chatbot");
var chatCloseBtn = document.querySelector(".fa-xmark");
var chatBox = document.querySelector(".chat-box");
var opener = 0;

chatOpenBtn.addEventListener("click",function(){
    if(opener==0){
        chatBox.style.opacity = "100";
        opener = 1;
    } else {
        chatBox.style.opacity = "0";
        opener = 0;
    }
})

chatCloseBtn.addEventListener("click",function(){
    chatBox.style.opacity = "0";
})


