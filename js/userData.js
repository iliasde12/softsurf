const user = localStorage.getItem("LoggedinUser");

//tijdelijk zien wie er is ingelogd
if (!user) {
    window.location.href = "/login.html";
}


