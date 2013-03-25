//function to remove an element from an array by John Resig(creator of jQuery)
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

$(function () {

    var Templates = {};

    var CricManager = window.CricManager || {};

    CricManager.Players = {
        Biz: {
            viewHandle: 'CricManager.Players.View',
            playerList: [],
            filterList: [],
            playerType: '',
            playerTeam: '',
            playerName: '',

            seriesId: '18054817710736052',
            addPlayerToList: function (data) {
                //check so that no repeated players may enter
                var index = CricManager.Search.findIndex(this.playerList, data, 'PlayerId');
                if (index != -1) {
                    //INFO: assuming there would always be one entry
                    if (this.playerList[index].isSelected) {

                        
                        this.playerList[index].isSelected = false;
                        this.refreshFilters();
                        return true;
                    }

                    //copy data to filter list too as data is populated as per filterlist content
                    //this.viewHandle.refreshUI();
                    
                }
                return false;
            },
            findPlayers: function (data) {
                return CricManager.Search.findObject(this.playerList, data, "PlayerId")
            },

            //this function is not in use because we are not actually removing the player from the list
            //we are just disabling it.
            removePlayerFromList: function (data) {
                var index = CricManager.Search.findIndex(this.playerList, data, 'PlayerId');
                if (index != -1) {

                    this.playerList[index].isSelected = true;
                    this.refreshFilters();
                    return true;
                    //copy data to filter list too as data is populated as per filterlist content
                    //this.viewHandle.refreshUI();

                }
                return false;
            },

            //called each time when due to some condition new data is added
            refreshFilters: function () {
                this.changeFilter();
                //this.filterPlayersbyName();
            },
            changeFilter: function () {
                this.filterList = objectFilter(this.playerType, this.playerList, { property: 'PlayerType' });
                this.filterList = objectFilter(this.playerTeam, this.filterList, { property: 'ShortTeamName' });
                this.viewHandle.refreshUI();
            },
            sortPlayers: function (sortParam, sortOrder) {
                this.playerList = sortList(this.playerList, {
                    param: sortParam,
                    ascending: sortOrder == 'ascending'
                });
                this.filterList = this.playerList;
                this.viewHandle.refreshUI();
            },
            filterPlayersbyName: function () {
                this.filterList = objectFilter(this.playerName, this.playerList, { property: 'FirstName' });
                this.viewHandle.refreshUI();
            },

            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                this.viewHandle.showLoading();

                var tempPlayerList = [{ "FirstName": "Dale", "LastName": "Steyn", "MiddleName": "", "Nationality": "Overseas", "PlayerId": 123, "PlayerType": "Bowler", "Points": 0, "Price": 6, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" },
                    { "FirstName": "Ricky", "LastName": "Ponting", "MiddleName": "", "Nationality": "Overseas", "PlayerId": 154, "PlayerType": "Batsman", "Points": 0, "Price": 2, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" },
                    { "FirstName": "Mahendra", "LastName": "Dhoni", "MiddleName": "Singh", "Nationality": "Indian", "PlayerId": 265, "PlayerType": "WicketKeeper", "Points": 0, "Price": 4, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 648, "PlayerType": "Batsman", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Chris", "LastName": "Gayle", "MiddleName": "", "Nationality": "Overseas", "PlayerId": 147, "PlayerType": "Batsman", "Points": 0, "Price": 11, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 487, "PlayerType": "Bowler", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 354, "PlayerType": "allRounder", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 784, "PlayerType": "allRounder", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 569, "PlayerType": "allRounder", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 666, "PlayerType": "Bowler", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" },
                    { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 511, "PlayerType": "Bowler", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" }];
                this.playerListXHRSuccess(tempPlayerList);
                //TODO: uncomment this when service is running
                //CricManager.HttpClient.get('/Players/' + this.seriesId, this.playerListXHRSuccess, this.playerListXHRFailure, this);
            },
            playerListXHRSuccess: function (data) {
                //change markup

                this.viewHandle.hideLoading();
                this.playerList = data;
                this.filterList = data;
                CricManager.Players.View.renderPlayers();

            },
            playerListXHRFailure: function (err) {
                //display error msg
                this.viewHandle.hideLoading();
                this.viewHandle.showError();
            }
        },
        View: {
            bizHandle: 'CricManager.Players.Biz',
            rootElement: '#player-pool-data',
            templateName: 'players-data',
            playerTemplate: 'list-player-data',
            playerListElement: '.playerpool-row',
            playersUIDataMap: [],

            isLoading: 'true',

            //this function will be called each time the ui is rendered
            triggerUILoaded: function () {
                $('body').trigger('playerPoolLoaded', [this.bizHandle.playerList]);
            },

            showLoading: function () {
                $(this.rootElement).html('<tr><td></td> <td>Loading All Players......</td><td></td><td></td><td></td></tr>');
            },

            hideLoading: function () {
                $(this.rootElement).html('');
            },

            showError: function () {
                $(this.rootElement).html('<tr class="alert alert-error"><td></td><td><strong>Error!!</strong>Error fetching player list.</td><td></td><td></td><td></td></tr>');
            },

            hideError: function () {
                $(this.rootElement).html('');
            },

            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.init();

            },

            refreshUI: function () {
                var playerList = this.bizHandle.filterList;

                CricManager.TemplateService.renderTemplate(this.rootElement, this.templateName, playerList);
                this.setupUIElementsData();
                //this.playersUIDataMap = CricManager.UIBizMap.createMapArray($(this.playerListElement, this.rootElement), this.bizHandle.playerList);

                this.removeBindings();
                this.setUpBindings();
            },
            renderPlayers: function () {
                this.refreshUI();
                
                this.triggerUILoaded();
            },

            setupUIElementsData: function () {
                var context = CricManager.Players.View;
                $(this.playerListElement, this.rootElement).each(function (index, value) {
                    $(this).data(context.bizHandle.filterList[index]);
                });
            },
            //this function is called by the source which triggers userTeamLoaded event on body
            //this fn just does delegation of events to the actual fn
            handleuserTeamLoad: function (evnt, userTeamList) {
                this.applyUserTeamFilter(evnt, userTeamList);
            },
            //this function disables the players which are present in the userteam already
            applyUserTeamFilter: function (evnt, userTeamList) {
                var i;
                for (i = 0; i < userTeamList.length; i++) {
                    var uiElement = $.grep($(this.playerListElement, this.rootElement), function (element, index) {
                        return $(element).data('PlayerId') == userTeamList[i].PlayerId;
                    });
                    //trigger click function on the ui Element and it will remove the element automatically 
                    //and trigger the addEvent on userTeam
                    $(uiElement).click();
                    //$(uiElement).addClass('disabled choosen');
                }
            },


            removeBindings: function () {
                $(this.playerListElement).off('.playerPool');
                $(this.rootElement).off('.playerPool');
                $('#rowPlayerTypeNav ul li.player-filters').off();
                $('#search_text').off();
                $('.sort-param').off();
                $('body').off('.playerPool');
            },

            setUpBindings: function () {
                var bizHandle = this.bizHandle;
                $('#rowPlayerTypeNav ul li.player-filters').on('click', function () {
                    if (bizHandle.playerType != $(this).data('category')) {
                        bizHandle.playerType = $(this).data('category');

                        bizHandle.changeFilter();
                    }
                });
                $('#search_text').on('keyup', function () {
                    if ($(this).val() != bizHandle.playerName) {
                        bizHandle.playerName = $(this).val();
                        bizHandle.filterPlayersbyName();
                    }
                });

                $('.sort-param').on('click', function () {
                    if ($(this).attr('data-order') == 'ascending') {
                        $(this).attr('data-order', 'descending');
                        $('.order-arrow', this).html('&darr;');
                    } else {
                        $(this).attr('data-order', 'ascending');
                        $('.order-arrow', this).html('&uarr;');
                    }
                    var sortOrder = $(this).attr('data-order');
                    var sortParam = $(this).attr('data-param');
                    bizHandle.sortPlayers(sortParam, sortOrder);
                    return false;
                });

                //we are adding and removing players on the ui only ..... but a better way would be to do it from the service 
                //so that no one can change the selection by altering the script.
                $(this.playerListElement).on('click.playerPool', $.proxy(this.choosePlayer, this));
                $(this.rootElement).on('addPlayer.playerPool.evnt', this.addPlayer);


                //TODO: create a binding on the userteam to know that userteam is loaded
                //when user team is loaded we can user the data as filter to filter out our results in
                //playerpool
                $('body').on('userTeamLoaded.playerPool', $.proxy(this.handleuserTeamLoad, this));
            },

            //called when user chooses the player to be added to the user team
            choosePlayer: function (e) {
                //this points to the current context as $.proxy is used to change the context
                
                //rather that maping the ui and data we are taking the approach to keep data in DOM
                //DON'T know which is better approach but in this case this one seems favourable 
                //bot to use and to data access speed.
                

                if ($(e.currentTarget).is('.disabled,.choosen')) {
                    return;
                }
                

                var data = $(e.currentTarget).data();
                if (data) {
                    if (this.bizHandle.removePlayerFromList(data)) {
                        var userTeamRootElement = CricManager.UserTeam.View.rootElement;
                        $(userTeamRootElement).trigger('handleChoosePlayer', [data, this.removePlayer, this.removeFailure, e.currentTarget]);
                        
                    }
                    //$(uiElement).fadeOut().html('CHOOSEN');
                    //return data;
                }
                
            },
            //called when the add on the other side is successful as a confirmation
            //then we remove the element from UI
            removePlayer: function (uiElement) {
                //rather than fade out we are keeping the player there but greying it and disabliing click
                //$(uiElement).addClass('disabled choosen');
                //only get notified when add is successful on other side
            },
            //called when adding fails on the other side
            removeFailure: function (data) {
                //revert the remove from the list
                var context = CricManager.Players.View;
                if (!context.bizHandle.addPlayerToList(data)) {
                    console.log('revert to player-pool also failed');
                }
                console.log('not disabling the player due to failure to add at the other side');
            },

            addPlayer: function (e, data, callbackSuccess, callbackFailure, callbackValue) {


                //this points to the rootelement
                var context = CricManager.Players.View;
                if (context.bizHandle.addPlayerToList(data)) {
                    callbackSuccess(callbackValue, data);
                    console.log('player added in player-pool');
                    return;
                }
                callbackFailure(data);
                console.log('failed adding to player pool');
                //refreshing of list will be done by the Biz

                

                //});
                ////no need to get from ui map since we have not created a map for it.
                ////var uiElement = CricManager.UIBizMap.pushData(context.playersUIDataMap, data);
                //if (uiElement && uiElement.length) {
                //    if (context.bizHandle.addPlayerToList(data)) {
                //        //no need to render because data is already present there
                //        //but we need to re-enable it
                //        $(uiElement).removeClass('disabled choosen');

                //        //CricManager.TemplateService.renderTemplate($(uiElement, this), context.playerTemplate, data);
                        
                        
                //    }
                //    //player single entry tempalte is used here.
                    

                //}
                


            }
        }

    };

    CricManager.Schedule = {
        Biz: {
            viewHandle: 'CricManager.Schedule.View',
            matchList: [],
            seriesId: '18054817710736052',
            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                //CricManager.HttpClient.get('/Schedule/' + this.seriesId, this.playerListXHRSuccess, this.playerListXHRFailure, this);
                this.matchList = [
                    { "AwayTeamName": "RCB", "Deadline_Time": "12:12:12", "Match_Time": "12:12:12", "HomeTeamName": "KKR", "Match_Date": "12/12/2013", "MatchId": "101", "MatchName": "first", "Type": 0, "Venue": "Kolkata" },
                    { "AwayTeamName": "MI", "Deadline_Time": "11:12:12", "Match_Time": "12:12:12", "HomeTeamName": "DD", "Match_Date": "12/12/2013", "MatchId": "102", "MatchName": "second", "Type": 0, "Venue": "Delhi" },
                    { "AwayTeamName": "DC", "Deadline_Time": "10:12:12", "Match_Time": "12:12:12", "HomeTeamName": "KP", "Match_Date": "12/12/2013", "MatchId": "103", "MatchName": "third", "Type": 0, "Venue": "Chandigarh" },
                    { "AwayTeamName": "RR", "Deadline_Time": "09:12:12", "Match_Time": "12:12:12", "HomeTeamName": "PWI", "Match_Date": "12/12/2013", "MatchId": "104", "MatchName": "fourth", "Type": 0, "Venue": "Pune" }
                ];//TODO: comment this part when service is ready
                this.viewHandle.renderSchedule();
            },
            scheduleListXHRSuccess: function (data) {
                //change markup
                this.matchList = [{ "AwayTeamName": "RCB", "Deadline": "\/Date(1365481800000+0530)\/", "HomeTeamName": "KKR", "MatchDate": "\/Date(1365493500000+0530)\/", "MatchId": "101", "MatchName": "first", "Type": 0, "Venue": "Kolkata" }, { "AwayTeamName": "MI", "Deadline": "\/Date(1365481800000+0530)\/", "HomeTeamName": "DD", "MatchDate": "\/Date(1365512400000+0530)\/", "MatchId": "102", "MatchName": "second", "Type": 0, "Venue": "Delhi" }, { "AwayTeamName": "DC", "Deadline": "\/Date(1365568200000+0530)\/", "HomeTeamName": "KP", "MatchDate": "\/Date(1365579900000+0530)\/", "MatchId": "103", "MatchName": "third", "Type": 0, "Venue": "Chandigarh" }, { "AwayTeamName": "RR", "Deadline": "\/Date(1365568200000+0530)\/", "HomeTeamName": "PWI", "MatchDate": "\/Date(1365598800000+0530)\/", "MatchId": "104", "MatchName": "fourth", "Type": 0, "Venue": "Pune" }, { "AwayTeamName": "DD", "Deadline": "\/Date(1365827400000+0530)\/", "HomeTeamName": "RCB", "MatchDate": "\/Date(1365839100000+0530)\/", "MatchId": "105", "MatchName": "fifth", "Type": 0, "Venue": "Bangalore" }, { "AwayTeamName": "KKR", "Deadline": "\/Date(1365827400000+0530)\/", "HomeTeamName": "RR", "MatchDate": "\/Date(1365858000000+0530)\/", "MatchId": "106", "MatchName": "sixth", "Type": 0, "Venue": "Jaipur" }];
                this.viewHandle.renderSchedule();
            },
            scheduleListXHRFailure: function (err) {
                //display error msg
            }
        },
        View: {
            bizHandle: 'CricManager.Schedule.Biz',
            rootElement: '#schedule-data',
            timerElement: '.countdown-timer',
            templateName: 'schedule-data',
            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.init();
            },
            renderSchedule: function () {
                var matchList = CricManager.Schedule.Biz.matchList;

                CricManager.TemplateService.renderTemplate(this.rootElement, this.templateName, matchList);

                this.removeBindings();
                this.setUpBindings();


            },
            removeBindings: function () {
                var bizHandle = this.bizHandle;
                //destroy the countdown timer
                $('.countdown-timer', this.rootelement).countdown('destroy');

                //unbind carouse here
                //  $('.carousel').each(function () {
                //     $(this).carousel({
                //         interval: false
                //     });
                // });

                //ubinding the click
                $('.right.carousel-control').off();
            },
            setUpBindings: function () {
                var bizHandle = this.bizHandle;
                $('.countdown-timer', this.rootelement).each(function (index, value) {
                    //plugin to time
                    $(this).countdown({ untill: bizHandle.matchList[index].Deadline });
                });
                /*----Carousel Settings-------*/
                $('.carousel').each(function () {
                    $(this).carousel({
                        interval: false
                    });
                });
                $('.right.carousel-control').on('click', function () {
                    var newValue = 'prev';
                    var text = '&lsaquo;';
                    if ($(this).data('slide') === 'prev') {
                        newValue = 'next';
                        text = '&rsaquo;';
                    }
                    $(this).data('slide', newValue);
                    $(this).html(text);
                });


            }
        }

    };

    CricManager.Teams = {
        Biz: {
            viewHandle: 'CricManager.Teams.View',
            seriesId: '18054817710736052',
            teamList: [],
            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);

                CricManager.HttpClient.get('/Teams/' + this.seriesId, this.teamListXHRSuccess, this.teamListXHRFailure, this);

            },
            teamListXHRSuccess: function (data) {
                this.teamList = data;
                this.viewHandle.renderTeams();
            },
            teamListXHRFailure: function (err) {
            }


        },
        View: {
            bizHandle: 'CricManager.Teams.Biz',
            rootElement: '#teamList',
            templateName: 'team-list',
            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.init();
            },
            renderTeams: function () {
                CricManager.TemplateService.renderTemplate(this.rootElement, this.templateName, this.bizHandle.teamList);
            }
        }
    };

    CricManager.UserTeam = {
        Biz: {
            viewHandle: 'CricManager.UserTeam.View',
            userDetail: {},
            userTeamList: [],

            seriesId: '18054817710736052',
            userId: '20001782967174406',
            

            removePlayerFromTeam: function (data) {
                var index = CricManager.Search.findIndex(this.userTeamList, data, 'PlayerId');
                if (index != -1) {
                    this.userTeamList.remove(index);
                    //return decides weather we remove if in the ui or not.
                    return true;
                    //this.viewHandle.renderUserTeam();
                }
                return false;
            },
            addPlayerToTeam: function (data) {
                //check that player should not be repeated
                if (CricManager.Search.findIndex(this.userTeamList, data, 'PlayerId') == -1) {
                    this.userTeamList.push(data);
                    return true;
                    //this.viewHandle.renderUserTeam();
                }
                return false;

            },
            findPlayers: function (data) {
                return CricManager.Search.findObject(this.userTeamList, data, "PlayerId")
            },

            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                //var teamCreated = false;
                //if (!teamCreated) {
                //    this.createTeam();
                //} /*uncomment this when every thing is patched up*/
                this.getTeam();

            },


            getTeam: function () {
                this.viewHandle.showLoading();
                var tempTeamArray = ['1', '2', '3', '4', '5', '6', '7'];
                this.getTeamXHRSuccess(tempTeamArray);
                //TODO: uncomment this when service is working and remove the above temp array creation and service call
                //CricManager.HttpClient.get('/UserTeam/' + this.userId, this.getTeamXHRSuccess, this.getTeamXHRFailure, this);
            },
            getTeamXHRSuccess: function (data) {
                this.viewHandle.hideLoading();
                //userdetail contain the user detail which comes with the call.
                this.userDetail = data;
                //team list contains the only players list
                //TODO: review this part when userteam service start working
                //this.userTeamList = data.plaerList;
                this.userTeamList = data;//[0].Players;//setting the first team created by user
                this.viewHandle.renderUserTeam();
            },
            getTeamXHRFailure: function (err) {
                this.viewHandle.showError();
                //TODO: REMOVE THIS 
            },

            createTeam: function () {

            },
            createTeamXHRSuccess: function (data) {
            },
            createTeamXHRFailure: function (err) {
            },

            saveTeam: function () {
                this.viewHandle.showSaving();
                //service won't working now.....
                //
                var data = JSON.stringify(this.userTeamList);
                CricManager.HttpClient.post('/SaveTeam/' + this.userId, this.saveTeamXHRSuccess, this.saveTeamXHRFailure, data, this);
            },
            saveTeamXHRSuccess: function (data) {

                this.viewHandle.hideSaving();
            },
            saveTeamXHRFailure: function (err) {
                this.viewHandle.hideSaving();
            },
        },
        View: {
            bizHandle: 'CricManager.UserTeam.Biz',
            rootElement: '#team-data',
            templateName: 'team-data',
            playerTemplate: 'team-player-data',
            playerBlockElement: '.player-block',
            saveElement: '#saveUserTeam',
            compositionElement: '.compositionSelector',
            userTeamUIDataMap: [],
            batsmanUIMap: [],
            batsmanCount: 0,
            allRounderUIMap: [],
            allRounderCount: 0,
            keeperUIMap: [],
            keeperCount: 0,
            bowlerUIMap: [],
            bowlerCount: 0,
            teamCompositionTypes: {
                _4313: '4B 3AR 1Wk 3Bw',
                _4223: '4B 2AR 2Wk 3Bw',
            },
            selectedComposition: '4B 3AR 1Wk 3Bw',

            triggerUIReady: function () {
                var listCopy = this.bizHandle.userTeamList;
                this.bizHandle.userTeamList = [];
                $('body').trigger('userTeamLoaded', [listCopy]);
                
            },
            
            showSaving: function () {
                //do some loader and saving loader logic here.
            },
            showLoading: function () {
                //TODO: loading can be get from loading template
                $(this.rootElement).html('<div class="loader-ajax"><strong>Loading User Players.....</strong></div>');
            },
            hideLoading: function () {
                $(this.rootElement).html('');
            },
            showError: function () {
                $(this.rootElement).html('<div class="alert alert-danger"><strong>Error!!</strong>Error Fetching User Data</div>');
            },
            hideError: function () {
                $(this.rootElement).html('');
            },

            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.init();

            },
            renderUserTeam: function () {
                

                //to change: sending the first team of user from the list team and picking the players form it.

                //remove this hardcoding of player list in user team when service start working correctely

                this.bizHandle.userTeamList = [{ "FirstName": "Dale", "LastName": "Steyn", "MiddleName": "", "Nationality": "Overseas", "PlayerId": 123, "PlayerType": "Bowler", "Points": 0, "Price": 6, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" }, { "FirstName": "Ricky", "LastName": "Ponting", "MiddleName": "", "Nationality": "Overseas", "PlayerId": 154, "PlayerType": "Batsman", "Points": 0, "Price": 2, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" }, { "FirstName": "Mahendra", "LastName": "Dhoni", "MiddleName": "Singh", "Nationality": "Indian", "PlayerId": 265, "PlayerType": "WicketKeeper", "Points": 0, "Price": 4, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" }, { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "PlayerId": 648, "PlayerType": "Batsman", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" }, { "FirstName": "Chris", "LastName": "Gayle", "MiddleName": "", "Nationality": "Overseas", "PlayerId": 147, "PlayerType": "Batsman", "Points": 0, "Price": 11, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" }];
                //giving empty array in renderTemplate so that it renders all the empty divs and then players are added by the playerpool when it checks.
                CricManager.TemplateService.renderTemplate(this.rootElement, this.templateName, []);

                
                

                //TO THINK: removeBindings can be called by setUpBindings before setting up the bindings
                this.removeBindings();
                this.setUpBindings();

                this.userTeamUIDataMap = CricManager.UIBizMap.createMapArray($(this.playerBlockElement, this.rootElement), []);
                this.setupComposition();

                //trigger creates a copy of userTeamList and then empty the userteamlist array
                this.triggerUIReady();
                

                
            },

            //call this method every time the user changes the composition 
            //with context as this not some DOM element
            setupComposition: function () {
                var batsman = 0, allRounder = 0, keeper = 0, bowler = 0, index = 0;
                this.batsmanUIMap = []; this.allRounderUIMap = []; this.keeperUIMap = []; this.bowlerUIMap = [];
                if (this.selectedComposition == this.teamCompositionTypes._4313) {
                    batsman = 4, allRounder = 7, keeper = 8, bowler = 11;
                    index = 0;
                } else if (this.selectedComposition == this.teamCompositionTypes._4223) {
                    batsman = 4, allRounder = 6, keeper = 8, bowler = 11;
                    index = 0;
                }

                while (index < this.userTeamUIDataMap.length) {
                    if (index < batsman) {
                        this.userTeamUIDataMap[index].uiElement.addClass('batsman');
                        this.batsmanUIMap.push(this.userTeamUIDataMap[index]);
                    } else if (index < allRounder) {
                        this.userTeamUIDataMap[index].uiElement.addClass('allRounder');
                        this.allRounderUIMap.push(this.userTeamUIDataMap[index]);
                    } else if (index < keeper) {
                        this.userTeamUIDataMap[index].uiElement.addClass('keeper');
                        this.keeperUIMap.push(this.userTeamUIDataMap[index]);
                    } else if (index < bowler) {
                        this.userTeamUIDataMap[index].uiElement.addClass('bowler');
                        this.bowlerUIMap.push(this.userTeamUIDataMap[index]);
                    }
                    index += 1;
                }
            },

            setUpBindings: function () {
                //$('.remove-player', this.playerBlockElement).on('click', this.removePlayer);
                $(this.playerBlockElement, this.rootElement).on('click.userTeam', '.remove-player', $.proxy(this.removePlayer, this));
                $(this.rootElement).on('addPlayer.userTeam.evnt', $.proxy(this.handleChoosePlayer, this));
                $(this.saveElement).on('click.userTeam', this.saveTeam);

                $(this.compositionElement, this.rootElement).on('change.userTeam', $.proxy(this.changeComposition, this));
            },
            removeBindings: function () {
                $(this.rootElement).off('.userTeam');
            },

            changeComposition: function (e) {
                
                var $target = $(e.currentTarget);
                var $selectedElement = $('option:selected', $target);
                var newComposition = $selectedElement.val();

                if (this.validateComposition(newComposition)) {
                    var $selectedElement = $('option:selected', $target);
                    this.selectedComposition = $selectedElement.val();
                    this.setupComposition();
                    /*this.removeAllPlayers();
                    this.renderUserTeam();*/
                    console.log('changed composition');
                } else {
                    for( var i=0; i< $target[0].options.length; i++){
                        if($target[0].options[i].value == this.selectedComposition){
                            $target[0].options[i].selected = true;
                            break;
                        }
                    }
                    console.log('roll backing composition');
                }

            },
            validateComposition: function (newComposition) {
                var batsman = 0, bowler = 0, allRounder = 0, keeper = 0;
                if (newComposition == this.teamCompositionTypes._4313) {
                    batsman = 4; allRounder = 3; keeper = 1; bowler = 3;

                } else if (newComposition == this.teamCompositionTypes._4223) {
                    batsman = 4; allRounder = 2; keeper = 2; bowler = 3;
                }

                if (this.batsmanCount > batsman || this.allRounderCount > allRounder || this.keeperCount > keeper || this.bowlerCount > bowler) {
                    alert('you need to remove some players to fit to this composition');
                    return false;
                }

                return true;
            },

            saveTeam: function () {
                var context = CricManager.UserTeam.View;
                context.bizHandle.saveTeam();
            },


            removeAllPlayers: function () {
                $('.remove-player', this.playerBlockElement, this.rootElement).click();
            },
            //remove the player from list
            //context is set to this using jQuery.proxy 
            //assuming parent element of clicked element is our target element
            removePlayer: function (e) {
                //var context = CricManager.UserTeam.View;
                var $selectedElement = $(e.currentTarget).parent(this.playerBlockElement);

                var data = CricManager.UIBizMap.popData(this.userTeamUIDataMap, $selectedElement);
                
                //It will remove player from the first team of user
                //remove from ui if successful
                if (this.bizHandle.removePlayerFromTeam(data)) {
                    //call the playerpool add player
                    var playerListRootElement = CricManager.Players.View.rootElement;
                    $(playerListRootElement).trigger('addPlayer', [data, this.removePlayerFromUI, this.revertRemovePlayer, $selectedElement]);

                    console.log('player removed');
                    console.log(this.bizHandle.userTeamList);
                }
            },
            removePlayerFromUI: function (uiElement, data) {
                //TODO: can use some template in case of blank data.
                //$(uiElement).slideUp(function () {
                $(uiElement).html("<span>FirstName<strong>LastName</strong></span>");//.fadeIn();
                //});

                var context = CricManager.UserTeam.View;
                context.managePlayerCount(data, 'remove');
            },
            revertRemovePlayer: function (data) {
                var context = CricManager.UserTeam.View;
                if (context.bizHandle.addPlayerToTeam(data)) {
                    console.log('revert of userteam failed');
                }
            },
            managePlayerCount: function (data, type) {
                
                if (data.PlayerType == 'Batsman') {
                    if (type == 'add') {
                        this.batsmanCount++;
                    } else {
                        this.batsmanCount--;
                    }
                }
                else if (data.PlayerType == 'allRounder') {
                    if (type == 'add') {
                        this.allRounderCount++;
                    } else {
                        this.allRounderCount--;
                    }
                }
                else if (data.PlayerType == 'WicketKeeper') {
                    if (type == 'add') {
                        this.keeperCount++;
                    } else {
                        this.keeperCount--;
                    }
                }
                else if (data.PlayerType == 'Bowler') {
                    if (type == 'add') {
                        this.bowlerCount--;
                    } else {
                        this.bowlerCount--;
                    }
                }
            },

            //Event: raised by element who want to add data in this area. takes args = (event, data)
            handleChoosePlayer: function(e, data, callbackSuccess, callbackFailure, callbackValue) {
                this.addPlayer(data, callbackSuccess, callbackFailure, callbackValue);

            },
            addPlayer: function (data, callbackSuccess, callbackFailure, callbackValue) {



                //TODO: find the ui element as per teamComposition of player
                var uiElement;
                if (data.PlayerType == 'Batsman') {
                    uiElement = CricManager.UIBizMap.pushData(this.batsmanUIMap, data);
                } else if(data.PlayerType == 'allRounder'){
                    uiElement = CricManager.UIBizMap.pushData(this.allRounderUIMap, data);
                } else if (data.PlayerType == 'WicketKeeper') {
                    uiElement = CricManager.UIBizMap.pushData(this.keeperUIMap, data);
                } else if (data.PlayerType == 'Bowler') {
                    uiElement = CricManager.UIBizMap.pushData(this.bowlerUIMap, data);
                }
                
                if (uiElement) {
                    var $targetElement = $(uiElement, this);
                    //user-team list single entry template is used here.
                    if (this.bizHandle.addPlayerToTeam(data)) {
                        CricManager.TemplateService.renderTemplate($targetElement, this.playerTemplate, data);
                        //call success callback to ensure successful adding
                        callbackSuccess&&callbackSuccess(callbackValue);
                        console.log('player added to user team');

                        this.managePlayerCount(data, 'add');

                        return;
                    }

                }
                //adding failed
                callbackFailure&&callbackFailure(data);
                console.log('failed adding to user team');

            },
            //INFO: add batsman to UI based on team composition
            addBatsman: function (data) {

            },
            //add Bowler to UI based on composition
            addBowler: function (data) {
            },
            //add Keeper to UI based on composition
            addWicketKeeper: function (data) {
            },
            //add allrounder to UI based on composition
            addAllRounder: function (data) {
            },

        }
    };

    CricManager.Matches = {
        Biz: {
            viewHandle: 'CricManager.Matches.View',
            seriesId: '18054817710736052',
            userId: '20001782967174406',
            matchesList: [],
            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                //service call from here
                //CricManager.HttpClient.get('/Matches/' + this.seriesId, this.teamListXHRSuccess, this.teamListXHRFailure, this);

            },
            matchesListXHRSuccess: function (data) {
                this.matchesList = data;
                this.viewHandle.renderMatches();
            },
            matchesListXHRFailure: function (err) {
            }
        },
        View: {
            bizHandle: 'CricManager.Teams.Biz',
            rootElement: '#matchesList',
            templateName: 'matches-list',
            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.init();
            },
            renderMatches: function () {
                CricManager.TemplateService.renderTemplate(this.rootElement, this.templateName, this.bizHandle.teamList);
            }
        }
    };
    CricManager.UIBizMap = {
        mapObject: function () {
            this.uiElement = '';
            this.data = {};
        },
        getData: function (mapArray, uiElement) {
            var uiElement = uiElement;
            return $.grep(mapArray, function (e) {
                return e.uiElement == uiElement;
                //TODO: need to use the better object comparison algorithm 
                //e.g. here: http://procbits.com/2012/01/19/comparing-two-javascript-objects
            });
        },
        popData: function (mapArray, uiElement) {
            var uiElement = uiElement;
            var mapElementArray = $.grep(mapArray, function (e) {
                if (e.uiElement.is(uiElement)) {//comparing two jquery elements are never equal
                    // but jquery has is() method which compares two jquery objects
                    return true;
                }
                return false;
                //TODO: need to use the better object comparison algorithm 
                //e.g. here: http://procbits.com/2012/01/19/comparing-two-javascript-objects
            });
            var data = mapElementArray[0].data;
            mapElementArray[0].data = undefined;
            return data;
        },
        pushData: function (mapArray, data) {
            //INFO: assuming mapArray is passes as reference
            for (var i = 0; i < mapArray.length; i++) {
                if (!mapArray[i].data) {
                    mapArray[i].data = data;
                    return mapArray[i].uiElement;
                }
            }
            return null;
        },
        getElement: function (data) {//this function might not get used.
            var data = data;
            return $.grep(mapArray, function (e) {
                return e.data == data;
                //TODO: need to use the better object comparison algorithm 
                //e.g. here: http://procbits.com/2012/01/19/comparing-two-javascript-objects
            });
        },
        //INFO: creates a mapping of jquery ui elements and data associated with them
        createMapArray: function (uiElementList, dataList) {
            var dataList = dataList;
            var uiElementList = uiElementList;
            var mapHandle = this;
            var mapList = [];
            $.each(uiElementList, function (index, value) {
                var mapObj = new mapHandle.mapObject();
                mapObj.uiElement = $(this);
                mapObj.data = dataList[index];
                mapList.push(mapObj);
            });

            return mapList;
        }
    };

    CricManager.Search = {
        findObject: function (objArray, element, property) {

            return $.grep(objArray, function (ele, index) {
                if (property) {
                    return ele[property] == element[property];
                }
                return ele == element;
            });
        },
        findIndex: function (objArray, element, property) {
            var i;
            for (i = 0; i < objArray.length; i++) {
                if (property) {
                    if (objArray[i][property] == element[property]) {
                        return i;
                    }
                } else {
                    if (objArray == element) {
                        return i;
                    }
                }
            }
            return -1;

        }
    };

    //Provides support for ajax calls
    CricManager.HttpClient = {
        isProcessing: 'false',
        get: function (url, onSuccess, onError, context) {
            //this.isProcessing = true;
            var dataType;
            $.ajax({
                url: '/Services/CricManagerService.svc' + url,
                type: 'get',
                context: context,
                dataType: dataType || 'json',
                success:(onSuccess || function (data) {
                    //this.isProcessing = false;
                    onSuccess(data);
                    console.log('Success: ');
                    console.log(data);
                }),
                error: (onError || function (err) {
                    console.log('Error: ');
                    console.log(err);
                })
            });
        },
        post: function (url, onSuccess, onError, data, context) {
            $.ajax({
                url: '/Services/CricManagerService.svc' + url,
                type: 'POST',
                contentType: 'application/json',
                dataType: 'json',
                data: data,
                context: context,
                success: onSuccess || function (data) {
                    console.log('Success: ');
                    console.log(data);
                },
                error: (onError || function (err) {
                    console.log('Error: ');
                    console.log(err);
                })
            })
        }
    };

    CricManager.VariableResolve = {
        resolve: function (name) {
            return eval(name);
        }
    };

    CricManager.TemplateService = {
        renderTemplate: function (container, templateName, data) {
            var template;

            if (Templates[templateName]) {
                template = Templates[templateName];
            } else {
                //INFO: assuming that text area is holding the tempaltes
                template = $('[data-template-name=' + templateName + ']').val();
            }

            $(container).setTemplate(template, null, { filter_data: false });
            $(container).processTemplate(data);
            console.log(templateName + 'rendered');
        },
        appendTemplate: function (target, templateName, data, containerTag) {
            var tempElem = $(containerTag);
            var template = $('[data-template-name=' + templateName + ']').html();
            $(tempElem).setTemplate(template, null, { filter_data: false });
            $(tempElem).processTemplate(data);
            $(target).append($(tempElem).html());
        }
    };

    CricManager.ScrollHelper = {
        scrollTo: function (targetElement, sourceElement) {
            var source = sourceElement || 'body';
            source = $(source);

            $(source).animate({
                scrollTop: $(targetElement).offset().top - 20
            });

        }
    };

    $(document).ready(function () {
        //REQUIREMENT: 
        //try to keep order here as the views will be loaded the order of these calls.
        // e.g. teams list will be populated after the player list has been populated thus called after player list ready call.

        CricManager.Players.View.ready();
        CricManager.Teams.View.ready();

        CricManager.Schedule.View.ready();

        CricManager.UserTeam.View.ready();


    })

}());


