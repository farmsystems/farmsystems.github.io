
var Farmsystem = function(table_id, team_ids) {
    this.config = {
        position_column: 0,
        player_column: 1,
        mlb_team_column: 2,
        age_column: 3,
        grade_column: 4,
        mlb_rank_column: 5,
        fangraphs_column: 6,
        team_column: 7,
        actions_column: 8,
        columnDefs: [],
        teams: typeof team_ids === 'undefined' ? [] : team_ids
    };

    this._table_id = table_id ? table_id : 'prospects_table';

    this.elements = {
        table: null,
        active_datatable: null
    };

    this.submit_trades = null;
    this.pending_trades = null;
    this.completed_trades = null;

    this.columns = [{
        name: 'Position',
        key: 'pos',
        columnDef: { "width": '6%', "type": 'pos', "targets": this.config.position_column },
        classes: function(data) {
            return ['pos'];
        }
    },{
        name: 'Player',
        key: 'player',
        columnDef: { "width": '19%', "type": 'name', "targets": this.config.player_column },
        format: function(player_data) {
            if ('fangraphs_id' in player_data && player_data['fangraphs_id'] != '') {
                var url = config.config.fangraphs_playerURL + player_data['fangraphs_id'];
                return '<a href="' + url + '" target="_blank">' + player_data['player'] + '</a>';
            }
            return player_data['player'];
        },
        classes: function(data) {
            return ['player'];
        }
    },{
        name: 'MLB Team',
        key: 'mlb_team',
        columnDef: { "width": '12.5%', "targets": this.config.mlb_team_column },
        classes: function(data) {
            return ['mlb_team'];
        }
    },{
        name: 'Age',
        key: 'dob',
        columnDef: { "width": '8%', "targets": this.config.age_column },
        format: function(player_data) {
            var date = player_data['dob'];
            var dob = new Date(date.split('-'));
            var ageDifMs = Date.now() - dob.getTime();
            var ageDate = new Date(ageDifMs); // milliseconds from epoch
            return '<span title="' + date + '">' + Math.abs(ageDate.getUTCFullYear() - 1970) + '</span>';
        },
        classes: function(data) {
            return ['age'];
        }
    },{
        name: 'SB Nation Grade',
        key: 'grade',
        columnDef: { "width": '12.5%', "targets": this.config.grade_column },
        classes: function(data) {
            var _class = [];
            switch(data) {
                case 'A+':
                case 'A':
                case 'A-':
                    _class.push('grade_a');
                    break;
                case 'B+':
                case 'B':
                case 'B-':
                    _class.push('grade_b');
                    break;
                case 'C+':
                case 'C':
                case 'C-':
                    _class.push('grade_c');
                    break;
                case 'D+':
                case 'D':
                case 'D-':
                    _class.push('grade_d');
                    break;
                default:
                    _class.push('grade_low');
            }
            return _class;
        }
    },{
        name: 'MLB Rank',
        key: 'rank',
        columnDef: { "width": '12.5%', "type": 'rank', "targets": this.config.mlb_rank_column },
        classes: function(data) {
            return ['rank'];
        }
    },{
        name: 'Fangraphs Value',
        key: 'fangraphs',
        columnDef: { "width": '12.5%', "type": 'rank', "targets": this.config.fangraphs_column },
        classes: function(data) {
            return ['fangraphs'];
        }
    },{
        name: 'Under Control By',
        key: 'team',
        columnDef: { "width": '12.5%', "targets": this.config.team_column },
        classes: function(data) {
            return ['team'];
        },
        format: function(player_data) {
            var team = player_data['team'];
            return team.toUpperCase();
        }
    },{
        name: 'Actions',
        key: 'actions',
        columnDef: { "width": '12.5%', "targets": this.config.actions_column },
        no_data: function(player_data) {
            var id = player_data['_id']['$oid'] + "_update_btn";
            var classes = "action_btn update_btn";
            var href = "updateprospect.html?playerid=" + player_data['_id']['$oid'];
            return "<a id=\"" + id + "\" class=\"" + classes + "\" href=\"" + href + "\">Update</a>";
        }
    }];
};

/*
 *  Sorting
 */
