const user = JSON.parse(localStorage.getItem("LoggedinUser"));

const profielIcon = document.getElementById("profiel-avatar");
profielIcon.src = user.img


const usernameContainer = document.querySelector(".gebruikersnaamcontainer");
usernameContainer.textContent = user.username;

const emailContainer = document.querySelector(".emailcontainer");
emailContainer.textContent = user.email;

const nameInput = document.getElementById("naam");
const UsernameInput = document.getElementById("gebruikersnaam");
const EmailInput = document.getElementById("email");


nameInput.value = user.username;
UsernameInput.value = user.username;
EmailInput.value = user.email;