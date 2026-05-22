import {getDrivers, getSession} from "./api.js"

const dropdownItems = document.querySelectorAll('.dropdown-item');
const dropdownButton = document.querySelector('.dropdown-toggle');

dropdownItems.forEach(item => {
    item.addEventListener('click', function(e) {
        
        e.preventDefault(); 
        const selectedYear = this.textContent;
        dropdownButton.textContent = selectedYear;
        
        app(selectedYear)
    });
});

async function  app(year){
    let display = document.getElementById("drivers-list")
    display.innerHTML = ""

    let data = await getSession(year)

    let sessionKey = data[0].session_key

    getDrivers(true, null, sessionKey)
}

app(2026)