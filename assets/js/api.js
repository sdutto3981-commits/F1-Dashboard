const cache = new Map();

async function fetchData(endpoint, params = {}) {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
        if (val) urlParams.append(key, val);
    });

    const fullURL = `https://api.openf1.org/v1/${endpoint}?${urlParams.toString()}`;

    if (cache.has(fullURL)) {
        return cache.get(fullURL);
    }

    try {
        const response = await fetch(fullURL);
        if (!response.ok) throw new Error(`Errore API: ${response.status}`);
        const data = await response.json();
        
        cache.set(fullURL, data);
        return data;
    } catch (error) {
        console.error(`Errore nel recupero di ${endpoint}:`, error);
        return [];
    }
}

export async function getDrivers(draw, driver_number, session_key, meeting_key) {
    const data = await fetchData('drivers', { driver_number, session_key, meeting_key });
    if (draw && data.length) {
        const container = document.getElementById('drivers-list') || document.body;
        container.innerHTML = ""; 
        data.forEach(driver => cardDriver(driver));
    }
    return data;
}

export const getStartingGrid = (dn, sk, mk) => fetchData('starting_grid', { driver_number: dn, session_key: sk, meeting_key: mk });
export const getSession = (year, sk, mk) => fetchData('sessions', { year, session_key: sk, meeting_key: mk });
export const getSessionResult = (dn, sk, mk) => fetchData('session_result', { driver_number: dn, session_key: sk, meeting_key: mk });
export const getMeetings = (year, mk) => fetchData('meetings', { year, meeting_key: mk });
export const getLaps = (dn, sk, mk) => fetchData('laps', { driver_number: dn, session_key: sk, meeting_key: mk });
export const getOvertakes = (sk, mk) => fetchData('overtakes', { session_key: sk, meeting_key: mk });
export const getPit = (dn, sk, mk) => fetchData('pit', { driver_number: dn, session_key: sk, meeting_key: mk });
export const getPosition = (dn, sk, mk) => fetchData('position', { driver_number: dn, session_key: sk, meeting_key: mk });
export const getRaceControl = (dn, sk, mk) => fetchData('race_control', { driver_number: dn, session_key: sk, meeting_key: mk });
export const getWeather = (sk, mk) => fetchData('weather', { session_key: sk, meeting_key: mk });

export async function getMeetingImage(year, meeting_key) {
    const data = await getMeetings(year, meeting_key);
    return data.length > 0 ? data[0].circuit_image : null;
}

export async function getMeetingFlag(year, meeting_key) {
    const data = await getMeetings(year, meeting_key);
    return data.length > 0 ? data[0].country_flag : null;
}

export async function getSessionByName(name, year, mk) {
    const data = await getSession(year, null, mk);
    const session = data.find(e => e.session_name === name.split("-")[0]);
    return session ? session.session_key : null;
}

export async function getMeetingByName(name, year) {
    const data = await getMeetings(year);
    const meeting = data.find(e => e.meeting_name == name);
    return meeting ? meeting.meeting_key : null;
}

function cardDriver(driver) {
    const teamColor = `#${driver.team_colour || 'FFFFFF'}`;
    const cardHTML = `
        <div class="driver-card mb-3" style="--team-color: ${teamColor};">
            <div class="team-stripe"></div>
            <div class="row g-0 align-items-center">
                <div class="col-4 driver-img-container">
                    <img src="${driver.headshot_url}" class="img-fluid" alt="${driver.broadcast_name}">
                </div>
                <div class="col-8">
                    <div class="card-body p-3">
                        <p class="team-name mb-1">${driver.team_name}</p>
                        <h5 class="driver-name">${driver.first_name}<br><strong>${driver.last_name.toUpperCase()}</strong></h5>
                        <span class="driver-number">${driver.driver_number}</span>
                    </div>
                </div>
            </div>
        </div>`;
    const container = document.getElementById('drivers-list') || document.body;
    container.insertAdjacentHTML('beforeend', cardHTML);
}