Farmsystem.prototype.applyCustomSorting = function() {
    var that = this;
    $.fn.dataTableExt.oSort['rank-asc'] = function (a, b) {
        var x = parseInt(a);
        var y = parseInt(b);
        return ((isNaN(y) || x < y) ? -1 : ((isNaN(x) || x > y) ? 1 : 0));
    };
    $.fn.dataTableExt.oSort['rank-desc'] = function (a, b) {
        var x = parseInt(a);
        var y = parseInt(b);
        return ((isNaN(x) || x < y) ? 1 : ((isNaN(y) || x > y) ? -1 : 0));
    };

    $.fn.dataTableExt.oSort['pos-asc'] = function (a, b) {
        var x = that.posNum(a);
        var y = that.posNum(b);
        return x < y ? -1 : (x > y ? 1 : 0);
    };
    $.fn.dataTableExt.oSort['pos-desc'] = function (a, b) {
        var x = that.posNum(a);
        var y = that.posNum(b);
        return x < y ? 1 : (x > y ? -1 : 0);
    };

    $.fn.dataTableExt.oSort['name-asc'] = function (a, b) {
        var x = a.split(' ');
        var y = b.split(' ');
        return x[x.length - 1] < y[y.length - 1] ? -1 : (x[x.length - 1] > y[y.length - 1] ? 1 : 0);
    };
    $.fn.dataTableExt.oSort['name-desc'] = function (a, b) {
        var x = a.split(' ');
        var y = b.split(' ');
        return x[x.length - 1] < y[y.length - 1] ? 1 : (x[x.length - 1] > y[y.length - 1] ? -1 : 0);
    };
};


Farmsystem.prototype.posNum = function(pos) {
    switch (pos) {
        case 'RHP': return 0;
        case 'LHP': return 1;
        case 'C':   return 2;
        case '1B':  return 3;
        case '2B':  return 4;
        case '3B':  return 5;
        case 'SS':  return 6;
        case 'OF':
        case 'LF':  return 7;
        case 'CF':  return 8;
        case 'RF':  return 9;
        default:    return 10;
    }
};


Farmsystem.prototype.selectElements = function() {
    this.elements.table = $('#' + this._table_id);
    config.selectElements();
};


Farmsystem.prototype.init = function() {
    this.config.columnDefs = [];
    var that = this;
    $.each(this.columns, function(index, column) {
        that.config.columnDefs.push(column.columnDef)
    });
    config.setElementIds({}, {}, this.config.teams);
    this.applyCustomSorting();
    this.selectElements();
    this.submit_trades = new SubmitTrades('submit_trade_form', 'team1', 'team2', this.config.teams);
    this.pending_trades = new PendingTrades('pending_trades_table');
    this.completed_trades = new CompletedTrades('completed_trades_table');
    this.attachButtonActions();
};


Farmsystem.prototype.start = function() {
    config.loadAllProspects();
    this.init();
    config.elements.submit_trade_sec.addClass('hidden');
    var team = config.getUrlParameter('team');
    if (team === ''){
        this.showAllProspects();
    } else {
        team = team.toLowerCase();
        switch(team) {
            case 'completed':
                config.elements.completed_trades_btn.trigger('click');
                break;
            case 'pending':
                config.elements.pending_trades_btn.trigger('click');
                break;
            case 'submit':
                config.elements.submit_trades_btn.trigger('click');
                break;
            default:
                if (team in config.elements.team_menu_btns) {
                    config.elements.team_menu_btns[team].trigger('click');
                } else {
                    this.showAllProspects();
                }
        }
    }
};

/*
 *  Table
 */
/**
 * Destroy the datatable and clear the rows
 */
Farmsystem.prototype.clearTable = function() {
    if (this.elements.active_datatable) {
        this.elements.active_datatable.destroy();
    }
    this.elements.table.empty();
};


Farmsystem.prototype.showTeamData = function(team) {
    var query = encodeURIComponent(JSON.stringify({"team" : team}));
    var that = this;
    $.ajax({
        url: config.config.mongolabURL + config.config.team_prospectsURL + '?q=' + query + '&apiKey=' + config.key(),
        dataType: 'json',
        type: 'GET'
    }).done(function(data){
        config.elements.message.remove();
        config.elements.submit_trade_sec.addClass('hidden');
        that.elements.table.removeClass('hidden');
        if (that.elements.active_datatable) {
            that.replaceData(data);
        } else {
            that.buildTable(data);
        }
        that.elements.active_datatable = that.elements.table.DataTable({
            "sDom": 'ltr',
            "bLengthChange": false,
            "columnDefs": that.config.columnDefs.concat({
                "visible": false,
                "targets": that.config.team_column
            }),
            "language": {
                "emptyTable": 'This team doesn\'t seem to have any prospects'
            }
        });
    }).fail(function() {
        that.clearTable();
        config.showError('Error', config.error_msgs.receiving_players);
    });
};


Farmsystem.prototype.showAllProspects = function() {
    var that = this;
    $.ajax({
        url: config.config.mongolabURL + config.config.team_prospectsURL + '?apiKey=' + config.key(),
        dataType: 'json',
        type: 'GET'
    }).done(function(data){
        config.elements.message.remove();
        config.elements.submit_trade_sec.addClass('hidden');
        that.elements.table.removeClass('hidden');
        if (that.elements.active_datatable) {
            that.replaceData(data);
        } else {
            that.buildTable(data);
        }
        that.elements.active_datatable = that.elements.table.DataTable({
            "sDom": 'ltr',
            "bLengthChange": false,
            "columnDefs": that.config.columnDefs,
            "language": {
                "emptyTable": 'No prospects could be retrieved (Network Connection Problems?)'
            }
        });
    }).fail(function() {
        that.clearTable();
        config.showError('Error', config.error_msgs.receiving_players);
    });
};


