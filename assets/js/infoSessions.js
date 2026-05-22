import { getSession } from "./api.js";

const state = {
    anno: null,
    meeting: null,
    sessione: null,
    imgUrl: null,
    flagUrl: null
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

document.addEventListener('DOMContentLoaded', async () => {
    const queryParams = new URLSearchParams(window.location.search);
    console.log(queryParams)
    state.sessione = queryParams.get('session_key');
    state.meeting = queryParams.get('meeting_key');
    state.anno = queryParams.get('year')
    state.imgUrl = queryParams.get('imgUrl')
    state.flagUrl = queryParams.get('flagUrl')

    console.log(state)

    try {

        let data = await getSession(null, state.sessione, null);
        data = data[0]
        console.log(data)
        while(data == null){
            wait(3000)
            data = await getSession(null, state.sessione, null);
        }

       let wrapper = document.getElementById("wrapper")
        console.log(data.session_name)
       wrapper.innerHTML = `
       
       <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
            <div>
                <h1 id="det-circuit-name" class="f1-bold text-uppercase m-0">${data.circuit_short_name}</h1>
                <p id="det-location" class="text-muted f1-regular m-0">${data.country_name}</p>
            </div>
            <img id="det-flag" src="${state.flagUrl}" alt="Bandiera" class="img-fluid" style="width: 80px; border-radius: 4px;">
        </div>

        <div class="row">
            <div class="col-md-4 text-center mb-4">
                <div class="circuit-detail-container p-4" style="background: #15151e; border-radius: 15px;">
                    <img id="det-circuit-map" src="${state.imgUrl}" alt="Mappa" class="img-fluid" style="filter: invert(1); max-height: 250px;">
                </div>
            </div>

            <div class="col-md-8">
                <div class="table-responsive">
                    <table class="table table-dark table-hover f1-regular">
                        <tbody>
                            <tr><th class="text-danger">SESSION NAME</th><td id="det-session-name">${data.session_name}</td></tr>
                            <tr><th class="text-danger">SESSION TYPE</th><td id="det-session-type">${data.session_type}</td></tr>
                            <tr><th class="text-danger">START DATE</th><td id="det-date-start">${data.date_start}</td></tr>
                            <tr><th class="text-danger">END DATE</th><td id="det-date-end">${data.date_end}</td></tr>
                            <tr><th class="text-danger">GMT OFFSET</th><td id="det-gmt">${data.gmt_offset}</td></tr>
                            <tr><th class="text-danger">CIRCUIT KEY</th><td id="det-circuit-key">${data.circuit_key}</td></tr>
                            <tr><th class="text-danger">SESSION KEY</th><td id="det-session-key">${state.sessione}</td></tr>
                            <tr><th class="text-danger">STATUS</th><td id="det-status">${data.is_cancelled == true ? "Cancellata" : "Confermata"}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `
        
    } catch (error) {
        console.error("Errore nel recupero dati:", error);
    }
});