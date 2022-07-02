"use strict";

function getCurrentKw() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

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
        $('#eventGrid').after(data);
        adjustDays();
    });
}

function clearEvents() {
    $('.kalenderitem').remove();
}

function updateSite() {
    clearEvents();
    let weekRange = getWeekRange(window.calweek, window.calyear);
    $('#calweek').text('KW ' + window.calweek + " (" + weekRange.startDay.toLocaleDateString() + " - " + weekRange.endDay.toLocaleDateString() + ")");
    insertEvents("TINF21B1", weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
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
    if (!window.hasOwnProperty("calweek")) {
        window.calweek = getCurrentKw();
    }
    if (!window.hasOwnProperty("calyear")) {
        window.calyear = new Date().getFullYear();
    }

    initTooltips();

    $('#thisweek').click(() => {
        window.calweek = getCurrentKw();
        window.calyear = new Date().getFullYear();
        updateSite();
    });
    $('#prevweek').click(() => {
        if (window.calweek == 1) {
            window.calyear -= 1;
            window.calweek = 52;
        } else {
            window.calweek -= 1;
        }
        updateSite();
    });
    $('#nextweek').click(() => {
        if (window.calweek == 52) {
            window.calyear += 1;
            window.calweek = 1;
        } else {
            window.calweek += 1;
        }
        updateSite();
    });

    $('#userSettingsForm').submit(function () {
        (async () => userSettingsChange())();
        return false;
    });
    // $('#loginForm').submit(function () {
    //     (async () => login())();
    //     return false;
    // });
    // $('#registrationForm').submit(function () {
    //     (async () => registration())();
    //     return false;
    // });
    $('#newEventForm').submit(function () {
        (async () => newEvent())();
        return false;
    });
    $('#editEventForm').submit(function () {
        (async () => submitEditEvent())();
        return false;
    });
    $('#deleteEventForm').submit(function () {
        (async () => submitDeleteEvent())();
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

function submitEditEvent() {
    const editEventForm = document.forms["editEventForm"];
    // TODO: send edited event
}

function submitDeleteEvent() {
    const deleteEventForm = document.forms["deleteEventForm"];
    // TODO: send deleted event
}

function newEvent() {
    const newEventForm = document.forms["newEventForm"];
    // TODO: send new event
}

function login() {
    console.log("login");
    const loginForm = document.forms["loginForm"];
    const email = loginForm["loginMail"].value;
    const password = loginForm["loginPassword"].value;
    console.log("login with", email);
    $.ajax({
        type: 'POST',
        url: '/login',
        username: email,
        password: password,
        xhrFields: {
            withCredentials: true
        },
        statusCode: {
            200: () => {
                $('#loginMessage').removeClass("alert-danger d-none").addClass("alert-success").html("Login erfolgreich!");
                $('#loginModal').modal('hide');
                $('#loginBar').hide();
                $.ajax({
                    type: 'GET',
                    url: '/api/getActiveUser',
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function (data) {
                    var domParser = new DOMParser();
                    window.activeUser = domParser.parseFromString(data, "text/xml");
                    $('#statusInfo').removeClass("d-none").addClass("d-inline-block").html("Hallo, " + $(window.activeUser).find("firstName").text()).show();
                });
            },
            401: () => {
                $('#loginMessage').removeClass("alert-success d-none").addClass("alert-danger").html("Login fehlgeschlagen!");
            },
            500: () => {
                $('#loginMessage').removeClass("alert-success d-none").addClass("alert-danger").html("Login fehlgeschlagen!");
            }
        }
    });
}

function registration() {
    const registrationForm = document.forms["registrationForm"];
    const email = registrationForm["registrationMail"].value;
    const password = registrationForm["registrationPassword"].value;
    const firstName = registrationForm["registrationFirstName"].value;
    const lastName = registrationForm["registrationLastName"].value;
    console.log("user settings changed to", email, firstName, lastName);


    // TODO: registration process
}

function userSettingsChange() {
    const userSettingsForm = document.forms["userSettingsForm"];
    const email = userSettingsForm["userSettingsMail"].value;
    const password = userSettingsForm["userSettingsPassword"].value;
    const firstName = userSettingsForm["userSettingsFirstName"].value;
    const lastName = userSettingsForm["userSettingsLastName"].value;
    console.log("user settings changed to", email, password, firstName, lastName);
    // TODO: userSettings process
}
