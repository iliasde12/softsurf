document.getElementById("form").addEventListener("submit", (e) => {
    const email = document.getElementById("email").value.trim();
    const wachtwoord = document.getElementById("wachtwoord").value;

    if (!email || !wachtwoord) {
        e.preventDefault();
        showError("Vul alle velden in");
        return;
    }

    // geen preventDefault → form submit gaat naar POST /login
});

function showError(message) {
    const errorMessageContainer = document.querySelector(".container-message");
    errorMessageContainer.style.display = "block";
    errorMessageContainer.textContent = "";
    const errorMessage = document.createElement("p");
    errorMessage.textContent = message;
    errorMessageContainer.append(errorMessage);
}