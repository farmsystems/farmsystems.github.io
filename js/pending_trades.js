
var PendingTrades = function(pending_table_id) {
    this._table_id = pending_table_id;
    this.table = $('#' + pending_table_id);
    this.active_datatable = null;
    this.config = {
        table_headers: ['Occurred', 'Team 1', 'Offering', 'Team 2', 'Offering'],
        occurred_col: 0,
        team1_col: 1,
        team1_offering_col: 2,
        team2_col: 3,
        team2_offering_col: 4
    };
};


PendingTrades.prototype.init = function() {
    this._selectElements();
};


PendingTrades.prototype.buildTable = function(trades) {
    this._addHeaders();
    var that = this;
    $.each(trades, function(index, trade) {
        that._addTradeToTable(trade);
    })
};


PendingTrades.prototype.replaceData = function(data) {
    this._clearTable();
    this.buildTable(data);
};


PendingTrades.prototype._selectElements = function() {
    this.table = $('#' + this._table_id);
};


PendingTrades.prototype._clearTable = function() {
    if (this.active_datatable) {
        this.active_datatable.destroy();
    }
    this.table.empty();
};


PendingTrades.prototype._addHeaders = function() {
    var headers = $('<thead></thead>');
    var tr = $('<tr></tr>');
    $.each(this.config.table_headers, function(index, header) {
        var td = $('<td></td>').html(header);
        tr.append(td);
    });
    headers.append(tr);
    this.table.append(headers);
};


PendingTrades.prototype._addRow = function(teams, team1_offering, team2_offering, timestamp) {
    var row = $('<tr></tr>');
    var occurred = $('<td></td>').html(timestamp);
    var team1_name = $('<td></td>').html((teams[0]).toUpperCase());
    var team2_name = $('<td></td>').html((teams[1]).toUpperCase());
    var team1_players = $('<ul></ul>');
    var team2_players = $('<ul></ul>');
    $.each(team1_offering, function(index, player) {
        team1_players.append($('<li></li>').html(player));
    });
    $.each(team2_offering, function(index, player) {
        team2_players.append($('<li></li>').html(player));
    });
    row.append(occurred).append(team1_name);
    var bs1 = $('<td></td>').append(team1_players);
    var bs2 = $('<td></td>').append(team2_players);
    row.append(bs1).append(team2_name).append(bs2);

    this.table.append(row);
};


PendingTrades.prototype._addTradeToTable = function(trade_details) {
    var team1 = trade_details.team1;
    var team2 = trade_details.team2;
    var teams = [team1.team, team2.team];
    var team1_players = [];
    var team2_players = [];
    $.each(team1.offering, function(index, player_id){
        team1_players.push(config.getPlayerFormat(player_id));
    });
    $.each(team2.offering, function(index, player_id){
        team2_players.push(config.getPlayerFormat(player_id));
    });
    this._addRow(teams, team1_players, team2_players, trade_details.timestamp);
};

/**
 * Load Pending trades and build/replace the table with the data
 */
PendingTrades.prototype.load = function() {
    this._selectElements();
    var that = this;
    $.ajax({
        url: config.config.mongolabURL + config.config.pending_tradesURL + '?apiKey=' + config.config.mongolabApiKey,
        dataType: 'json',
        type: 'GET'
    }).done(function(pending_trades){
        if (that.active_datatable) {
            that.replaceData(pending_trades);
        } else {
            that.buildTable(pending_trades);
        }
        that.active_datatable = that.table.DataTable({
            "sDom": 'ltr',
            "bLengthChange": false,
            "columnDefs": [{
                "targets": that.config.occurred_col, "width": '20%'
            },{
                "targets": [ that.config.team1_offering_col, that.config.team2_offering_col ],
                "orderable": false
            }],
            "order": [[ 0, "desc" ]],
            "language": {
                "emptyTable": 'There are currently no pending trades'
            }
        });
    });
};
