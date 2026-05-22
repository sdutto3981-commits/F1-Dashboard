import { getSessionByName, getMeetingByName, getMeetings, getSession, getMeetingImage, getMeetingFlag, getDrivers, getWeather } from "./api.js";

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const state = {
    anno: null,
    meeting: null,
    sessione: null,
    imgUrl: null,
    flagUrl: null,
};

const actions = {
    anno: (val) => updateDropdown('meeting', () => getMeetings(val)),
    meeting: async (val) => {
        state.meeting = await getMeetingByName(val, state.anno); 
        updateDropdown('sessione', () => getSession(state.anno, null, state.meeting));
    },
    sessione: async (val) => {
        state.sessione = await getSessionByName(val, state.anno, state.meeting);
        getSession(state.anno, state.sessione, state.meeting);
        setScreen()
    }
};

function handleSelection(e) {
    e.preventDefault();
    const item = e.target;
    const container = item.closest('.dropdown');
    const categoria = container.dataset.categoria;
    const valore = item.innerText;

    container.querySelector('.dropdown-toggle').innerText = valore;
    state[categoria] = valore;

    if (actions[categoria]) actions[categoria](valore);
}

async function updateDropdown(targetCategory, fetchDataFn) {
    const data = await fetchDataFn();
    const menu = document.querySelector(`[data-categoria="${targetCategory}"] .dropdown-menu`);
    
    menu.innerHTML = data.map(item => {
        const label = item.meeting_name || `${item.session_name}-${item.date_start.split("T")[0]}`;
        return `<li><a class="dropdown-item" href="#">${label}</a></li>`;
    }).join('');

    menu.querySelectorAll('.dropdown-item').forEach(el => el.addEventListener('click', handleSelection));
}

window.onload = () => {
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', handleSelection);
    });
};

async function setScreen() {
    const screen = document.getElementById("sessionData");
    screen.innerHTML = ""; 

    state.imgUrl = await getMeetingImage(state.anno, state.meeting)
    state.flagUrl = await getMeetingFlag(state.anno, state.meeting)
    const meetingData = await getMeetings(state.anno, state.meeting)

    const meeting = meetingData[0] || {};

     screen.innerHTML = `
        <div class="col-md-3 text-center">
            <img src="${state.imgUrl}" class="img-fluid circuit-svg filter-white" style="max-height: 150px;" alt="Circuit">
        </div>
        <div class="col-md-6 text-center text-md-start">
            <h1 class="display-5 fw-bold mb-0">${meeting.meeting_official_name || 'Grand Prix'}</h1>
            <p class="lead mb-0">${meeting.location} | ${state.anno} <span><button class="btn btn-primary" id="btn-dashboard" data-session=${state.sessione} data-meeting=${state.meeting} data-annno=${state.anno}>More details</button></span></p>
        </div>
        <div class="col-md-3 text-center">
            <img src="${state.flagUrl}" class="img-fluid shadow-sm flag-mini rounded" style="width: 80px;" alt="Flag">
        </div>
    `;

    setButtonInfo()
    await wait(3000);
   
    await getDrivers(true, null, state.sessione, state.meeting);
    await renderWeather(state.sessione, state.meeting);

    
    
}

async function renderWeather(sk, mk) {
    const weatherData = await getWeather(sk, mk);
    const details = document.getElementById('session-details');
    console.log(weatherData)
    if (weatherData.length > 0) {
        const last = weatherData[weatherData.length - 1];
        details.innerHTML = `
            <div class="col-12">
                <div class="card bg-light border-0 shadow-sm mb-3">
                    <div class="card-body d-flex justify-content-around align-items-center">
                        <div><strong>Air Temp:</strong> ${last.air_temperature}°C</div>
                        <div><strong>Track Temp:</strong> ${last.track_temperature}°C</div>
                        <div><strong>Humidity:</strong> ${last.humidity}%</div>
                        <div><strong>Wheather:</strong> ${last.rainfall === "1" ? '🌧️' : '☀️'}</div>
                    </div>
                </div>
            </div>
        `;
    }
}

function setButtonInfo(){

    const btn = document.getElementById('btn-dashboard');

    btn.addEventListener('click', () => {
        const sessionKey = btn.getAttribute('data-session');

        const url = new URL(window.location.origin + '/assets/page/infoSessione.html');
        url.searchParams.append('session_key', state.sessione);
        url.searchParams.append('meeting_key', state.meeting);
        url.searchParams.append('year', state.anno)
        url.searchParams.append('imgUrl', state.imgUrl)
        url.searchParams.append('flagUrl', state.flagUrl)

        window.location.href = url.href;
    });
}