Farmsystem.prototype.buildTable = function(data) {
    this._addHeaders();
    var that = this;
    $.each(data, function(index, player) {
        that._addRow(player);
    });
};


Farmsystem.prototype.replaceData = function(data) {
    this.clearTable();
    this.buildTable(data);
};


Farmsystem.prototype._addHeaders = function(){
    var headers = $('<thead></thead>');
    var tr = $('<tr></tr>');
    $.each(this.columns, function(index, column) {
        var td = $('<td></td>').html(column.name);
        tr.append(td);
    });
    headers.append(tr);
    this.elements.table.append(headers);
};


Farmsystem.prototype._addRow = function(row_data){
    var row = $('<tr></tr>');
    $.each(this.columns, function(index, column) {
        var cell = $('<td></td>');
        var cell_text = '';
        if (column.key in row_data) {
            if (column.classes) {
                cell.attr('class', column.classes(row_data[column.key]).join(' '));
            }
            if (column.format) {
                cell_text = column.format(row_data);
            } else {
                cell_text = row_data[column.key];
            }
        } else if (column.no_data) {
            cell_text = column.no_data(row_data);
        }
        cell.html(cell_text);
        row.append(cell);
    });
    this.elements.table.append(row);
};


Farmsystem.prototype.showProspectsTable = function() {
    $('#' + config.message_id).remove();
    $('.active').removeClass('active');
    this.elements.table.removeClass('hidden');
    config.elements.submit_trade_sec.addClass('hidden');
    config.elements.pending_trades_table.addClass('hidden');
    config.elements.completed_trades_table.addClass('hidden');
};


Farmsystem.prototype.showCompletedTrades = function() {
    $('#' + config.message_id).remove();
    $('.active').removeClass('active');
    this.elements.table.addClass('hidden');
    config.elements.submit_trade_sec.addClass('hidden');
    config.elements.pending_trades_table.addClass('hidden');
    config.elements.completed_trades_table.removeClass('hidden');
};


Farmsystem.prototype.showPendingTrades = function() {
    $('#' + config.message_id).remove();
    $('.active').removeClass('active');
    this.elements.table.addClass('hidden');
    config.elements.submit_trade_sec.addClass('hidden');
    config.elements.pending_trades_table.removeClass('hidden');
    config.elements.completed_trades_table.addClass('hidden');
};


Farmsystem.prototype.showSubmitTrades = function() {
    $('#' + config.message_id).remove();
    $('.active').removeClass('active');
    this.elements.table.addClass('hidden');
    config.elements.submit_trade_sec.removeClass('hidden');
    config.elements.pending_trades_table.addClass('hidden');
    config.elements.completed_trades_table.addClass('hidden');
};


Farmsystem.prototype.attachTeamMenuBtnActions = function() {
    var teams = Object.keys(config.elements.team_menu_btns);
    for (var i = 0; i < teams.length; ++i) {
        this._attachTeamMenuBtnToAction(teams[i]);
    }
};


Farmsystem.prototype._attachTeamMenuBtnToAction = function(team) {
    var that = this;
    config.elements.team_menu_btns[team].on('click', function(e) {
        e.preventDefault();
        that.showProspectsTable();
        config.elements.team_menu_btns[team].addClass('active');
        that.showTeamData(team);
        config.elements.page_link.attr('href', '?team=' + team);
    });
};


/*
 *  Interaction
 */
Farmsystem.prototype.attachButtonActions = function() {
    var that = this;
    config.elements.prospects_btn.on('click', function(e) {
        e.preventDefault();
        that.showProspectsTable();
        config.elements.prospects_btn.addClass('active');
        that.showAllProspects();
        config.elements.page_link.attr('href', '');
    });

    this.attachTeamMenuBtnActions();

    config.elements.completed_trades_btn.on('click', function(e) {
        e.preventDefault();
        that.showCompletedTrades();
        config.elements.completed_trades_btn.addClass('active');
        config.loadAllProspects(that.completed_trades);
        config.elements.page_link.attr('href', '?team=completed');
    });

    config.elements.pending_trades_btn.on('click', function(e) {
        e.preventDefault();
        that.showPendingTrades();
        config.elements.pending_trades_btn.addClass('active');
        config.loadAllProspects(that.pending_trades);
        config.elements.page_link.attr('href', '?team=pending');
    });

    // Submit trade button in menu
    config.elements.submit_trades_btn.on('click', function(e) {
        e.preventDefault();
        that.showSubmitTrades();
        config.elements.submit_trades_btn.addClass('active');
        config.elements.page_link.attr('href', '?team=submit');
    });

    this.submit_trades.attachButtonActions();
};
