const user = localStorage.getItem("LoggedinUser");
console.log(user);

//tijdelijk zien wie er is ingelogd
/*if (!user) {
    window.location.href = "/login.html";
}*/

//de data showen en de nodige containers selecteren
const userData = JSON.parse(localStorage.getItem("LoggedinUser"));
document.getElementById("username").innerText = userData.username;
document.getElementById("profiel-picutre").src = userData.img;

document.getElementById("uitloggen").addEventListener("click", () => {
    localStorage.removeItem("LoggedinUser");
    localStorage.removeItem("access_token_spotify");
    window.location.href = "/login.html";
});
