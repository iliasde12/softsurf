//bron van email regex functie
//van internet de regex staat op https://medium.com/@python-javascript-php-html-css/how-to-use-javascript-to-verify-an-email-address-464493b60839
const passwordInput = document.getElementById('wachtwoord');
const bars = document.querySelectorAll('.container-bar .bar');
const strengthText = document.querySelector('.text');
let StrenghtPass = 0;

passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;

    if (!password) {
        resetStrength();
        StrenghtPass = 0;
        return;
    }

    let score = 0;
    //plus 1 punt als langer of gelijk is aan 8
    if (password.length >= 8) score++;
    //plus 1 punt als langer of gelijk is aan 12 maar inclusief de plus 8 dus plus 2
    if (password.length >= 12) score++;
    //plus 1 als er een hoofdletter in zit
    if (/[A-Z]/.test(password)) score++;
    //plus 1 voor een kleine lettter 
    if (/[a-z]/.test(password)) score++;
    //plus1 voor een cijfer d staat voor digit
    if (/\d/.test(password)) score++;
    //plus 1 voor speciale char dus als 1 van de char in de ww zitten
    if (/[!@#$%^&*]/.test(password)) score++;
    //kan noo
    const level = Math.min(Math.ceil(score / 2), 4);
    updateStrength(level);
});

function updateStrength(level) {
    bars.forEach(bar => {
        bar.className = 'bar';
    });

    switch (level) {
        case 1:
            bars[0].classList.add('weak');
            strengthText.textContent = 'Zwak wachtwoord';
            strengthText.className = 'text weak';
            StrenghtPass = 1;
            break;
        case 2:
            bars[0].classList.add('medium');
            bars[1].classList.add('medium');
            strengthText.textContent = 'Gemiddeld wachtwoord';
            strengthText.className = 'text medium';
            StrenghtPass = 2;
            break;
        case 3:
            bars[0].classList.add('good');
            bars[1].classList.add('good');
            bars[2].classList.add('good');
            strengthText.textContent = 'Goed wachtwoord';
            strengthText.className = 'text good';
            StrenghtPass = 3;
            break;
        case 4:
            bars.forEach(bar => bar.classList.add('strong'));
            strengthText.textContent = 'Sterk wachtwoord';
            strengthText.className = 'text strong';
            StrenghtPass = 4;
            break;
    }
}

function resetStrength() {
    bars.forEach(bar => bar.className = 'bar');
    strengthText.textContent = 'Wachtwoordsterkte';
    strengthText.className = 'text';
}


const avatars = document.querySelectorAll('.circkel-img');
let selectedAvatar = "https://em-content.zobj.net/thumbs/240/apple/354/grinning-face_1f600.png";

avatars.forEach(avatar => {
    avatar.addEventListener('click', () => {
        avatars.forEach(a => a.classList.remove('circkel-active'));
        avatar.classList.add('circkel-active');
        const img = avatar.querySelector('img');
        selectedAvatar = img.src;
        console.log("Geselecteerde avatar:", selectedAvatar);
    });
});



document.getElementById("form").addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("weergavenaam").value.trim();
    const email = document.getElementById("email").value.trim();
    const wachtwoord = document.getElementById("wachtwoord").value;
    const HerhaalWachtwoord = document.getElementById("wachtwoord2").value;

    let { error, message } = checkRequirments(username, email, wachtwoord, HerhaalWachtwoord);

    if (!error) {
        saveUser(username, email, wachtwoord);
        window.location.href = "/login.html";
    } else {
        const errorMessageContainer = document.querySelector(".container-message");
        errorMessageContainer.style.display = "block";
        errorMessageContainer.textContent = "";

        const errorMessage = document.createElement("p");
        errorMessage.textContent = message;
        errorMessageContainer.append(errorMessage);
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function checkRequirments(username, email, wachtwoord, HerhaalWachtwoord) {
    if (username.length < 3) {
        return { "error": true, "message": "Gebruikersnaam moet minimaal 3 karakters zijn" };
    }

    if (!validateEmail(email)) {
        return { "error": true, "message": "Voer een geldig email adres in" };
    }

    if (wachtwoord.length < 8) {
        return { "error": true, "message": "Wachtwoord moet minimaal 8 karakters zijn" };
    }

    if (StrenghtPass < 3) {
        return {
            "error": true,
            "message": "Wachtwoord is niet sterk genoeg. Gebruik hoofdletters, kleine letters en cijfers."
        };
    }

    if (wachtwoord !== HerhaalWachtwoord) {
        return { "error": true, "message": "Wachtwoorden komen niet overeen" };
    }

    return { "error": false, "message": "Registratie succesvol!" };
}






function saveUser(username, email, wachtwoord) {
    const user = {
        id: Date.now(),
        username: username,
        email: email,
        wachtwoord: wachtwoord,
        avatar: selectedAvatar,
    };

    localStorage.setItem("user", JSON.stringify(user));
}