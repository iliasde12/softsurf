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
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    const level = Math.min(Math.ceil(score / 2), 4);
    updateStrength(level);
});

function updateStrength(level) {
    bars.forEach(bar => bar.className = 'bar');

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

// Avatar selectie
const avatarSpans = document.querySelectorAll('.circkel-img');
let selectedAvatar = document.querySelector('.circkel-img.circkel-active img')?.getAttribute('src') ?? "";

avatarSpans.forEach(avatar => {
    avatar.addEventListener('click', () => {
        avatarSpans.forEach(a => a.classList.remove('circkel-active'));
        avatar.classList.add('circkel-active');
      selectedAvatar = avatar.querySelector('img').getAttribute('src');
        document.getElementById("avatar-input").value = selectedAvatar;
    });
});

// Form submit — MVC, geen fetch
document.getElementById("form").addEventListener("submit", (e) => {
    const username = document.getElementById("weergavenaam").value.trim();
    const email = document.getElementById("email").value.trim();
    const wachtwoord = document.getElementById("wachtwoord").value;
    const HerhaalWachtwoord = document.getElementById("wachtwoord2").value;

    const { error, message } = checkRequirments(username, email, wachtwoord, HerhaalWachtwoord);

    if (error) {
        e.preventDefault(); // stop alleen bij fout
        showError(message);
        return;
    }

    // avatar meesturen als hidden input
    document.getElementById("avatar-input").value = selectedAvatar;
    // geen preventDefault → form submit gaat door naar POST /register
});

function showError(message) {
    const errorMessageContainer = document.querySelector(".container-message");
    errorMessageContainer.style.display = "block";
    errorMessageContainer.textContent = "";
    const errorMessage = document.createElement("p");
    errorMessage.textContent = message;
    errorMessageContainer.append(errorMessage);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function checkRequirments(username, email, wachtwoord, HerhaalWachtwoord) {
    if (username.length < 3) {
        return { error: true, message: "Gebruikersnaam moet minimaal 3 karakters zijn" };
    }
    if (!validateEmail(email)) {
        return { error: true, message: "Voer een geldig email adres in" };
    }
    if (wachtwoord.length < 8) {
        return { error: true, message: "Wachtwoord moet minimaal 8 karakters zijn" };
    }
    if (StrenghtPass < 3) {
        return { error: true, message: "Wachtwoord is niet sterk genoeg. Gebruik hoofdletters, kleine letters en cijfers." };
    }
    if (wachtwoord !== HerhaalWachtwoord) {
        return { error: true, message: "Wachtwoorden komen niet overeen" };
    }
    return { error: false, message: "Registratie succesvol!" };
}