const user = localStorage.getItem("LoggedinUser");
console.log(user);

//tijdelijk zien wie er is ingelogd
/*if (!user) {
    window.location.href = "/login.html";
}*/

//de data showen en de nodige containers selecteren
const userData = JSON.parse(localStorage.getItem("LoggedinUser"));
const usernameContainer = document.getElementById("username");
const imgContainer = document.getElementById("profiel-picutre");

//de nodige data in de containers zetten
usernameContainer.textContent = userData.username;
imgContainer.src = userData.img;
