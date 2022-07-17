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

class API {
    static postEvent({ ownerId, title, description, presenterFirstName, presenterLastName, presenterInitials, presenterMail, category, location, start, end }) {
        return $.ajax({
            url: `/api/calendar/${ownerId}`,
            method: 'POST',
            contentType: 'application/xml',
            data: `<Event>
            <uid>placeholder</uid>
            <title>${title}</title>
            <description>${description}</description>
            <presenter>
                <firstName>${presenterFirstName}</firstName>
                <lastName>${presenterLastName}</lastName>
                <initials>${presenterInitials}</initials>
                <mail>${presenterMail}</mail>
            </presenter>
            <modifiedBy>
                <firstName>${window.user.firstName}</firstName>
                <lastName>${window.user.lastName}</lastName>
                <mail>${window.user.mail}</mail>
                <initials>${window.user.initials}</initials>
            </modifiedBy>
            <modified>${(new Date()).toISOString()}</modified>
            <category>${category}</category>
            <location>${location}</location>
            <start>${(new Date(start)).toISOString()}</start>
            <end>${(new Date(end)).toISOString()}</end>
        </Event>`
        })
            .done(function () {
                updateSite();
            });
    }

    static deleteEvent({ ownerId, eventId }) {
        return $.ajax({
            type: 'DELETE',
            url: `/api/calendar/${ownerId}?eventID=${eventId}`
        })
            .fail(function () {
                alert('Sie können diesen Termin nicht löschen.');
            });
    }

    static getEvent({ ownerId, eventId }) {
        return $.get(`/api/calendar/${ownerId}`, { eventId });
    }

    static getUser({ userId }) {
        return $.get(`/api/users/${userId}`);
    }

    static getUsers() {
        return $.get('/api/users');
    }

    static deleteGroupsOfUser({ userId, type }) {
        return $.ajax({
            url: `/api/users/${userId}/groups?type=${type}`,
            method: 'DELETE',
        });
    }

    static putUser({ userId, userDoc }) {
        return $.ajax({
            url: `/api/users/${userId}`,
            method: 'PUT',
            contentType: 'application/xml',
            data: userDoc
        })
    }

    static deleteUser({ userId }) {
        return $.ajax({
            url: `/api/users/${userId}`,
            method: 'DELETE'
        })
    }

    static postLogin({ loginMail, loginPassword }) {
        return $.post('/login', { loginMail, loginPassword });
    }

    static deleteToken({ authToken }) {
        return $.ajax({
            url: `/api/token?token=${authToken}`,
            method: 'DELETE'
        });
    }

    static postRegister({ registrationMail, registrationFirstName, registrationLastName, registrationPassword }) {
        return $.post('/register', { registrationMail, registrationFirstName, registrationLastName, registrationPassword });
    }

    static postApiToken({ userId }) {
        return $.ajax({
            url: '/api/token',
            method: 'POST',
            contentType: 'application/xml',
            data: `<Token><uid>${userId}</uid><unlimited>true</unlimited><validUntil>${(new Date()).toISOString()}</validUntil></Token>`
        });
    }

    static getGroups() {
        return $.get('/api/groups');
    }

    static postGroups({ uid, name, url }) {
        return $.post('/api/groups', { uid, name, url });
    }

    static getGroups() {
        return $.get('/api/groups');
    }

    static getCalendar({ ownerId, start, end, type, timeline }) {
        if (timeline) {
            return $.get(`/api/calendar/${ownerId}`, { type, start, end, timeline });
        } else {
            return $.get(`/api/calendar/${ownerId}`, { type, start, end });
        }
    }
}

