"use strict";

function initTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
};

function insertEvents(course, from, to) {
    $.ajax({
        url: `/api/getRaplaEvents/${course}?from=${from}&to=${to}`,
        xhrFields: { withCredentials: true }
    }).done(function (data) {
        $('#eventInsert').append(data);
        adjustDays();
    });
}

function adjustDays() {
    var days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    var dayCols = [2, 6, 10, 14, 18, 22, 26];
    days.forEach((day, dayindex) => {
        for (let i = 0; i < 44; i++) {
            var eventsAtRow = [];
            $('[data-day=' + day + ']').each((index, element) => {
                var rowStart = Math.floor(((parseInt($(element).attr("data-starthour")) - 8) * 60 + parseInt($(element).attr("data-startminute"))) / 15);
                var rowEnd = Math.floor(((parseInt($(element).attr("data-starthour")) - 8) * 60 + parseInt($(element).attr("data-startminute")) + parseInt($(element).attr("data-duration"))) / 15);
                if (rowStart <= i && rowEnd >= i) eventsAtRow.push(element);
            });
            if (eventsAtRow.length == 2) {
                eventsAtRow.forEach((ki) => {
                    $(ki).removeClass("ki-colspan-4");
                    $(ki).addClass("ki-colspan-2");
                });
                $(eventsAtRow[1]).removeClass('ki-day-' + day);
                $(eventsAtRow[1]).addClass('ki-col-' + (dayCols[dayindex] + 2));
            }
            if (eventsAtRow.length == 3) {
                eventsAtRow.forEach((ki) => {
                    $(ki).removeClass("ki-colspan-4");
                    $(ki).addClass("ki-colspan-1");
                });
                $(eventsAtRow[1]).removeClass('ki-day-' + day);
                $(eventsAtRow[1]).addClass('ki-col-' + (dayCols[dayindex] + 1));
                $(eventsAtRow[2]).removeClass('ki-day-' + day);
                $(eventsAtRow[2]).addClass('ki-col-' + (dayCols[dayindex] + 2));
            }
            if (eventsAtRow.length >= 4) {
                eventsAtRow.forEach((ki) => {
                    $(ki).removeClass("ki-colspan-4");
                    $(ki).addClass("ki-colspan-1");
                });
                $(eventsAtRow[1]).removeClass('ki-day-' + day);
                $(eventsAtRow[1]).addClass('ki-col-' + (dayCols[dayindex] + 1));
                $(eventsAtRow[2]).removeClass('ki-day-' + day);
                $(eventsAtRow[2]).addClass('ki-col-' + (dayCols[dayindex] + 2));
                $(eventsAtRow[3]).removeClass('ki-day-' + day);
                $(eventsAtRow[3]).addClass('ki-col-' + (dayCols[dayindex] + 3));
            }
        }
    });
}

Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function getWeekRange(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    var ISOweekEnd;
    if (dow <= 4) {
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    }
    else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    ISOweekEnd = addDays(ISOweekStart, 6);
    ISOweekEnd.setHours(23, 59, 59);
    return {
        startDay: ISOweekStart, endDay: ISOweekEnd
    };
}


$(() => {
    let queryString = new URLSearchParams(window.location.search);
    let calweek, calyear, nextweek, prevweek, nextyear, prevyear;

    if (queryString.get("calweek")) {
        calweek = parseInt(queryString.get("calweek"));
    } else {
        calweek = new Date().getWeek();
    }
    if (queryString.get("calyear")) {
        calyear = parseInt(queryString.get("calyear"));
    } else {
        calyear = new Date().getFullYear();
    }
    if (calweek == 52) {
        nextyear = calyear + 1;
        nextweek = 1;
    } else {
        nextyear = calyear;
        nextweek = calweek + 1;
    }
    if (calweek == 1) {
        prevyear = calyear - 1;
        prevweek = 52;
    } else {
        prevyear = calyear;
        prevweek = calweek - 1;
    }
    let weekRange = getWeekRange(calweek, calyear);

    $('#calweek').text('KW ' + calweek + " (" + weekRange.startDay.toLocaleDateString() + " - " + weekRange.endDay.toLocaleDateString() + ")");

    insertEvents("TINF21B1", weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
    initTooltips();

    $('#userSettingsForm').submit(function () {
        submitUserSettingsChange();
        return false;
    });
    $('#loginForm').submit(function () {
        submitLogin();
        return false;
    });
    $('#registrationForm').submit(function () {
        submitRegistration();
        return false;
    });
    $('#newEventForm').submit(function () {
        submitNewEvent();
        return false;
    });
    $('#editEventForm').submit(function () {
        submitEditEvent();
        return false;
    });
    $('#deleteEventForm').submit(function () {
        submitDeleteEvent();
        return false;
    });
});

/* UI events */
function editEvent(buttonClicked) {
    const eventId = buttonClicked.getAttribute("data-event-id");
    // TODO: get event information
    const editEventForm = document.forms["editEventForm"];
    editEventForm["editEventId"].value = eventId;
    console.log(eventId, editEventForm["editEventId"].value);
    editEventForm["editEventTitle"].value = "Ein zufälliger Titel";
    editEventForm["editEventDescription"].value = "Lorem ipsum";
    editEventForm["editEventCategory"].value = "Other";
    editEventForm["editEventLocation"].value = "Mond 🌛";
    editEventForm["editEventStart"].value = "2020-02-02T22:22";
    editEventForm["editEventEnd"].value = "2022-02-22T20:20";
}

function deleteEvent(buttonClicked) {
    const eventId = buttonClicked.getAttribute("data-event-id");
    // TODO: get event information
    const deleteEventForm = document.forms["deleteEventForm"];
    deleteEventForm["deleteEventId"].value = eventId;
    deleteEventForm["deleteEventTitle"].value = "Etwas zum Löschen";
    deleteEventForm["deleteEventDescription"].value = "Das ist definitiv löschbar";
    deleteEventForm["deleteEventCategory"].value = "Lecture";
    deleteEventForm["deleteEventLocation"].value = "An der DHBW";
    deleteEventForm["deleteEventStart"].value = "1970-01-01T08:00";
    deleteEventForm["deleteEventEnd"].value = "1970-01-01T09:30";
}

async function submitEditEvent() {
    const editEventForm = document.forms["editEventForm"];
    // TODO: send edited event
}

async function submitDeleteEvent() {
    const deleteEventForm = document.forms["deleteEventForm"];
    // TODO: send deleted event
}

async function submitNewEvent() {
    const newEventForm = document.forms["newEventForm"];
    // TODO: send new event
}

async function submitLogin() {
    console.log("login");
    const loginForm = document.forms["loginForm"];
    const email = loginForm["loginMail"].value;
    const password = loginForm["loginPassword"].value;
    console.log("login with", email);
    // TODO: login process
}

async function submitRegistration() {
    const registrationForm = document.forms["registrationForm"];
    const email = registrationForm["registrationMail"].value;
    const password = registrationForm["registrationPassword"].value;
    const firstName = registrationForm["registrationFirstName"].value;
    const lastName = registrationForm["registrationLastName"].value;
    console.log("user settings changed to", email, firstName, lastName);
    // TODO: registration process
}

function submitUserSettingsChange() {
    const userSettingsForm = document.forms["userSettingsForm"];
    const email = userSettingsForm["userSettingsMail"].value;
    const password = userSettingsForm["userSettingsPassword"].value;
    const firstName = userSettingsForm["userSettingsFirstName"].value;
    const lastName = userSettingsForm["userSettingsLastName"].value;
    console.log("user settings changed to", email, password, firstName, lastName);
    // TODO: userSettings process
}
