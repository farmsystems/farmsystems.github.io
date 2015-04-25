
var SubmitTrades = function(submit_table_id, team1_id, team2_id) {
    this._table_id = submit_table_id;
    this._team1_id = team1_id;
    this._team2_id = team2_id;
    this.table = $('#' + submit_table_id);
    this.active_datatable = null;
    this.config = {
        num_propsect_spots: 6,
        tradeSentMsg_success: 'The trade proposal was successfully submitted (You can view it in <i>Pending Trades</i>)'
    };
    this._init();
};


SubmitTrades.prototype._init = function() {
    $('#' + this._team1_id).chosen();
    $('#' + this._team2_id).chosen();
    var table = $('#' + this._table_id);
    table.find('tbody').find('select').chosen({display_disabled_options: false});
    this._teamSelection();
    // chosen doesn't work so well for some reason with hidden tables
    table.find('.chosen-container.chosen-container-single').attr('style', 'width: 220px;');
};


SubmitTrades.prototype.sortJsonPlayers = function(a, b) {
    if (!('player' in a)) {
        return 1;
    } else if (!('player' in b)) {
        return -1;
    }
    var a_names = a.player.split(' ');
    var b_names = b.player.split(' ');
    var a_last = a_names[a_names.length - 1];
    var b_last = b_names[b_names.length - 1];
    return (a_last < b_last ? -1 : (a_last > b_last ? 1 : 0));
};


SubmitTrades.prototype.getTeamProspects = function(team, column) {
    var query = encodeURIComponent(JSON.stringify({"team" : team}));
    var that = this;
    var table_id = this._table_id;
    $.ajax({
        url: config.config.mongolabURL + config.config.team_prospectsURL + '?q=' + query + '&apiKey=' + config.key(),
        dataType: 'json',
        type: 'GET'
    }).done(function(data){
        var prospects = [];
        $.each(data, function(index, player){
            prospects.push(player);
        });
        prospects.sort(that.sortJsonPlayers);

        var prospect_selects = $('#' + table_id)
            .find('tbody')
            .find('td:nth-child(' + (column + 1) + ')')
            .find('select');

        prospect_selects.empty();
        prospect_selects.append('<option></option>');

        $('#team' + column + '-p1').append($('<option></option>').attr('value', 'No Prospects').html("[No Prospects]"));

        $.each(prospects, function(index, player){
            var prospect_option = $('<option></option>');
            prospect_option.attr('value', player._id.$oid);
            prospect_option.html(player.player + ' - ' + player.mlb_team + ' - ' + player.pos);
            prospect_selects.append(prospect_option);
        });
        prospect_selects.append('<option value="none">[None]</option>');
        $('.chosen-select').trigger("chosen:updated");
    });
};


/**
 * Returns all selected players including 'No Prospects' so take that into account, but not 'None'
 * @param column
 * @returns {Array}
 */
SubmitTrades.prototype.getSelectedPlayers = function(column) {
    var player_ids = [];
    for(var i = 1; i <= this.config.num_propsect_spots; ++i) {
        var player_id = $('#team' + column + '-p' + i).find('option:selected').val();
        if (player_id !== '' && player_id !== 'none') {
            player_ids.push(player_id);
        }
    }
    return player_ids;
};


/**
 * Get prospects who are not selected (by determine who are selected)
 * @param column                team/column #
 * @param _selected_players     (optional)
 */
SubmitTrades.prototype.getNonSelectedPlayers = function(column, _selected_players) {
    var selected_players = typeof _selected_players !== 'undefined' ? _selected_players : this.getSelectedPlayers(column);
    var player_ids = [];
    $('#team' + column + '-p1').find('option').each(function(index, option){
        var player_id = option.getAttribute('value');
        if (player_id && selected_players.indexOf(player_id) < 0 && player_id !== 'none') {
            player_ids.push(player_id);
        }
    });
    return player_ids;
};


/**
 * Enables and disables players in the select options
 * @param column
 * @param exclude_select    The current select input
 */
SubmitTrades.prototype.updatePlayerSelects = function(column, exclude_select) {
    var disable_players = this.getSelectedPlayers(column);
    var enabled_players = this.getNonSelectedPlayers(column, disable_players);
    var form = $('#' + this._table_id);
    var prospect_selects = form.find('tbody')
        .find('td:nth-child(' + (column + 1) + ')');

    var all_but_current = prospect_selects
        .find('select[id!="' + exclude_select + '"]');

    $.each(disable_players, function(index, player_id){
        if (player_id !== 'No Prospects') {
            all_but_current.find('option[value="' + player_id + '"]').attr('disabled', 'disabled');
        }
    });
    $.each(enabled_players, function(index, player_id){
        if (player_id !== 'No Prospects') {
            prospect_selects.find('option[value="' + player_id + '"]').removeAttr('disabled');
        }
    });
    $('.chosen-select').trigger("chosen:updated");
};


