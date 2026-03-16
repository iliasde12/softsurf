document.addEventListener("DOMContentLoaded", () => {
 const userData = JSON.parse(localStorage.getItem("LoggedinUser"));
    //tijdelijk zien wie er is ingelogd
    /*if (!user) {
        window.location.href = "/login.html";
    }*/


    //containers
   
    const username = document.getElementById("username");
    const img = document.getElementById("profiel-picutre");
    const uitloggen = document.getElementById("uitloggen");


    //data vullen
    username.innerText = userData.username;
    img.src = userData.img;

    uitloggen.addEventListener("click", () => {
        localStorage.removeItem("LoggedinUser");
        localStorage.removeItem("access_token_spotify");
        window.location.href = "/login.html";
    });

});