
var Config = function(message_id) {
    this.config = {
        mongolabURL: 'https://api.mongolab.com/api/1/databases/',
        mongolabApiKey: 'HIAnTqs9nA7nOr9qJW9PvrDkgfU9Ia0R',
        team_prospectsURL: 'baseball/collections/team_prospects',
        pending_tradesURL: 'baseball/collections/pending_trades',
        completed_tradesURL: 'baseball/collections/completed_trades'
    };

    this.elements = {
        content: null,
        table_body: null,
        prospects_btn: null,
        bryan_btn: null,
        cary_btn: null,
        larry_btn: null,
        mike_btn: null,
        mitchel_btn: null,
        tad_btn: null,
        completed_trades_btn: null,
        pending_trades_btn: null,
        submit_trades_btn: null,
        submit_trade_btn: null,
        cancel_trade_btn: null,
        message: null,
        page_link: null,
        submit_trade_sec: null,
        pending_trades_table: null,
        completed_trades_table: null
    };

    this.data = {
        prospects: {}
    };

    this.message_id = message_id ? message_id : 'message';
};


Config.prototype.showError = function(header, message) {
    $('#' + this.message_id).remove();
    var error_msg = $('<div></div>').attr('id', 'message')
        .attr('class', 'alert alert-danger alert-dismissible fade in')
        .attr('role', 'alert');

    var close_btn = $('<button></button>').attr('type', 'button')
        .attr('class', 'close')
        .attr('data-dismiss', 'alert')
        .attr('aria-label', 'Close');

    var close = $('<span></span>').attr('aria-hidden', 'true').html('&times;');
    close_btn.append(close);
    error_msg.append(close_btn);

    var header_html = $('<h4></h4>').html(header);
    var msg_html = $('<p></p>').html(message);

    error_msg.append(header_html).append(msg_html);

    this.elements.content.append(error_msg);
};

Config.prototype.showSuccess = function(header, message) {
    $('#' + this.message_id).remove();
    var error_msg = $('<div></div>').attr('id', 'message')
        .attr('class', 'alert alert-success fade in')
        .attr('role', 'alert');

    var close_btn = $('<button></button>').attr('type', 'button')
        .attr('class', 'close')
        .attr('data-dismiss', 'alert')
        .attr('aria-label', 'Close');

    var close = $('<span></span>').attr('aria-hidden', 'true').html('&times;');
    close_btn.append(close);
    error_msg.append(close_btn);

    var header_html = $('<h4></h4>').html(header);
    var msg_html = $('<p></p>').html(message);

    error_msg.append(header_html).append(msg_html);

    this.elements.content.append(error_msg);
};

Config.prototype.loadAllProspects = function(callback) {
    var that = this;
    $.ajax({
        url: this.config.mongolabURL + this.config.team_prospectsURL + '?apiKey=' + this.config.mongolabApiKey,
        dataType: 'json',
        type: 'GET'
    }).done(function(players){
        that.data.prospects = {};
        $.each(players, function(index, player){
            that.data.prospects[player._id['$oid']] = {
                'dob': player.dob,
                'fangraphs': player.fangraphs,
                'grade': player.grade,
                'mlb_team': player.mlb_team,
                'player': player.player,
                'pos': player.pos,
                'rank': player.rank,
                'team': player.team
            }
        });
        if (callback) {
            callback.load();
        }
    }).fail(function(){
        console.error("fail - prospects");
    });
};

Config.prototype.getPlayerFormat = function(player_id) {
    if (player_id === 'No Prospects') {
        return '[No Prospects]';
    }
    if (! (player_id in this.data.prospects)) {
        console.error('Couldn\'t find player with id: ' + player_id);
        return '';
    }
    var prospect = this.data.prospects[player_id];
    return prospect.player + ' - ' + prospect.mlb_team + ' - ' + prospect.pos;
};

Config.prototype.getPCT = function() {
    var offset = 3; // offset of PCT to UTC
    var d = new Date();

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    return new Date(utc + (3600000*offset))
};

Config.prototype.getUrlParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return '';
};

var config = new Config();
