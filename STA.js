let api = 'http://52.88.188.196:8080/api/api/where/';
let key = '?key=TEST';
let stopID = 'STA_ELMPUBWF';
let routeID = "";
let stopName = "";
let pcolor = '';
let scolor = '';
let imageurl = '';

$(document).ready(start);

function start() {
    getRoutes();
    $('#stopModal').modal('toggle');
    runApp();
    let timerId = setInterval(() => runApp(), 30000); //30 sec
    setTimeout(() => {
        clearInterval(timerId);
        alert('Clock Stopped');
    }, 14400000); //One Min
    $("#updateStyle").click(updateStyles);
    $("#updateStop").click(givedata2);
}

function runApp() {
    $("#app").replaceWith(`<div id=app></div>`);
    displayJumbotron();
    createTables();
}

function displayJumbotron() {
    $.get(`${api}current-time.json${key}`, function (data) {
        let curtime = formatTime(data.data.entry.time);
        $('#app').append(`
            <div class="jumbotron">
            <h1 id="curtime">${curtime}</h1>
            <h2 id="setStopID">${stopName}</h2>
            <div id="busComes"></div>
            </div>
        `);
    }, "jsonp");
}

function formatTime(time) {
    let fulldate = new Date(time);
    let hours = fulldate.getHours();
    let min = fulldate.getMinutes();
    if (hours > 12) {
        hours = hours - 12;
    };
    if (min < 10) {
        min = `0${min}`;
    };
    return (`${hours}:${min}`);
}

function createTables() {
    $.get(`${api}schedule-for-stop/${stopID}.json${key}`, function (data) {
        let schedule = data.data.entry.stopRouteSchedules;
        $('#app').append(`
            <h3 id="incoming" style="font-weight:700;">Incoming Busses</h3>
            <table id="table" class="table table-bordered">
            <thead id="nextBus">
            <tr>
                <th scope="col">Stops aways</th>
                <th scope="col">Route Number & Name</th>
                <th scope="col">Status</th>
                <th scope="col">Scheduled Arrival Time</th>
                <th scope="col">Estimated Arrival Time</th>
            </tr>
            </thead>
            </table>
            <table id="table2" class="table table-bordered">
            <tbody id="routesTable">
            <tr>
                <th scope="col" style="font-weight:800;">Available Routes</th>
            </tr>
            </tbody>
            </table>
        `);

        getArrivals();

        for (let i = 0; i < schedule.length; i++) {
            $('#routesTable').append(`
                <tr>
                <td scope="row" style="text-align:left;font-weight:600;">${schedule[i].routeId} ${schedule[i].stopRouteDirectionSchedules[0].tripHeadsign}</td>
                </tr>
            `);
        }
    }, "jsonp");
}

function getArrivals() {
    $.get(`${api}arrivals-and-departures-for-stop/${stopID}.json${key}&minutesAfter=60`, function (data) {
        if (data.data.entry.arrivalsAndDepartures[0] == null) {
            $('#nextBus').append(`
                <tr  class="bg-danger">
                <th colspan="4"> No Busses within the next hour </th>
                </tr>
            `);
        } else {
            for (let index = 0; index < data.data.entry.arrivalsAndDepartures.length; index++) {
                let nextBus = data.data.entry.arrivalsAndDepartures[index];
                let scheduledTime = formatTime(nextBus.scheduledArrivalTime);
                let estimatedTime = formatTime(nextBus.scheduledArrivalTime);
                if (nextBus.predictedArrivalTime != 0) {
                    estimatedTime = formatTime(nextBus.predictedArrivalTime);
                }
                let status = nextBus.tripStatus.status
                if (nextBus.tripStatus.status == 'SCHEDULED' || nextBus.tripStatus.status == 'default') {
                    status = 'On Time';
                } else {
                    status = 'Delayed';
                }

                if (nextBus.numberOfStopsAway >= 0) {
                    if (nextBus.numberOfStopsAway < 2) {
                        popUp(true, nextBus.routeShortName);
                    } else {
                        popUp(false, nextBus.routeShortName);
                    }

                    $('#nextBus').append(`
                        <tr  class="bg-warning">
                        <td>${nextBus.numberOfStopsAway}</td>
                        <th scope="row">${nextBus.routeShortName} - ${nextBus.routeLongName}</th>
                        <td>${status}</td>
                        <td>${scheduledTime}</td>
                        <td>${estimatedTime}</td>
                        </tr>
                    `);
                }
            }
        }
    }, "jsonp");
}

function getRoutes() {
    $.get(`${api}routes-for-agency/STA.json${key}`, function (data) {
        for (var i = 0; i < data.data.list.length; i++) {
            var stop = data.data.list[i];
            var dispName = stop.longName + " " + stop.shortName;
            $("#exampleFormControlSelect1").append(`
                <option value='${stop.id}'>${dispName}</option>
            `);
        }
    }, "jsonp");
}

function getStops() {
    $.get(`${api}stops-for-route/${routeID}.json${key}`, function (data) {
        for (var i = 0; i < data.data.entry.stopIds.length; i++) {
            var stop = data.data.entry.stopIds[i];
            $("#exampleFormControlSelect2").append(`
                <option value='${stop}'>${stop}</option>
            `);
        }
    }, "jsonp");
}

function popUp(tf, route) {
    console.log("ppopUp" + tf + " " + route);
    if (tf) {
        $('#busComes').append(`
            <div id="busComes" class="alert alert-warning alert-dismissible fade in">
                <h1><strong>Route ${route} Bus Will Arrive Shortly</strong></h1>
            </div>
    `);
    }
}

function updateStyles() {
    pcolor = $("#primarycolor").val();
    scolor = $("#secondarycolor").val();
    imageurl = $("#imageurl").val();
    $("body").css("color", `#${pcolor}`);
    $(".jumbotron").css("color", `#${pcolor}`);
    $(".btn.btn-primary").css("background-color", `#${pcolor}`);
    $("footer").css("color", `#${scolor}`);
    $("#logo").replaceWith(`<img id="logo" src="${imageurl}" alt="logo">`);
}

function givedata(id) {
    routeID = id;
    getStops();
}

function givedata2() {
    stopID = $("#exampleFormControlSelect2 option:selected").val();
    clearTables();
    createTables();
    getName();
    $('#styleModal').modal('toggle');
}

function getName() {
    $.get(`${api}stop/${stopID}.json${key}`, function (data) {
        stopName = data.data.entry.name;
        $('#setStopID').replaceWith(`
            <h2 id="setStopID">${stopName}</h2>   
        `);
    }, "jsonp");
}

function clearTables() {
    $('#incoming').replaceWith('');
    $('#table').replaceWith('');
    $('#table2').replaceWith('');
}