class FormParser {
    static fromEventForm(eventForm) {
        const title = eventForm['newEventTitle'].value;
        const description = eventForm['newEventDescription'].value;
        const category = eventForm['newEventCategory'].value;
        const location = eventForm['newEventLocation'].value;
        const start = eventForm['newEventStart'].value;
        const end = eventForm['newEventEnd'].value;
        const presenterFirstName = eventForm['newEventPresenterFirstName'].value;
        const presenterLastName = eventForm['newEventPresenterLastName'].value;
        var presenterInitials = eventForm['newEventPresenterInitials'].value;
        if (!presenterInitials.length && presenterFirstName.length && presenterLastName.length) {
            presenterInitials = `${presenterFirstName[0]}. ${presenterLastName[0]}.`;
        }
        const presenterMail = eventForm['newEventPresenterMail'].value;
        const owner = eventForm['newEventOwner'].value;
        const ownerId = owner.length == 0 ? getUserId() : owner;

        return { ownerId, title, description, presenterFirstName, presenterLastName, presenterInitials, presenterMail, category, location, start, end };
    }
}

function getUserId() {
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
    API.getCalendar({ ownerId: course, start, end, type: 'HTML', timeline: false })
        .done(function (data) {
            $('#eventGrid').after(data);
            adjustDays();
        });
    API.getCalendar({ ownerId: course, start, end, type: 'HTML', timeline: true })
        .done(function (data) {
            $('#timelines').replaceWith(data);
            $('#timelines').show();
        });
}

