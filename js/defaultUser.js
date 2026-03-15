function saveUser() {
    const user = {
        id: Date.now(),
        username: "test",
        email: "test@test.com",
        wachtwoord: "test12345",
        avatar: "https://em-content.zobj.net/thumbs/240/apple/354/grinning-face_1f600.png",
    };

    localStorage.setItem("user", JSON.stringify(user));
}

saveUser();