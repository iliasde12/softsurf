document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const wachtwoord = document.getElementById("wachtwoord").value;

    const { error, message, user } = CheckUser(email, wachtwoord);

    if (!error) {
        LoggedinUser(user.id, user.username, useSyncExternalStore.email, user.avatar);
        window.location.href = "/collectie.html";
    } else {
        const errorMessageContainer = document.querySelector(".container-message");
        errorMessageContainer.style.display = "block";
        errorMessageContainer.textContent = "";

        const errorMessage = document.createElement("p");
        errorMessage.textContent = message;
        errorMessageContainer.append(errorMessage);
    }

})

function CheckUser(email, wachtwoord) {
    //get de user
    const user = JSON.parse(localStorage.getItem("user"));

    if (user.email !== email) {
        return { "error": true, "message": "email bestaat niet.", user: null }
    }

    if (user.wachtwoord !== wachtwoord) {
        return { "error": true, "message": "verkeerd wachtwoord.", user: null }
    }

    return { "error": false, "message": "verkeerd wachtwoord.", user: { id: user.id, username: user.username } }
}



function LoggedinUser(id, username, email, wachtwoord, image) {
    const user = {
        id: id,
        username: username,
        email: email,
        wachtwoord: wachtwoord,
        img: image
    }
    localStorage.setItem("LoggedinUser", JSON.stringify(user));
}