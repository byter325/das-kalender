"use strict";

// inspired by https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/;SameSite=Strict';
}

function getUID() {
    return getCookie('UID');
}

function getDarkMode() {
    return getCookie('DarkMode');
}

function getCurrentKw() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    var week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}

function insertCourseEvents(course, start, end) {
    $.ajax({
        url: `/api/calendar/${course}?start=${start}&end=${end}&type=HTML`,
        xhrFields: { withCredentials: true }
    }).done(function (data) {
        $('#eventGrid').after(data);
        adjustDays();
    });
    $.ajax({
        url: `/api/calendar/${course}?timeline=true&start=${start}&end=${end}&type=HTML`,
        xhrFields: { withCredentials: true }
    }).done(function (data) {
        $('#timelines').replaceWith(data);
        $('#timelines').show();
    });
}

function insertUserEvents(uid, from, to) {
    $.ajax({
        url: `/api/calendar/${uid}?type=HTML&start=${from}&end=${to}`,
        xhrFields: { withCredentials: true }
    }).done(function (data) {
        $('#eventGrid').after(data);
        adjustDays();
    });
}

function clearEvents(kalender, timeline) {
    if (kalender) { $('.kalenderitem').remove(); }
    if (timeline) { $('#timelines').html(''); }
}

function updateSite() {
    clearEvents(true, true);
    let weekRange = getWeekRange(window.calweek, window.calyear);
    $('#calweek').text('KW ' + window.calweek + ' (' + weekRange.startDay.toLocaleDateString() + ' - ' + weekRange.endDay.toLocaleDateString() + ')');
    // TODO: use user's group
    for (const group of window.groups) {
        insertCourseEvents(group.uid, weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
    }
    insertUserEvents(getUID(), weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
}

function adjustDays() {
    var days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    var dayCols = [2, 6, 10, 14, 18, 22, 26];
    days.forEach((day, dayindex) => {
        for (let i = 0; i < 44; i++) {
            var eventsAtRow = [];
            $('[data-day=' + day + ']').each((index, element) => {
                var rowStart = Math.floor(((parseInt($(element).attr('data-starthour')) - 8) * 60 + parseInt($(element).attr('data-startminute'))) / 15);
                var rowEnd = Math.floor(((parseInt($(element).attr('data-starthour')) - 8) * 60 + parseInt($(element).attr('data-startminute')) + parseInt($(element).attr('data-duration'))) / 15) - 1;
                if (rowStart <= i && rowEnd >= i) eventsAtRow.push(element);
            });
            if (eventsAtRow.length == 2) {
                eventsAtRow.forEach((ki) => {
                    $(ki).removeClass('ki-colspan-4');
                    $(ki).addClass('ki-colspan-2');
                });
                $(eventsAtRow[1]).removeClass('ki-day-' + day);
                $(eventsAtRow[1]).addClass('ki-col-' + (dayCols[dayindex] + 2));
            }
            if (eventsAtRow.length == 3) {
                eventsAtRow.forEach((ki) => {
                    $(ki).removeClass('ki-colspan-4');
                    $(ki).addClass('ki-colspan-1');
                });
                $(eventsAtRow[1]).removeClass('ki-day-' + day);
                $(eventsAtRow[1]).addClass('ki-col-' + (dayCols[dayindex] + 1));
                $(eventsAtRow[2]).removeClass('ki-day-' + day);
                $(eventsAtRow[2]).addClass('ki-col-' + (dayCols[dayindex] + 2));
            }
            if (eventsAtRow.length >= 4) {
                eventsAtRow.forEach((ki) => {
                    $(ki).removeClass('ki-colspan-4');
                    $(ki).addClass('ki-colspan-1');
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
    } else {
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    ISOweekEnd = addDays(ISOweekStart, 6);
    ISOweekEnd.setHours(23, 59, 59);
    return {
        startDay: ISOweekStart, endDay: ISOweekEnd
    };
}

function checkTokenCredentials() {
    const token = getCookie('AuthToken');
    if (token && token.length > 0) {
        $.get(`/api/users/${getUID()}`)
            .done(function (data) {
                console.log('Successful login', data);
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'application/xml');
                const isAdmin = doc.getElementsByTagName('isAdministrator')[0].textContent == 'true';
                const firstName = doc.getElementsByTagName('firstName')[0].textContent;
                const lastName = doc.getElementsByTagName('lastName')[0].textContent;
                const initials = doc.getElementsByTagName('initials')[0].textContent;
                const mail = doc.getElementsByTagName('mail')[0].textContent;
                const darkMode = doc.getElementsByTagName('darkMode')[0].textContent == 'true';
                const groups = doc.getElementsByTagName('group');
                const editableGroups = doc.getElementsByTagName('editableGroup');
                window.groups = [];
                window.editableGroups = [];
                for (const group of groups) {
                    const uid = group.getElementsByTagName('uid')[0].textContent;
                    const name = group.getElementsByTagName('name')[0].textContent;
                    window.groups.push({ uid, name });
                }
                for (const editableGroup of editableGroups) {
                    const uid = editableGroup.getElementsByTagName('uid')[0].textContent;
                    const name = editableGroup.getElementsByTagName('name')[0].textContent;
                    window.editableGroups.push({ uid, name });
                    window.groups.push({ uid, name });
                }

                if (firstName != undefined && lastName != undefined)
                    $('#profileUserName').text(`${firstName} ${lastName}`);
                if (darkMode != undefined)
                    handleDarkMode(false, darkMode);

                if (isAdmin) { $('#admin-tools').show(); }
                else { $('#admin-tools').hide(); }

                $('#loggedin-bar').show();
                $('#kalender').show(500);
                $('#button-row').show();
                $('#timelines').show(500);
                $('#login-and-registration').hide();

                updateSite();
            })
            .fail(function () {
                console.info('Login failed');
                doLogout();
            });
    } else {
        $('#loggedin-bar').hide();
        $('#kalender').hide();
        $('#button-row').hide();
        $('#timelines').hide();
        $('#login-and-registration').show(500);
        $('#admin-tools').hide();
    }
}

$(async () => {
    if (!window.hasOwnProperty('calweek')) {
        window.calweek = getCurrentKw();
    }
    if (!window.hasOwnProperty('calyear')) {
        window.calyear = new Date().getFullYear();
    }

    checkTokenCredentials();
    handleDarkMode();

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
    $('#logout-button').click(doLogout);
    $('#switchDarkMode').change(function () {
        handleDarkMode(getUID() != '', this.checked);
    });

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
    $('#buttonNewEvent').click(open)
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
    $('#adminManageGroupsButton').click(openAdminManageGroups);
    $('#adminManageGroupsForm').submit(function () {
        submitAdminManageGroups();
        return false;
    });
    $('#adminManageUsersButton').click(openAdminManageUsers);
    $('#adminManageUsersForm').submit(function () {
        submitAdminManageUsers();
        return false;
    });
    $('#buttonGenApiToken').click(genApiToken);
});

/* UI events */
function editEvent(buttonClicked) {
    const eventId = buttonClicked.getAttribute('data-event-id');
    const eventOwnerId = buttonClicked.getAttribute('data-event-owner-id');
    // TODO: get event information
    const editEventForm = document.forms['editEventForm'];
    editEventForm['editEventId'].value = eventId;
    console.log(eventId, editEventForm['editEventId'].value);
    editEventForm['editEventTitle'].value = 'Ein zufälliger Titel';
    editEventForm['editEventDescription'].value = 'Lorem ipsum';
    editEventForm['editEventCategory'].value = 'Other';
    editEventForm['editEventLocation'].value = 'Mond 🌛';
    editEventForm['editEventStart'].value = '2020-02-02T22:22';
    editEventForm['editEventEnd'].value = '2022-02-22T20:20';
    editEventForm['editEventOwnerId'].value = eventOwnerId;
}

function deleteEvent(buttonClicked) {
    const eventId = buttonClicked.getAttribute('data-event-id');
    // TODO: get event information
    const deleteEventForm = document.forms['deleteEventForm'];
    deleteEventForm['deleteEventId'].value = eventId;
    deleteEventForm['deleteEventTitle'].value = 'Etwas zum Löschen';
    deleteEventForm['deleteEventDescription'].value = 'Das ist definitiv löschbar';
    deleteEventForm['deleteEventCategory'].value = 'Lecture';
    deleteEventForm['deleteEventLocation'].value = 'An der DHBW';
    deleteEventForm['deleteEventStart'].value = '1970-01-01T08:00';
    deleteEventForm['deleteEventEnd'].value = '1970-01-01T09:30';
}

async function submitEditEvent() {
    const editEventForm = document.forms['editEventForm'];
    const eventId = editEventForm['editEventId'];
    const ownerId = editEventForm['editEventOwnerId'];
    const title = editEventForm['title'];
    const description = editEventForm['description'];
    const category = editEventForm['category'];
    const location = editEventForm['location'];
    const start = editEventForm['start'];
    const end = editEventForm['end'];
    $.ajax({
        type: 'PUT',
        url: '/api/calendar/' + ownerId + '?eventId=' + eventId,
        xhrFields: {
            withCredentials: true
        },
        data: {
            title,
            description,
            category,
            location,
            start,
            end
        }
    });
}

async function submitDeleteEvent() {
    const deleteEventForm = document.forms['deleteEventForm'];
    const uid = deleteEventForm['deleteEventId'];
    $.ajax({
        type: 'DELETE',
        url: '/api/calendar',
        xhrFields: {
            withCredentials: true
        },
        data: {
            uid
        }
    });
}

async function submitNewEvent() {
    const newEventForm = document.forms['newEventForm'];
    const title = newEventForm['newEventTitle'].value;
    const description = newEventForm['newEventDescription'].value;
    const category = newEventForm['newEventCategory'].value;
    const location = newEventForm['newEventLocation'].value;
    const start = newEventForm['newEventStart'].value;
    const end = newEventForm['newEventEnd'].value;

    $.post(`/api/calendar/${getUID()}`, {
        uid: 'placeholder',
        title,
        description,
        category,
        location,
        start,
        end
    });
}

async function submitLogin() {
    const loginForm = document.forms['loginForm'];
    const email = loginForm['loginMail'].value;
    const password = loginForm['loginPassword'].value;
    doLogin(email, password);
}

function doLogin(uid, password) {
    $('#loginRegistrationSpinner').show();
    $.post('/login', {
        loginMail: uid,
        loginPassword: password
    })
        .done(function () {
            $('#loginMessage').removeClass('alert-danger').addClass('alert-success').text('Login erfolgreich!').show();
            setTimeout(() => {
                checkTokenCredentials();
                $('#loginMessage').hide();
                document.forms['loginForm'].reset();
                document.forms['registrationForm'].reset();
            }, 1000);
        })
        .fail(function () {
            $('#loginMessage').removeClass('alert-success').addClass('alert-danger').text('Login fehlgeschlagen!').show();
        })
        .always(function () {
            $('#loginRegistrationSpinner').hide();
        });
}

function doLogout() {
    console.log('User logout');
    $.ajax({
        url: `/api/token?token=${getCookie('AuthToken')}`,
        method: 'DELETE'
    })
        .always(function () {
            setCookie('AuthToken', '', 0);
            setCookie('UID', '', 0);
            checkTokenCredentials();
            $('#profileUserName').text('Profil');
        });
}

async function submitRegistration() {
    const registrationForm = document.forms['registrationForm'];
    const email = registrationForm['registrationMail'].value;
    const password = registrationForm['registrationPassword'].value;
    const firstName = registrationForm['registrationFirstName'].value;
    const lastName = registrationForm['registrationLastName'].value;
    $('#loginRegistrationSpinner').show();
    $.post('/register', {
        registrationMail: email,
        registrationFirstName: firstName,
        registrationLastName: lastName,
        registrationPassword: password,
    })
        .done(function () {
            doLogin(email, password);
            document.forms['loginForm'].reset();
            document.forms['registrationForm'].reset();
        })
        .fail(function () { $('#loginRegistrationSpinner').hide(); })
    document.forms['loginForm'].reset();
    registrationForm.reset();
}

async function submitUserSettingsChange() {
    const userSettingsForm = document.forms['userSettingsForm'];
    const mail = userSettingsForm['userSettingsMail'].value;
    const password = userSettingsForm['userSettingsPassword'].value;
    const firstName = userSettingsForm['userSettingsFirstName'].value;
    const lastName = userSettingsForm['userSettingsLastName'].value;

    const user = {};
    user.uid = getUID()
    if (mail !== '') user.mail = mail;
    if (password !== '') user.passwordhash = password;
    if (firstName !== '') user.firstname = firstName;
    if (lastName !== '') user.lastname = lastName;

    $.ajax({
        url: `/api/users/${getUID()}`,
        method: 'PUT',
        data: { user }
    })
        .done(function () {
            userSettingsForm.reset();
            checkTokenCredentials();
        });
}

async function genApiToken() {
    $.ajax({
        url: '/api/token',
        method: 'POST',
        contentType: 'application/xml',
        data: `<Token><uid>${getUID()}</uid><unlimited>true</unlimited><validUntil>2022-07-16T15:12:31.960Z</validUntil></Token>`
    })
        .done(function (data) {
            console.info('API Token:', data);
            alert(`WARNUNG: Dieser API-Token ist nur einmal gültig.\n\nToken:\n${data}`);
        });
}

async function openAdminManageGroups() {
    const groupsList = $('#adminManageGroupsGroupsList');
    groupsList.html('<li class="list-group-item">Gruppen werden geladen...</li>');
    $.get('/api/groups')
        .done(function (data) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'application/xml');
            var adminManageGroupsGroupsList = '';
            const groups = doc.getElementsByTagName('groups')[0].getElementsByTagName('group');
            for (let i = 0; i < groups.length; i++) {
                const name = groups[i].getElementsByTagName('name')[0].textContent;
                const url = groups[i].getElementsByTagName('url')[0]?.textContent;
                adminManageGroupsGroupsList += url
                    ? `<li class="list-group-item">${name} (${url})</li>`
                    : `<li class="list-group-item">${name}</li>`;
            }
            groupsList.html(adminManageGroupsGroupsList);
        })
        .fail(function () {
            groupsList.html('<li class="list-group-item">Gruppen konnten nicht geladen werden.</li>')
        });
}

async function submitAdminManageGroups() {
    const adminManageGroupsForm = document.forms['adminManageGroupsForm'];
    const name = adminManageGroupsForm['adminManageGroupsName'].value;
    const uid = name;
    const url = adminManageGroupsForm['adminManageGroupsRaplaUrl'].value;
    console.log(name, url);
    $.post('/api/groups', { uid, name, url })
        .done(() => adminManageGroupsForm.reset())
        .always(openAdminManageGroups);
}

async function openAdminManageUsers() {
    $.get('/api/users')
        .done(function (data) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'application/xml');
            console.log(data);
            console.log(doc);
            const users = doc.getElementsByTagName('user');
            var tableContent = '';
            for (let i = 0; i < users.length; i++) {
                const uid = users[i].getElementsByTagName('uid')[0].textContent;
                const firstName = users[i].getElementsByTagName('firstName')[0].textContent;
                const lastName = users[i].getElementsByTagName('lastName')[0].textContent;
                const initials = users[i].getElementsByTagName('initials')[0].textContent;
                const mail = users[i].getElementsByTagName('mail')[0].textContent;
                const isAdministrator = users[i].getElementsByTagName('isAdministrator')[0].textContent;
                // console.log(firstName, lastName, initials, mail, isAdministrator);
                const tableRow = `<tr>
                    <td>${lastName}, ${firstName} (${initials})</td>
                    <td>${mail}</td>
                    <td>Gruppe TBD</td>
                    <td><input class="form-check-input checkbox-admin" type="checkbox" ${isAdministrator === 'true' ? 'checked="checked"' : ''}
                    data-uid="${uid}" data-first-name="${firstName}" data-last-name="${lastName}" data-mail="${mail}"\></td>
                    </tr>`;
                tableContent += tableRow;
            }
            $('#adminManageUsersTableBody').html(tableContent);

            $('.checkbox-admin').change(function () {
                const uid = this.getAttribute('data-uid');
                const firstName = this.getAttribute('data-first-name');
                const lastName = this.getAttribute('data-last-name');
                const mail = this.getAttribute('data-mail');
                const passwordHash = this.getAttribute('data-password-hash');
                const isAdministrator = this.checked ? 'true' : 'false';
                $.ajax({
                    url: `/api/users/${uid}`,
                    method: 'PUT',
                    data: { uid, firstName, lastName, mail, passwordHash, isAdministrator }
                })
                    .done(openAdminManageUsers);
            });
        });
}

async function submitAdminManageUsers() {
    // TODO
}

function setDarkMode(isDarkModeEnabled) {
    $('link[title="Light mode"]').prop('disabled', isDarkModeEnabled);
    $('link[title="Dark mode"]').prop('disabled', !isDarkModeEnabled);
}

async function handleDarkMode(sendToServer = false, darkMode = undefined) {
    if (darkMode != undefined)
        setCookie('DarkMode', darkMode, '0.5');
    var darkMode = getDarkMode() === 'true';
    $('#switchDarkMode').prop('checked', darkMode);
    setDarkMode(darkMode);
    if (sendToServer)
        $.ajax({
            url: `/api/users/${getUID()}`,
            method: 'PUT',
            data: {
                user: {
                    uid: getUID(),
                    darkmode: darkMode
                }
            }
        });
}