function insertUserEvents(userId, start, end) {
    API.getCalendar({ ownerId: userId, start, end, type: 'HTML', timeline: false })
        .done(function (data) {
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
    for (const group of window.groups) {
        insertCourseEvents(group.uid, weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
    }
    insertUserEvents(getUserId(), weekRange.startDay.toISOString(), weekRange.endDay.toISOString());
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

function parseXML(text) {
    return (new DOMParser()).parseFromString(text, 'application/xml');
}

function htmlEncode(text) {
    return text.replace(/[\u00A0-\u9999<>\&]/g, i => '&#' + i.charCodeAt(0) + ';');
}

function htmlDecode(input) {
    return (new DOMParser().parseFromString(input, 'text/html')).documentElement.textContent;
}

function checkTokenCredentials() {
    const token = getCookie('AuthToken');
    if (token && token.length > 0) {
        API.getUser({ userId: getUserId() })
            .done(function (data) {
                const doc = parseXML(data);
                const isAdmin = doc.getElementsByTagName('isAdministrator')[0].textContent == 'true';
                const firstName = doc.getElementsByTagName('firstName')[0].textContent;
                const lastName = doc.getElementsByTagName('lastName')[0].textContent;
                const initials = doc.getElementsByTagName('initials')[0].textContent;
                const mail = doc.getElementsByTagName('mail')[0].textContent;
                const darkMode = doc.getElementsByTagName('darkMode')[0].textContent == 'true';
                const groups = doc.getElementsByTagName('group');
                const editableGroups = doc.getElementsByTagName('editableGroup');
                window.user = { firstName, lastName, mail, initials };
                window.groups = [];
                window.editableGroups = [];
                for (const group of groups) {
                    const uid = group.getElementsByTagName('uid')[0].textContent;
                    const name = group.getElementsByTagName('name')[0].textContent;
                    window.groups.push({ uid, name });
                }
                $('.newEventOwnerOptionGroup').remove();
                for (const editableGroup of editableGroups) {
                    const uid = editableGroup.getElementsByTagName('uid')[0].textContent;
                    const name = editableGroup.getElementsByTagName('name')[0].textContent;
                    window.editableGroups.push({ uid, name });
                    window.groups.push({ uid, name });
                    $('#newEventOwner').append(`<option value="${uid}" class="newEventOwnerOptionGroup">${name} (Gruppe)</option>`);
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
        handleDarkMode(getUserId() != '', this.checked);
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
    $('#buttonGenApiToken').click(genApiToken);
});

async function insertEventDataIntoForm(ownerId, eventId, eventForm) {
    API.getEvent({ ownerId, eventId })
        .done(function (data) {
            console.log('event information', data);
            // TODO
            eventForm['editEventId'].value = eventId;
            eventForm['editEventTitle'].value = 'Ein zufälliger Titel';
            eventForm['editEventDescription'].value = 'Lorem ipsum';
            eventForm['editEventCategory'].value = 'Other';
            eventForm['editEventLocation'].value = 'Mond 🌛';
            eventForm['editEventStart'].value = '2020-02-02T22:22';
            eventForm['editEventEnd'].value = '2022-02-22T20:20';
            eventForm['editEventOwnerId'].value = ownerId;
        });
}

function openEditEvent(buttonClicked) {
    const eventId = buttonClicked.getAttribute('data-event-id');
    const eventOwnerId = buttonClicked.getAttribute('data-event-owner-id');
    const editEventForm = document.forms['editEventForm'];
    insertEventDataIntoForm(eventOwnerId, eventId, editEventForm);
}

function openDeleteEvent(buttonClicked) {
    const eventId = buttonClicked.getAttribute('data-event-id');
    const eventOwnerId = buttonClicked.getAttribute('data-event-owner-id');
    const deleteEventForm = document.forms['deleteEventForm'];
    insertEventDataIntoForm(eventOwnerId, eventId, deleteEventForm);
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
    const presenterFirstName = newEventForm['newEventPresenterFirstName'].value;
    const presenterLastName = newEventForm['newEventPresenterLastName'].value;
    var presenterInitials = newEventForm['newEventPresenterInitials'].value;
    if (!presenterInitials.length && presenterFirstName.length && presenterLastName.length) {
        presenterInitials = `${presenterFirstName[0]}. ${presenterLastName[0]}.`;
    }
    const presenterMail = newEventForm['newEventPresenterMail'].value;
    const owner = newEventForm['newEventOwner'].value;
    const ownerUid = owner.length == 0 ? getUserId() : owner;

    API.deleteEvent(ownerId, eventId)
        .then(function () {
            API.postEvent(ownerId, title, description, presenterFirstName, presenterLastName, presenterMail, category, location, start, end)
                .fail(function () {
                    alert('Termin konnte nicht geändert werden.');
                });
        })
        .fail(function () {
            alert('Termin konnte nicht geändert werden.');
        });
}

async function submitDeleteEvent() {
    const deleteEventForm = document.forms['deleteEventForm'];
    const eventId = deleteEventForm['editEventId'];
    const ownerId = deleteEventForm['editEventOwnerId'];
    API.deleteEvent(FormParser.fromEventForm(deleteEventForm));
}

async function submitNewEvent() {
    const newEventForm = document.forms['newEventForm'];
    API.postEvent(FormParser.fromEventForm(newEventForm));
}

async function submitLogin() {
    const loginForm = document.forms['loginForm'];
    const email = loginForm['loginMail'].value;
    const password = loginForm['loginPassword'].value;
    doLogin(email, password);
}

function doLogin(loginMail, loginPassword) {
    $('#loginRegistrationSpinner').show();
    API.postLogin({ loginMail, loginPassword })
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
    API.deleteToken(getCookie('AuthToken'))
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
    API.postRegister({
        registrationMail: email,
        registrationFirstName: firstName,
        registrationLastName: lastName,
        registrationPassword: password
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

    var user = `<uid>${getUserId()}</uid>`;
    if (mail !== '') user += `<mail>${mail}</mail>`;
    if (password !== '') user += `<passwordHash>${password}</passwordHash>`;
    if (firstName !== '') user += `<firstName>${firstName}</firstName>`;
    if (lastName !== '') user += `<lastName>${lastName}</lastName>`;
    API.putUser({ userId: getUserId(), userDoc: `<User>${user}</User>` })
        .done(function () {
            userSettingsForm.reset();
            checkTokenCredentials();
        });
}

async function genApiToken() {
    API.postApiToken({ userId: getUserId() })
        .done(function (data) {
            console.info('API Token:', data);
            alert(`WARNUNG: Dieser API-Token ist nur einmal gültig.\n\nToken:\n${data}`);
        });
}

async function openAdminManageGroups() {
    const groupsList = $('#adminManageGroupsGroupsList');
    groupsList.html('<li class="list-group-item">Gruppen werden geladen...</li>');
    API.getGroups()
        .done(function (data) {
            const doc = parseXML(data);
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
    const url = htmlEncode(adminManageGroupsForm['adminManageGroupsRaplaUrl'].value);
    console.log(name, url);
    API.postGroups({ uid, name, url })
        .done(() => adminManageGroupsForm.reset())
        .always(openAdminManageGroups);
}

async function openAdminManageUsers() {
    API.getGroups()
        .done(function (data) {
            const doc = parseXML(data);
            const groups = doc.getElementsByTagName('groups')[0].getElementsByTagName('group');
            const allGroups = [];
            for (let i = 0; i < groups.length; i++) {
                const uid = groups[i].getElementsByTagName('uid')[0].textContent;
                const name = groups[i].getElementsByTagName('name')[0].textContent;
                const url = htmlDecode(groups[i].getElementsByTagName('url')[0]?.textContent);
                allGroups.push({ uid, name, url });
            }

            API.getUsers()
                .done(function (data) {
                    const doc = parseXML(data);
                    const users = doc.getElementsByTagName('user');
                    $('#adminManageUsersTableBody').html('');
                    for (let i = 0; i < users.length; i++) {
                        const user = users[i];
                        const uid = user.getElementsByTagName('uid')[0].textContent;
                        const firstName = user.getElementsByTagName('firstName')[0].textContent;
                        const lastName = user.getElementsByTagName('lastName')[0].textContent;
                        const initials = user.getElementsByTagName('initials')[0].textContent;
                        const mail = user.getElementsByTagName('mail')[0].textContent;
                        const isAdministrator = user.getElementsByTagName('isAdministrator')[0].textContent;
                        const groups = new Set();
                        const editableGroups = new Set();
                        for (const group of user.getElementsByTagName('group')) {
                            const uid = group.getElementsByTagName('uid')[0].textContent;
                            groups.add(uid);
                        }
                        $('.newEventOwnerOptionGroup').remove();
                        for (const editableGroup of user.getElementsByTagName('editableGroup')) {
                            const uid = editableGroup.getElementsByTagName('uid')[0].textContent;
                            editableGroups.add(uid);
                        }
                        var groupsSelectedOptions = '';
                        var editableGroupsSelectedOptions = '';
                        for (const group of allGroups) {
                            groupsSelectedOptions += `<option value="${group.uid}" ${groups.has(group.uid) ? 'selected="selected"' : ''}>${group.name}</option>`;
                            editableGroupsSelectedOptions += `<option value="${group.uid}" ${editableGroups.has(group.uid) ? 'selected="selected"' : ''}>${group.name}</option>`;
                        }
                        const tableRow = `<tr>
                            <td>${lastName}, ${firstName} (${initials})</td>
                            <td>${mail}</td>
                            <td>
                            <a class="link" data-bs-toggle="collapse" href="#adminGroupSelects${uid}" role="button" aria-expanded="false" aria-controls="adminGroupSelects${uid}">Gruppen verwalten</a>
                            <div class="collapse pt-2" id="adminGroupSelects${uid}">
                                <label>Gruppen zum Anzeigen</label>
                                <select class="form-select form-select-sm adminSelectGroup mb-1" multiple="multiple" data-user="${uid}">${groupsSelectedOptions}</select>
                                <label>Gruppen zum Bearbeiten</label>
                                <select class="form-select form-select-sm adminSelectEditableGroup mb-1" multiple="multiple" data-user="${uid}">${editableGroupsSelectedOptions}</select>
                            </div>
                            <td><input class="form-check-input checkbox-admin" type="checkbox" ${isAdministrator === 'true' ? 'checked="checked"' : ''}
                            data-uid="${uid}" \></td>
                            <td>
                                <button type="button" class="btn btn-sm btn-danger adminDeleteUserButton" data-user="${uid}" data-username="${firstName} ${lastName}"><i class="bi bi-x"></i> Löschen</button>
                            </td>
                            </tr>`;
                        $('#adminManageUsersTableBody').append(tableRow);
                    }
                    $('.adminSelectGroup').change(function () {
                        const userId = this.getAttribute('data-user');
                        const groupUIDs = $(this).val();
                        const selectedGroups = allGroups.filter(group => groupUIDs.includes(group.uid));
                        if (selectedGroups.length == 0) {
                            API.deleteGroupsOfUser({ userId, type: 'group' })
                                .fail(function () {
                                    alert('Die Gruppen konnten nicht geändert werden.');
                                    openAdminManageUsers();
                                });
                        } else {
                            const selectedGroupsXml = selectedGroups.map(group => `<group><uid>${group.uid}</uid><name>${group.name}</name><url>${htmlEncode(group.url)}</url></group>`).join('');
                            API.putUser({ userId, userDoc: `<User><uid>${userId}</uid>${selectedGroupsXml}</User>` })
                                .fail(function () {
                                    alert('Die Gruppen konnten nicht geändert werden.');
                                    openAdminManageUsers();
                                });
                        }
                    });
                    $('.adminSelectEditableGroup').change(function () {
                        const userId = this.getAttribute('data-user');
                        const groupUIDs = $(this).val();
                        const selectedGroups = allGroups.filter(group => groupUIDs.includes(group.uid));
                        if (selectedGroups.length == 0) {
                            API.deleteGroupsOfUser({ userId, type: 'editableGroup' })
                                .fail(function () {
                                    alert('Die Gruppen konnten nicht geändert werden.');
                                    openAdminManageUsers();
                                });
                        } else {
                            const selectedGroupsXml = selectedGroups.map(group => `<editableGroup><uid>${group.uid}</uid><name>${group.name}</name><url>${htmlEncode(group.url)}</url></editableGroup>`).join('');
                            API.putUser({ userId, userDoc: `<User><uid>${userId}</uid>${selectedGroupsXml}</User>` })
                                .fail(function () {
                                    alert('Die Gruppen konnten nicht geändert werden.');
                                    openAdminManageUsers();
                                });
                        }
                    });
                    $('.adminDeleteUserButton').click(function () {
                        const userId = this.getAttribute('data-user');
                        const username = this.getAttribute('data-username');
                        if (confirm(`Sie sind dabei, ${username} zu löschen.`)) {
                            API.deleteUser({ userId })
                                .done(openAdminManageUsers);
                        }
                    });

                    $('.checkbox-admin').change(function () {
                        const userId = this.getAttribute('data-uid');
                        const isAdministrator = this.checked ? 'true' : 'false';
                        API.putUser({ uid: userId, userDoc: `<User><uid>${userId}</uid><isAdministrator>${isAdministrator}</isAdministrator></User>` })
                            .always(openAdminManageUsers);
                    });
                });
        });

}

function setDarkMode(isDarkModeEnabled) {
    $('link[title="Light mode"]').prop('disabled', isDarkModeEnabled);
    $('link[title="Dark mode"]').prop('disabled', !isDarkModeEnabled);
}

async function handleDarkMode(sendToServer = false, darkMode = undefined) {
    if (darkMode != undefined) {
        setCookie('DarkMode', darkMode, '0.5');
    }
    var darkMode = getDarkMode() === 'true';
    $('#switchDarkMode').prop('checked', darkMode);
    setDarkMode(darkMode);
    if (sendToServer) {
        API.putUser({ userId: getUserId(), userDoc: `<User><uid>${getUserId()}</uid><darkmode>${darkMode}</darkmode></User>` });
    }
}