//TODO: REMAINING WORK
/*
    --> create a uidata map of all the rendered elements so that actions and data
            change events can be synched together.
    --> change the setup bindings and remove bindins [USE EVENT NAMESPACING THERE]

*/


/*<style>
    .windows8 {
    position: relative;
    width: 90px;
    height:90px;
    }

    .windows8 .wBall {
    position: absolute;
    width: 86px;
    height: 86px;
    opacity: 0;
    -moz-transform: rotate(225deg);
    -moz-animation: orbit 7.15s infinite;
    -webkit-transform: rotate(225deg);
    -webkit-animation: orbit 7.15s infinite;
    -ms-transform: rotate(225deg);
    -ms-animation: orbit 7.15s infinite;
    -o-transform: rotate(225deg);
    -o-animation: orbit 7.15s infinite;
    transform: rotate(225deg);
    animation: orbit 7.15s infinite;
    }

    .windows8 .wBall .wInnerBall{
    position: absolute;
    width: 11px;
    height: 11px;
    background: #000000;
    left:0px;
    top:0px;
    -moz-border-radius: 11px;
    -webkit-border-radius: 11px;
    -ms-border-radius: 11px;
    -o-border-radius: 11px;
    border-radius: 11px;
    }

    .windows8 #wBall_1 {
    -moz-animation-delay: 1.56s;
    -webkit-animation-delay: 1.56s;
    -ms-animation-delay: 1.56s;
    -o-animation-delay: 1.56s;
    animation-delay: 1.56s;
    }

    .windows8 #wBall_2 {
    -moz-animation-delay: 0.31s;
    -webkit-animation-delay: 0.31s;
    -ms-animation-delay: 0.31s;
    -o-animation-delay: 0.31s;
    animation-delay: 0.31s;
    }

    .windows8 #wBall_3 {
    -moz-animation-delay: 0.62s;
    -webkit-animation-delay: 0.62s;
    -ms-animation-delay: 0.62s;
    -o-animation-delay: 0.62s;
    animation-delay: 0.62s;
    }

    .windows8 #wBall_4 {
    -moz-animation-delay: 0.94s;
    -webkit-animation-delay: 0.94s;
    -ms-animation-delay: 0.94s;
    -o-animation-delay: 0.94s;
    animation-delay: 0.94s;
    }

    .windows8 #wBall_5 {
    -moz-animation-delay: 1.25s;
    -webkit-animation-delay: 1.25s;
    -ms-animation-delay: 1.25s;
    -o-animation-delay: 1.25s;
    animation-delay: 1.25s;
    }

    @-moz-keyframes orbit {
    0% {
    opacity: 1;
    z-index:99;
    -moz-transform: rotate(180deg);
    -moz-animation-timing-function: ease-out;
    }

    7% {
    opacity: 1;
    -moz-transform: rotate(300deg);
    -moz-animation-timing-function: linear;
    -moz-origin:0%;
    }

    30% {
    opacity: 1;
    -moz-transform:rotate(410deg);
    -moz-animation-timing-function: ease-in-out;
    -moz-origin:7%;
    }

    39% {
    opacity: 1;
    -moz-transform: rotate(645deg);
    -moz-animation-timing-function: linear;
    -moz-origin:30%;
    }

    70% {
    opacity: 1;
    -moz-transform: rotate(770deg);
    -moz-animation-timing-function: ease-out;
    -moz-origin:39%;
    }

    75% {
    opacity: 1;
    -moz-transform: rotate(900deg);
    -moz-animation-timing-function: ease-out;
    -moz-origin:70%;
    }

    76% {
    opacity: 0;
    -moz-transform:rotate(900deg);
    }

    100% {
    opacity: 0;
    -moz-transform: rotate(900deg);
    }

    }

    @-webkit-keyframes orbit {
    0% {
    opacity: 1;
    z-index:99;
    -webkit-transform: rotate(180deg);
    -webkit-animation-timing-function: ease-out;
    }

    7% {
    opacity: 1;
    -webkit-transform: rotate(300deg);
    -webkit-animation-timing-function: linear;
    -webkit-origin:0%;
    }

    30% {
    opacity: 1;
    -webkit-transform:rotate(410deg);
    -webkit-animation-timing-function: ease-in-out;
    -webkit-origin:7%;
    }

    39% {
    opacity: 1;
    -webkit-transform: rotate(645deg);
    -webkit-animation-timing-function: linear;
    -webkit-origin:30%;
    }

    70% {
    opacity: 1;
    -webkit-transform: rotate(770deg);
    -webkit-animation-timing-function: ease-out;
    -webkit-origin:39%;
    }

    75% {
    opacity: 1;
    -webkit-transform: rotate(900deg);
    -webkit-animation-timing-function: ease-out;
    -webkit-origin:70%;
    }

    76% {
    opacity: 0;
    -webkit-transform:rotate(900deg);
    }

    100% {
    opacity: 0;
    -webkit-transform: rotate(900deg);
    }

    }

    @-ms-keyframes orbit {
    0% {
    opacity: 1;
    z-index:99;
    -ms-transform: rotate(180deg);
    -ms-animation-timing-function: ease-out;
    }

    7% {
    opacity: 1;
    -ms-transform: rotate(300deg);
    -ms-animation-timing-function: linear;
    -ms-origin:0%;
    }

    30% {
    opacity: 1;
    -ms-transform:rotate(410deg);
    -ms-animation-timing-function: ease-in-out;
    -ms-origin:7%;
    }

    39% {
    opacity: 1;
    -ms-transform: rotate(645deg);
    -ms-animation-timing-function: linear;
    -ms-origin:30%;
    }

    70% {
    opacity: 1;
    -ms-transform: rotate(770deg);
    -ms-animation-timing-function: ease-out;
    -ms-origin:39%;
    }

    75% {
    opacity: 1;
    -ms-transform: rotate(900deg);
    -ms-animation-timing-function: ease-out;
    -ms-origin:70%;
    }

    76% {
    opacity: 0;
    -ms-transform:rotate(900deg);
    }

    100% {
    opacity: 0;
    -ms-transform: rotate(900deg);
    }

    }

    @-o-keyframes orbit {
    0% {
    opacity: 1;
    z-index:99;
    -o-transform: rotate(180deg);
    -o-animation-timing-function: ease-out;
    }

    7% {
    opacity: 1;
    -o-transform: rotate(300deg);
    -o-animation-timing-function: linear;
    -o-origin:0%;
    }

    30% {
    opacity: 1;
    -o-transform:rotate(410deg);
    -o-animation-timing-function: ease-in-out;
    -o-origin:7%;
    }

    39% {
    opacity: 1;
    -o-transform: rotate(645deg);
    -o-animation-timing-function: linear;
    -o-origin:30%;
    }

    70% {
    opacity: 1;
    -o-transform: rotate(770deg);
    -o-animation-timing-function: ease-out;
    -o-origin:39%;
    }

    75% {
    opacity: 1;
    -o-transform: rotate(900deg);
    -o-animation-timing-function: ease-out;
    -o-origin:70%;
    }

    76% {
    opacity: 0;
    -o-transform:rotate(900deg);
    }

    100% {
    opacity: 0;
    -o-transform: rotate(900deg);
    }

    }

    @keyframes orbit {
    0% {
    opacity: 1;
    z-index:99;
    transform: rotate(180deg);
    animation-timing-function: ease-out;
    }

    7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
    origin:0%;
    }

    30% {
    opacity: 1;
    transform:rotate(410deg);
    animation-timing-function: ease-in-out;
    origin:7%;
    }

    39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
    origin:30%;
    }

    70% {
    opacity: 1;
    transform: rotate(770deg);
    animation-timing-function: ease-out;
    origin:39%;
    }

    75% {
    opacity: 1;
    transform: rotate(900deg);
    animation-timing-function: ease-out;
    origin:70%;
    }

    76% {
    opacity: 0;
    transform:rotate(900deg);
    }

    100% {
    opacity: 0;
    transform: rotate(900deg);
    }

    }

</style>
<div class="windows8">
    <div class="wBall" id="wBall_1">
        <div class="wInnerBall">
        </div>
    </div>
    <div class="wBall" id="wBall_2">
        <div class="wInnerBall">
        </div>
    </div>
    <div class="wBall" id="wBall_3">
        <div class="wInnerBall">
        </div>
    </div>
    <div class="wBall" id="wBall_4">
        <div class="wInnerBall">
        </div>
    </div>
    <div class="wBall" id="wBall_5">
        <div class="wInnerBall">
        </div>
    </div>
</div>*///from cssload.net