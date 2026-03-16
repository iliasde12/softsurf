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

document.getElementById("bewerkenButton").addEventListener("click",()=>{
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);

    const newUser = {
        id: user.id,
        username: UsernameInput.value,
        email: EmailInput.value,
        wachtwoord: user.wachtwoord,
        avatar:user.avatar,
    }

    localStorage.setItem("user",JSON.stringify(newUser));
    localStorage.removeItem("LoggedinUser");
    localStorage.removeItem("acces_token_spotify");
});