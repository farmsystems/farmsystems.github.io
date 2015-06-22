
function resetForm() {
    $('#player').val($('#player').attr('default'));
    $('#mlb_team').val($('#mlb_team').attr('default'));
    $('#team').val($('#team').attr('default'));
    $('#pos').val($('#pos').attr('default'));
    $('#year').val($('#year').attr('default'));
    $('#month').val($('#month').attr('default'));
    $('#day').val($('#day').attr('default'));
    $('#rank').val($('#rank').attr('default'));
    $('#fangraphs').val($('#fangraphs').attr('default'));
    $('#grade').val($('#grade').attr('default'));
    $('#fangraphs_id').val($('#fangraphs_id').attr('default'));
}

function addPlayerToDB(data, redirect) {
    $.ajax({
        url: 'https://api.mongolab.com/api/1/databases/baseball/collections/team_prospects?apiKey=' +
            atob('SElBblRxczluQTduT3I5cUpXOVB2ckRrZ2ZVOUlhMFI='),
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST'
    }).done(function(data){
        resetForm();
        if (typeof redirect !== 'undefined' || redirect !== '') {
            //window.location.href = redirect;
        }
    });
}

function getProspectData() {
    var data = {};
    data['_id'] = { '$oid': getPlayerId() };
    data['team'] = getPlayersTeam();
    data['player'] = $('#player').val();
    data['mlb_team'] = $('#mlb_team').val();
    data['pos'] = $('#pos').val();
    var year = $('#year').val();
    var month = $('#month').val();
    var day = $('#day').val();
    data['dob'] = year + '-' + month + '-' + day;
    data['rank'] = $('#rank').val();
    data['fangraphs'] = $('#fangraphs').val();
    data['grade'] = $('#grade').val();
    data['fangraphs_id'] = $('#fangraphs_id').val();
    return data;
}

function populatePlayerData(player_data) {
    $.each(player_data, function(key, value) {
        if (key === 'dob') {
            var dob = value.split('-');
            var year = $('#year');
            var month = $('#month');
            var day = $('#day');
            year.val(parseInt(dob[0]));
            year.attr('default', parseInt(dob[0]));
            month.val(parseInt(dob[1]));
            month.attr('default', parseInt(dob[1]));
            day.val(parseInt(dob[2]));
            day.attr('default', parseInt(dob[2]));
        }
        if (key === 'team') {
            insertPlayersTeam(value);
        } else {
            var element = $('#' + key);
            element.val(value);
            element.attr('default', value);
        }
    })
}

function insertPlayersTeam(team) {
    $('#player').attr('team', team);
}

function getPlayersTeam() {
    return $('#player').attr('team');
}

function insertPlayerId(player_id) {
    $('#player').attr('player_id', player_id);
}

function getPlayerId() {
    return $('#player').attr('player_id');
}

function getProspectInfo() {
    var player_id = config.getUrlParameter('playerid');
    insertPlayerId(player_id);
    config.getProspect(player_id, populatePlayerData);
}

function addDob(maxYear, minYear, maxMonth, maxDay) {
    if (typeof maxYear === 'undefined' || maxYear <= 0) {
        maxYear = 2010;
    }
    if (typeof minYear === 'undefined' || minYear <= 0) {
        minYear = 1980;
    }
    if (typeof maxMonth === 'undefined' || maxMonth <= 0) {
        maxMonth = 12;
    }
    if (typeof maxDay === 'undefined' || maxDay <= 0) {
        maxDay = 31;
    }
    var year = $('#year');
    var month = $('#month');
    var day = $('#day');
    var i;
    var option = null;
    for (i = minYear; i <= maxYear; ++i) {
        option = '<option value="' + i + '">' + i + '</option>';
        year.append(option);
    }
    for (i = 1; i <= maxMonth; ++i) {
        option = '<option value="' + i + '">' + i + '</option>';
        month.append(option);
    }
    for (i = 1; i <= maxDay; ++i) {
        option = '<option value="' + i + '">' + i + '</option>';
        day.append(option);
    }
}

function addMLBRank(maxRank) {
    if (typeof maxRank === 'undefined' || maxRank <= 0) {
        maxRank = 100;
    }
    var rank = $('#rank');
    for (var i = 1; i <= maxRank; ++i) {
        var option = '<option value="' + i + '">' + i + '</option>';
        rank.append(option);
    }
}

function addFangraphsValue(maxValue, minValue) {
    if (typeof maxValue === 'undefined' || maxValue <= 0) {
        maxValue = 85;
    }
    if (typeof minValue === 'undefined' || minValue <= 0) {
        minValue = 35;
    }
    var fans = $('#fangraphs');
    for (var i = maxValue; i >= minValue; i -= 5) {
        var option = '<option value="' + i + '">' + i + '</option>';
        fans.append(option);
    }
}

function getReturnLink(basePage) {
    var returnPage = config.getUrlParameter('return');
    return basePage + (returnPage === '' ? '' : '?team=' + returnPage);
}


$('#update').on('click', function(e) {
    e.preventDefault();
    if ($('#player').val() !== '') {
        addPlayerToDB(getProspectData(), getReturnLink('index.html'));
    }
});

$('#reset').on('click', function(e) {
    e.preventDefault();
    resetForm();
});

$('#cancel').on('click', function(e) {
    e.preventDefault();
    window.location.href = getReturnLink('index.html');
});

$(document).ready(function() {
    addDob();
    addMLBRank();
    addFangraphsValue();
    getProspectInfo();
});