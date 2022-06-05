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
    }).done(function () {
        $('#eventInsert').append(data);
    });;
}

$(() => {
    initTooltips();
    insertEvents("TINF21B1", "2022-06-06", "2022-06-12");
});