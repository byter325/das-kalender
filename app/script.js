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

    $('#prevweek').html('<a href="?calweek=' + prevweek + '&calyear=' + prevyear + '"><i class="bi bi-arrow-left-circle"></i></a>');
    $('#nextweek').html('<a href="?calweek=' + nextweek + '&calyear=' + nextyear + '"><i class="bi bi-arrow-right-circle"></i></a>');
    $('#calweek').html('KW ' + calweek + ", " + calyear + "<br />" + weekRange.startDay.toLocaleDateString() + " - " + weekRange.endDay.toLocaleDateString());

    insertEvents("TINF21B1", weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
    initTooltips();
});