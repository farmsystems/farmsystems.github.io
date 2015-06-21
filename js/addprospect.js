
function clearForm() {
    $('#player').val('');
    $('#mlb_team').val($("#mlb_team option:first").val());
    $('#team').val($("#team option:first").val());
    $('#pos').val($("#pos option:first").val());
    $('#year').val($("#year option:first").val());
    $('#month').val($("#month option:first").val());
    $('#day').val($("#day option:first").val());
    $('#rank').val($("#rank option:first").val());
    $('#fangraphs').val($("#fangraphs option:first").val());
    $('#grade').val($("#grade option:first").val());
    $('#fangraphs_id').val('');
}

function addPlayerToDB(data) {
    $.ajax({
        url: 'https://api.mongolab.com/api/1/databases/baseball/collections/team_prospects?apiKey=' +
            atob('SElBblRxczluQTduT3I5cUpXOVB2ckRrZ2ZVOUlhMFI='),
        data: JSON.stringify(data),
        contentType: 'application/json',
        type: 'POST'
    }).done(function(data){
        clearForm();
    });
}

function getProspectData() {
    var data = {};
    data['player'] = $('#player').val();
    data['mlb_team'] = $('#mlb_team').val();
    data['team'] = $('#team').val().toLowerCase();
    data['pos'] = $('#pos').val();
    data['dob'] = $('#dob').val();
    data['mlb_rank'] = $('#rank').val();
    data['fangraphs'] = $('#fangraphs').val();
    data['grade'] = $('#grade').val();
    data['fangraphs_id'] = $('#fangraphs_id').val();
    return data;
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

function addTeams(teams) {
    var team_select = $('#team');
    $.each(teams, function(index, team) {
        var option = '<option value="' + team + '">' + team.firstLetterToUpperCase() + '</option>';
        team_select.append(option);
    });
}

addTeams(['bryan', 'cary', 'larry', 'mike', 'mitchel', 'tad']);
addDob();
addMLBRank();
addFangraphsValue();

$('#submit').on('click', function(e) {
    e.preventDefault();
    if ($('#player').val() !== '') {
        addPlayerToDB(getProspectData());
    }
});

$('#cancel').on('click', function(e) {
    e.preventDefault();
    clearForm();
});