SubmitTrades.prototype.clearTable = function() {
    var team1_select = $('#' + this._team1_id);
    var team2_select = $('#' + this._team2_id);
    team1_select.val('');
    team1_select.find('option').removeAttr('disabled');
    team2_select.val('');
    team2_select.find('option').removeAttr('disabled');

    var trade_form = $('#' + this._table_id);
    var column1 = trade_form.find('tbody').find('td:nth-child(2)').find('select');
    var column2 = trade_form.find('tbody').find('td:nth-child(3)').find('select');
    column1.empty();
    column1.append('<option></option>');

    column2.empty();
    column2.append('<option></option>');

    $('.chosen-select').trigger("chosen:updated");
};


SubmitTrades.prototype._teamSelection = function() {
    var team1_id = this._team1_id;
    var team2_id = this._team2_id;
    var that = this;
    $('#' + team1_id).change(function() {
        var team = $('#' + team1_id).find('option:selected').val();
        // Disable select in other selector
        var team2 = $('#' + team2_id);
        team2.find('option[value!="' + team + '"]').removeAttr('disabled');
        team2.find('option[value="' + team + '"]').attr('disabled', 'disabled');
        $('.chosen-select').trigger("chosen:updated");

        // Get Prospects for menu
        that.getTeamProspects(team, 1);
    });

    $('#' + team2_id).change(function() {
        var team = $('#' + team2_id).find('option:selected').val();
        // Disable select in other selector
        var team1 = $('#' + team1_id);
        team1.find('option[value!="' + team + '"]').removeAttr('disabled');
        team1.find('option[value="' + team + '"]').attr('disabled', 'disabled');
        $('.chosen-select').trigger("chosen:updated");

        // Get Prospects for menu
        that.getTeamProspects(team, 2);
    });

    var submit_trade_form = $('#' + this._table_id);

    submit_trade_form.find('tbody').find('td:nth-child(2)').change(function(e) {
        that.updatePlayerSelects(1, this.id);
    });

    submit_trade_form.find('tbody').find('td:nth-child(3)').change(function() {
        that.updatePlayerSelects(2, this.id);
    });
};





SubmitTrades.prototype.sendTradeProposal = function(trade_proposal_json) {
    var that = this;
    return $.ajax({
        url: config.config.mongolabURL + config.config.pending_tradesURL + '?apiKey=' + config.key(),
        data: trade_proposal_json,
        contentType: 'application/json',
        type: 'POST'
    }).done(function(data){
        config.showSuccess('Success', that.config.tradeSentMsg_success);
        that.clearTable();
        config.restoreSavingBtn(config.elements.submit_trade_btn);
        return true;
    }).fail(function(){
        config.showError('Error', 'Failed to send Trade Proposal (Network connection issues?)');
        config.restoreSavingBtn(config.elements.submit_trade_btn);
        return false;
    });
};

/**
 *
 * @returns boolean (false) if error | json
 */
SubmitTrades.prototype.getTradeProposalAsJson = function() {
    var team1 = $('#' + this._team1_id).find('option:selected').val();
    var team2 = $('#' + this._team2_id).find('option:selected').val();

    var team1_players = this.getSelectedPlayers(1);
    var team2_players = this.getSelectedPlayers(2);

    if ((team1_players.length === 0 || team2_players.length === 0) ||
        ($.inArray('No Prospects', team1_players) >= 0 && $.inArray('No Prospects', team2_players) >= 0)) {
        return false;
    }

    return {
        'team1': {
            'team': team1,
            'offering': $.inArray('No Prospects', team1_players) < 0 ? team1_players : ['No Prospects']
        },
        'team2': {
            'team': team2,
            'offering': $.inArray('No Prospects', team2_players) < 0 ? team2_players : ['No Prospects']
        },
        'timestamp': config.getPCT().toLocaleString()
    }
};


SubmitTrades.prototype.attachButtonActions = function() {
    var that = this;

    // Button in the submit trades section
    config.elements.submit_trade_btn.on('click', function(e) {
        e.preventDefault();
        config.showSavingBtn(config.elements.submit_trade_btn, 'Submitting...');
        var trade_proposal_json = that.getTradeProposalAsJson();
        if (trade_proposal_json) {
            that.sendTradeProposal(JSON.stringify(trade_proposal_json));
        } else {
            config.showError('Invalid Trade Proposal', 'If one team is trading no prospects, select \'[No Prospects]\'');
        }
        config.restoreSavingBtn(config.elements.submit_trade_btn);
    });

    config.elements.cancel_trade_btn.on('click', function(e) {
        e.preventDefault();
        that.clearTable();
    });
};
