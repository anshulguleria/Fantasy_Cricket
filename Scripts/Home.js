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
            filterList: [],// Test Comment
            playerType: '',
            playerTeam: '',
            playerName: '',

            seriesId: '27736440632901917',
            addPlayerToList: function (data) {
                //check so that no repeated players may enterteamLoader
                var index = CricManager.Search.findIndex(this.playerList, data, 'Id');
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
                return CricManager.Search.findObjects(this.playerList, data, "Id")
            },

            //this function is not in use because we are not actually removing the player from the list
            //we are just disabling it.
            removePlayerFromList: function (data) {
                var index = CricManager.Search.findIndex(this.playerList, data, 'Id');
                if (index != -1) {

                    this.playerList[index].isSelected = true;
                    this.refreshFilters();

                    return {
                        status: true,
                        msg: 'Player removed from pool.'
                    };
                    //copy data to filter list too as data is populated as per filterlist content
                    //this.viewHandle.refreshUI();

                }
                return {
                    status: false,
                    msg: data.Name + ' not found in the original list.'
                };
            },

            resetFilters: function () {
                this.playerName = '';
                this.playerTeam = '';
                this.playerType = '';
            },

            //called each time when due to some condition new data is added
            refreshFilters: function () {
                this.changeFilter();
                //this.filterPlayersbyName();
            },
            changeFilter: function () {
                this.playerName = '';

                this.filterList = objectFilter(this.playerType, this.playerList, { property: 'Type' });
                this.filterList = objectFilter(this.playerTeam, this.filterList, { property: 'ShortTeamName', exactMatch: true });
                this.viewHandle.refreshUI(this.filterList);
            },
            sortPlayers: function (sortParam, sortOrder) {
                //this.playerName = '';
                //this.playerTeam = '';
                //this.playerType = '';
                this.playerList = sortList(this.playerList, {
                    param: sortParam,
                    ascending: sortOrder == 'ascending'
                });

                //it filters and refreshUI too thus no need to refresh again
                this.changeFilter();

                //this.filterList = this.playerList;
                //this.resetFilters();
                ////Also refresh UI filters
                //this.viewHandle.refreshUI();
            },
            filterPlayersbyName: function () {
                //this.playerTeam = '';
                //this.playerType = '';
                var firstNameArray, lastNameArray;
                firstNameArray = objectFilter(this.playerName, this.filterList, { property: 'FirstName' });
                lastNameArray = objectFilter(this.playerName, this.filterList, { property: 'LastName' });

                var i = 0;
                var tempList = [];
                tempList = firstNameArray;
                for (i = 0 ; i < lastNameArray.length; i++) {
                    if (CricManager.Search.findIndex(firstNameArray, lastNameArray[i], 'Id') == -1) {
                        tempList.push(lastNameArray[i]);
                    }
                }
                this.viewHandle.refreshUI(tempList);
            },

            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                this.viewHandle.showLoader();
                this.viewHandle.setScroll();

                //this.playerListXHRSuccess(list);
                //TODO: uncomment this when service is running
                CricManager.HttpClient.get('/Services/CricManagerService.svc/Players/' + this.seriesId, this.playerListXHRSuccess, this.playerListXHRFailure, this);
            },
            playerListXHRSuccess: function (data) {
                //change markup

                this.viewHandle.hideLoader();
                if (!data.Error) {
                    this.playerList = data.Players;
                    this.filterList = data.Players;
                    CricManager.Globals.PlayerPoolLoaded = true;
                } else {
                    this.viewHandle.showError();
                }
                CricManager.Players.View.renderPlayers();

            },
            playerListXHRFailure: function (err) {
                //display e rror msg
                this.viewHandle.hideLoader();
                this.viewHandle.showError();
            }
        },
        View: {
            bizHandle: 'CricManager.Players.Biz',
            rootElement: '#player-pool-data',
            templateName: 'players-data',
            playerTemplate: 'list-player-data',
            playerListElement: '.playerpool-row',
            choosePlayerElement: '.addPlayer',
            playersUIDataMap: [],

            isLoading: 'true',

            //this function will be called each time the ui is rendered
            triggerUILoaded: function () {
                $('body').trigger('playerPoolLoaded', [this.bizHandle.playerList]);
            },

            showError: function (msg) {
                //TODO: Show the error of unable to fetch the playerlist.
                //$(this.rootElement).html('<tr class="alert alert-error"><td></td><td><strong>Error!!</strong>Error fetching player list.</td><td></td><td></td><td></td></tr>');
                if (msg) {
                    window.showMessage(msg);
                    console && console.log("Err: " + msg);
                }
            },

            hideError: function () {
                $(this.rootElement).html('');
            },

            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.init();

            },
            setScroll: function () {
                $('.scrollbox1').enscroll({
                    showOnHover: true,
                    verticalTrackClass: 'track3',
                    verticalHandleClass: 'handle3'
                });
            },

            resetFilters: function () {

            },

            refreshUI: function (playerList) {

                //var playerList = this.bizHandle.filterList;

                CricManager.TemplateService.renderTemplate(this.rootElement, this.templateName, playerList);
                this.setupUIElementsData(playerList);
                //this.playersUIDataMap = CricManager.UIBizMap.createMapArray($(this.playerListElement, this.rootElement), this.bizHandle.playerList);

                this.removeBindings();
                this.setUpBindings();
            },
            renderPlayers: function () {
                this.bizHandle.sortPlayers("Price", "descending");
                this.refreshUI(this.bizHandle.filterList);

                this.triggerUILoaded();
            },

            setupUIElementsData: function (dataList) {
                var context = CricManager.Players.View;
                $(this.playerListElement, this.rootElement).each(function (index, value) {
                    $(this).data(dataList[index]);
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
                    this.bizHandle.removePlayerFromList(userTeamList[i]);
                    //var uiElement = $.grep($(this.playerListElement, this.rootElement), function (element, index) {
                    //    return $(element).data('Id') == userTeamList[i].Id;
                    //});
                    ////trigger click function on the ui Element and it will remove the element automatically 
                    ////and trigger the addEvent on userTeam
                    //$(uiElement).click();
                    //$(uiElement).addClass('disable choosen');
                }
            },


            removeBindings: function () {
                //it turns off the mouseleave event(for tooltip), 
                $(this.rootElement).off('.playerPool');
                $('#rowPlayerTypeNav ul li.player-filters').off();
                $('#search_text').off();
                $('.team-filter').off();
                $('.sort-param').off();


                $('body').off('.playerPool');
            },

            setUpBindings: function () {
                var bizHandle = this.bizHandle;

                //destroying the tooltip as it is created every time the error is to be shown
                $(this.rootElement).on('mouseleave.playerPool', this.playerListElement, $.proxy(function () {
                    $(this.playerListElement, this.rootElement).tooltip('destroy');
                }, this));

                //playertype filter
                $('#rowPlayerTypeNav ul li.player-filters').on('click', function () {
                    if (bizHandle.playerType != $(this).data('category')) {
                        bizHandle.playerType = $(this).data('category');

                        bizHandle.changeFilter();
                        //i.e. reset the search box
                        CricManager.Players.View.resetNameFilters();
                    }
                });

                //filter player by team
                $('.team-list-item', '.team-filter').on('click.teamFilter', function () {
                    var selectedTeam = $('a', this).data('value')
                    if (bizHandle.playerTeam != selectedTeam) {
                        bizHandle.playerTeam = selectedTeam;
                        if (selectedTeam == "") {
                            selectedTeam = "All Teams";
                        }
                        $('#selectedTeam').html(selectedTeam);
                        bizHandle.changeFilter();
                        //i.e. reset the search box
                        CricManager.Players.View.resetNameFilters();
                    }
                });


                //filter player by name
                $('#search_text').on('keyup', function () {
                    if ($(this).val() != bizHandle.playerName) {
                        bizHandle.playerName = $(this).val();
                        bizHandle.filterPlayersbyName();
                        //CricManager.Players.View.changeFilterClass();
                    }
                });

                //sorting of filters
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
                    //i.e. reset the search box
                    CricManager.Players.View.resetNameFilters();
                    //return false;
                });

                //we are adding and removing players on the ui only ..... but a better way would be to do it from the service 
                //so that no one can change the selection by altering the script.
                $(this.rootElement).on('click.playerPool', this.choosePlayerElement, $.proxy(this.choosePlayer, this));
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

                var $target = $(e.currentTarget).parents(this.playerListElement);

                if ($target.is('.disable,.chosen')) {
                    return;
                }

                var removeResponse = {
                    status: false,
                    msg: 'Unable to choose this player.'
                };
                var data = $target.data();
                if (data) {
                    removeResponse = this.bizHandle.removePlayerFromList(data);
                    if (removeResponse.status) {
                        //TODO:Remove console log
                        console.log('remove player from player-pool initiated....');
                        var userTeamRootElement = CricManager.UserTeam.View.rootElement;
                        $(userTeamRootElement).trigger('addPlayer', [data, this.removePlayer, this.removeFailure, $target]);

                    } else {
                        this.logChooseError(removeResponse);
                        return;
                    }
                    //$(uiElement).fadeOut().html('CHOOSEN');
                    //return data;
                } else {
                    this.logChooseError(removeResponse);
                    return;
                }

            },
            //called when the add on the other side is successful as a confirmation
            //then we remove the element from UI
            removePlayer: function (data, uiElement) {
                //rather than fade out we are keeping the player there but greying it and disabliing click
                //$(uiElement).addClass('disable choosen');
                //only get notified when add is successful on other side
                console.log('Remove player from player-pool succeeded.');

            },
            //called when adding fails on the other side
            removeFailure: function (data, uiElement, msg) {
                //revert the remove from the list
                console.log('reverting the player changes in palyerTeam due to failure to add to the userTeam');
                var context = CricManager.Players.View;
                if (!context.bizHandle.addPlayerToList(data)) {
                    console.log('revert to player-pool also failed');
                    return;
                }

                //assuming that the only reason player can't be added on the user team is because the 
                //user team dosen't have space for this category of player.

                //INFO: no operation can be done on uiElement because the uiElement is already destroyed and new element is created
                //thus we are finding the uiElement
                $.each($(context.playerListElement, context.rootElement), function (index, value) {
                    if ($(this).data('Id') == data.Id) {
                        uiElement = this;
                    }
                });
                context.showChooseError(msg, uiElement);

            },
            showChooseError: function (msg, uiElement) {
                //TODO: show popover error msg here.
                $(uiElement, this.rootElement).tooltip({

                    title: msg,
                    trigger: 'manual'
                });
                $(uiElement, this.rootElement).tooltip('show');

                this.logChooseError(msg);
            },
            logChooseError: function (msg) {
                console.log('%cPlayerPool Err: ', 'color: red');
                console.log(msg);
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
                //        $(uiElement).removeClass('disable choosen');

                //        //CricManager.TemplateService.renderTemplate($(uiElement, this), context.playerTemplate, data);


                //    }
                //    //player single entry tempalte is used here.


                //}



            },
            resetNameFilters: function () {
                $('#search_text').val('');
                //$('#rowPlayerTypeNav a:first').tab('show');
                //$("#selectedTeam").html("All");

            },
            showLoader: function () {
                $('#playerPoolLoader').show();
            },
            hideLoader: function () {
                $('#playerPoolLoader').fadeOut(function () {
                    $('#playerPool').fadeIn();
                });
            }
        }

    };

    CricManager.Schedule = {
        Biz: {
            viewHandle: 'CricManager.Schedule.View',
            matchList: [],
            seriesId: '27736440632901917',
            matchCount: 4,
            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                this.viewHandle.showLoader();
                CricManager.HttpClient.get('/Services/CricManagerService.svc/Matches/' + this.seriesId + "/" + this.matchCount, this.scheduleListXHRSuccess, this.scheduleListXHRFailure, this);

                //TODO: comment this part when service is ready
                this.viewHandle.renderSchedule();
            },
            scheduleListXHRSuccess: function (data) {
                this.viewHandle.hideLoader();
                //change markup
                //this.matchList = [{ "AwayTeamName": "RCB", "Deadline": "\/Date(1365481800000+0530)\/", "HomeTeamName": "KKR", "MatchDate": "\/Date(1365493500000+0530)\/", "MatchId": "101", "MatchName": "first", "Type": 0, "Venue": "Kolkata" }, { "AwayTeamName": "MI", "Deadline": "\/Date(1365481800000+0530)\/", "HomeTeamName": "DD", "MatchDate": "\/Date(1365512400000+0530)\/", "MatchId": "102", "MatchName": "second", "Type": 0, "Venue": "Delhi" }, { "AwayTeamName": "DC", "Deadline": "\/Date(1365568200000+0530)\/", "HomeTeamName": "KP", "MatchDate": "\/Date(1365579900000+0530)\/", "MatchId": "103", "MatchName": "third", "Type": 0, "Venue": "Chandigarh" }, { "AwayTeamName": "RR", "Deadline": "\/Date(1365568200000+0530)\/", "HomeTeamName": "PWI", "MatchDate": "\/Date(1365598800000+0530)\/", "MatchId": "104", "MatchName": "fourth", "Type": 0, "Venue": "Pune" }, { "AwayTeamName": "DD", "Deadline": "\/Date(1365827400000+0530)\/", "HomeTeamName": "RCB", "MatchDate": "\/Date(1365839100000+0530)\/", "MatchId": "105", "MatchName": "fifth", "Type": 0, "Venue": "Bangalore" }, { "AwayTeamName": "KKR", "Deadline": "\/Date(1365827400000+0530)\/", "HomeTeamName": "RR", "MatchDate": "\/Date(1365858000000+0530)\/", "MatchId": "106", "MatchName": "sixth", "Type": 0, "Venue": "Jaipur" }];
                //console.log(data);
                this.matchList = data.Matches;


                this.viewHandle.renderSchedule();

            },
            scheduleListXHRFailure: function (err) {
                this.viewHandle.hideLoader();
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
                var matchList = this.bizHandle.matchList;

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
                    var dateTime = bizHandle.matchList[index].Deadline_Date + " " + bizHandle.matchList[index].Deadline_Time
                    $(this).countdown({ until: new Date(dateTime) });
                    //$(this).removeClass("hasCountdown");

                });
                /*----Carousel Settings-------*/
                $('.carousel').each(function () {
                    $(this).carousel({
                        interval: false
                    });
                });
                $('.right.carousel-control').on('click', function () {
                    var newValue = 'next';
                    var text = '&lsaquo;';
                    if ($(this).data('slide') === 'next') {
                        newValue = 'prev';
                        text = '&rsaquo;';
                    }
                    $(this).data('slide', newValue);
                    $(this).html(text);
                });


            },
            showLoader: function () {
                $('#scheduleLoader').show();
            },
            hideLoader: function () {
                $('#scheduleLoader').fadeOut(function () {
                    $('#carouselSchedule').fadeIn();
                });
            }

        }

    };

    CricManager.Teams = {
        Biz: {
            viewHandle: 'CricManager.Teams.View',
            seriesId: '27736440632901917',
            teamList: [],
            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                this.teamListXHRSuccess(CricManager.Globals.Teams);

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
            userTeamName: '',
            userTeamBalance: 10000000,
            userTeamCaptain: '',
            userTeamTransfers: '',
            userTeamCombination: 'C_4_2_1_4',

            isUserTeamValidated: false,

            playersCount: 0,
            overseasPlayerCount: 0,
            allowedOverseasPlayers: 4,
            allowedSameTeamPlayersCount: 5,


            seriesId: '27736440632901917',
            userId: '20001782967174406',


            removePlayerFromTeam: function (data) {
                var index = CricManager.Search.findIndex(this.userTeamList, data, 'Id');
                if (index != -1) {
                    this.userTeamList[index] = { Type: data.Type };
                    //decrement the overseas players count in your team if the removed player is overseas
                    if (data.Nationality != 'Indian') {
                        this.overseasPlayerCount--;
                    }

                    this.userTeamBalance = this.userTeamBalance + data.Price;
                    //return decides weather we remove it in the ui or not.
                    return true;
                    //this.viewHandle.renderUserTeam();
                }
                return false;
            },
            addPlayerToTeam: function (data) {
                //check that player should not be repeated
                if (CricManager.Search.findIndex(this.userTeamList, data, 'Id') == -1) {

                    var emptyIndex = this.findEmptySpace(data);
                    if (emptyIndex != -1) {
                        var bal = this.userTeamBalance - data.Price;
                        if (bal < 0) {
                            //this.viewHandle.showError("You don't have enough balance to buy this player.");

                            return {
                                status: false,
                                msg: "You don't have enough balance to buy this player."
                            };
                        } else if (data.Nationality != 'Indian') {
                            if (this.overseasPlayerCount == this.allowedOverseasPlayers) {
                                //this.viewHandle.showError("You can't have more than " + this.allowedOverseasPlayers + "overseas players in a team.");
                                //return false to make sure the ui rejects the change
                                return {
                                    status: false,
                                    msg: "You can't have more than " + this.allowedOverseasPlayers + " overseas players."
                                };
                            } else {
                                //increment the overseas player count if allowed
                                this.overseasPlayerCount++;
                            }
                        } else if(!this.validateSamePlayerCount(data)){           
                            //validating the playercount for number of players from same team
                            return {
                                status: false,
                                msg: "You can't have more than " + this.allowedSameTeamPlayersCount + " players from same team."
                            };
                        }


                        this.userTeamBalance = bal;
                        this.userTeamList[emptyIndex] = data;

                        return {
                            status: true,
                            msg: 'Player added successfully to team.'
                        };
                    }
                    //this.viewHandle.renderUserTeam();
                }

                return {
                    status: false,
                    msg: 'Your team is complete.'
                };

            },
            validateSamePlayerCount: function (data) {
                var i = 0;
                var previousPlayerCount = 0;
                for (i = 0; i < this.userTeamList.length; i++) {
                    if (this.userTeamList[i].Id && this.userTeamList[i].FullTeamName === data.FullTeamName) {
                        previousPlayerCount++;
                    }
                }
                if (previousPlayerCount == this.allowedSameTeamPlayersCount) {
                    return false;
                }
                return true;                
            },
            //TODO: implement an empty function for this later on or modify the filter code to work for this one too
            //i.e. multiple filters
            findEmptySpace: function (data) {
                var i = 0;
                for (i = 0; i < this.userTeamList.length; i++) {
                    if (!this.userTeamList[i].Id && this.userTeamList[i].Type == data.Type) {
                        return i;
                    }
                }
                return -1;

            },
            findPlayers: function (data) {
                return CricManager.Search.findObjects(this.userTeamList, data, "Id");
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
                //this.viewHandle.showLoading();
                //var tempTeamArray = ['1', '2', '3', '4', '5', '6', '7'];
                //this.getTeamXHRSuccess(tempTeamArray);
                //TODO: uncomment this when service is working and remove the above temp array creation and service call
                this.viewHandle.showLoader();
                CricManager.HttpClient.get('/Services/UserService.svc/UserTeam', this.getTeamXHRSuccess, this.getTeamXHRFailure, this);
            },
            getTeamXHRSuccess: function (data) {

                if (!data.Error) {
                    this.userDetail = data;
                    this.userTeamBalance = data.Balance;
                    this.overseasPlayerCount = 0;
                    $.each(data.Players, $.proxy(function (index, val) {
                        if (val.Nationality != "Indian")
                            this.overseasPlayerCount++;
                    }, this));
                    this.userTeamName = data.Name;
                    this.userTeamCaptain = data.CaptainId
                    this.userTeamTransfers = data.TransfersLeft;
                    this.userTeamList = data.Players;
                    this.userTeamCombination = data.Formation;
                }

                if (!this.userTeamList || this.userTeamList.length != 11) {
                    this.createEmptyTeam();
                }

                this.viewHandle.renderUserTeam();
                this.viewHandle.hideLoader();
            },
            getTeamXHRFailure: function (err) {
                this.viewHandle.hideLoader();
                this.viewHandle.showError();
            },

            createTeam: function () {

                this.viewHandle.showLoader();
                this.createMyTeam();
                this.viewHandle.renderUserTeam();
                this.viewHandle.hideLoader();

            },
            createTeamXHRSuccess: function (data) {
            },
            createTeamXHRFailure: function (err) {
            },



            saveTeam: function () {
                this.ValidateUserTeamName();
                if (this.isUserTeamValidated) {
                    if (this.validateSaveRQ()) {
                        //this.viewHandle.showSaving();
                        //service won't working now.....
                        //
                        var saveRQ = JSON.stringify(this.createSaveRequest());
                        //var data = JSON.stringify(this.userTeamList);


                        this.viewHandle.showLoader();
                        CricManager.HttpClient.post('/Services/UserService.svc/SaveTeam', this.saveTeamXHRSuccess, this.saveTeamXHRFailure, saveRQ, this);
                    } else {

                        //console.log('cant save as team dont have captain');
                        //this.viewHandle.showError("Select a Captain");
                        console.log('Save team failed.');
                    }
                }
            },
            saveTeamOnLoginFlow: function () {
                this.ValidateUserTeamName();
                console.log("Save Team On Login Flow Called OutSide outer If");
                if (CricManager.UserTeam.Biz.isUserTeamValidated) {
                    console.log("Save Team On Login Flow Called inside outer If");
                    var totalPlayers = this.viewHandle.batsmanCount + this.viewHandle.allRounderCount + this.viewHandle.keeperCount + this.viewHandle.bowlerCount;
                    if (totalPlayers == 11 && this.userTeamCaptain) {
                        console.log("Save Team On Login Flow Called inside inside if");
                        var saveRQ = JSON.stringify(this.createSaveRequest());
                        this.viewHandle.showLoader();
                        CricManager.HttpClient.post('/Services/UserService.svc/SaveTeam', this.saveTeamXHRSuccess, this.saveTeamXHRFailure, saveRQ, this);

                    }

                }
            },
            validateSaveRQ: function () {
                var totalPlayers = this.viewHandle.batsmanCount + this.viewHandle.allRounderCount + this.viewHandle.keeperCount + this.viewHandle.bowlerCount;
                if (totalPlayers == 11 && this.userTeamCaptain) {

                    return true;
                }
                else {
                    if (totalPlayers != 11)
                        this.viewHandle.showError("Your team should consist of exactly 11 players.");
                    else
                        this.viewHandle.showError("Select a Captain.");
                }
                return false;
            },
            ValidateUserTeamName: function () {


                var teamName = $("#txtTeamName").val();
                if (teamName == "") {
                    teamName = $("#txtTeamName").text();
                    if (teamName != "") {
                        CricManager.UserTeam.Biz.isUserTeamValidated = true;
                        return;
                    }
                    else {
                        CricManager.UserTeam.View.showError("Your team should have a name.");
                        CricManager.UserTeam.Biz.isUserTeamValidated = false;
                        return;
                    }
                }

                $.ajax({
                    type: "GET",
                    url: 'Services/AvailabilityService.svc' + '/GetTeamNameAvailability/' + teamName,
                    async: true,
                    success: function (msg) {
                        console.log(msg);


                        if (msg == true) {
                            // if you don't want background color remove these following two lines
                            CricManager.UserTeam.Biz.isUserTeamValidated = true;
                        }
                        else {
                            // if you don't want background color remove these following two lines
                            CricManager.UserTeam.View.showError("Team name has already been taken. Please try something different.");
                            //this.viewHandle.showError("Selected Team name is not avilable.Please try a different name");
                            CricManager.UserTeam.Biz.isUserTeamValidated = false;
                        }


                    },
                    error: function (err) {
                        console.log("Error");
                        console.log(err);
                        CricManager.UserTeam.Biz.isUserTeamValidated = false;
                    }

                });




            },
            saveTeamXHRSuccess: function (data) {
                //this.viewHandle.hideSaving();
                this.viewHandle.hideLoader();
                if (!data.Error) {
                    this.userTeamList = data.Players;
                    this.userTeamName = data.Name;
                    this.userTeamBalance = data.Balance;
                    this.overseasPlayerCount = 0;
                    $.each(data.Players, $.proxy(function (index, val) {
                        if (val.Nationality != "Indian")
                            this.overseasPlayerCount++;
                    }, this));
                    this.userTeamCaptain = data.CaptainId;
                    this.userTeamTransfers = data.TransfersLeft;
                    this.userTeamCombination = data.Formation;
                    CricManager.UserTeam.View.refreshUI();
                    //save is successcul show message here
                    //or call handle success messsage here
                } else {
                    //call handle error function
                    this.viewHandle.showError(data.Error.ErrorMessage);
                }

            },
            saveTeamXHRFailure: function (err) {
                this.viewHandler.hideLoader();
                //this.viewHandle.hideSaving();
                this.viewHandle.showError("err");

            },

            createSaveRequest: function () {
                var i = 0;
                var playerIDs = [];
                for (i = 0; i < this.userTeamList.length; i++) {
                    playerIDs.push(this.userTeamList[i].Id);
                }
                var saveRQ = {
                    Name: this.userTeamName,
                    PlayerIds: playerIDs,
                    Formation: this.userTeamCombination,
                    CaptainId: this.userTeamCaptain
                };
                return saveRQ;
            },
            createEmptyTeam: function () {
                var i = 0;
                var list = [];
                var batsman = 0, allRounder = 0, keeper = 0, bowler = 0;

                var counts = this.userTeamCombination.split('_');
                if (counts.length == 5) {
                    batsman = parseInt(counts[1]);
                    allRounder = batsman + parseInt(counts[2]);
                    keeper = allRounder + parseInt(counts[3]);
                    bowler = keeper + parseInt(counts[4]);
                }
                var total = batsman + allRounder + keeper + bowler;
                while (i < total) {
                    if (i < batsman) {
                        list.push({ "Type": "Batsman" });
                    } else if (i < allRounder) {
                        list.push({ "Type": "AllRounder" });
                    } else if (i < keeper) {
                        list.push({ "Type": "WicketKeeper" });
                    } else if (i < bowler) {
                        list.push({ "Type": "Bowler" });
                    }
                    i++;
                }

                this.userTeamList = list;
                //this.userTeamBalance = 1000000;
            },

            getRandomArrayElements: function (arr, count) {
                var randoms = [], clone = arr.slice(0);
                for (var i = 0, index; i < count; ++i) {
                    index = Math.floor(Math.random() * clone.length);
                    randoms.push(clone[index]);
                    clone[index] = clone.pop();
                }
                return randoms;

            },

            createMyTeam: function () {
                var i = 0;
                var list = [];
                var batsman = 0, allRounder = 0, keeper = 0, bowler = 0;
                var rnd = 0;
                var obj = {};
                var price = 0;
                var overSeasPlayerCnt = 0;
                var counts = this.userTeamCombination.split('_');
                if (counts.length == 5) {
                    batsman = parseInt(counts[1]);
                    allRounder = parseInt(counts[2]);
                    keeper = parseInt(counts[3]);
                    bowler = parseInt(counts[4]);
                    var total = batsman + allRounder + keeper + bowler;
                    var batsmanList = objectFilter("BatsMan", CricManager.Players.Biz.playerList, { property: 'Type' });
                    var allRounderList = objectFilter("AllRounder", CricManager.Players.Biz.playerList, { property: 'Type' });
                    var wicketKepperList = objectFilter("WicketKeeper", CricManager.Players.Biz.playerList, { property: 'Type' });
                    var bowlerList = objectFilter("Bowler", CricManager.Players.Biz.playerList, { property: 'Type' });
                    $.each(this.getRandomArrayElements(batsmanList, batsman), function (inex, val) {
                        list.push(val);
                        if (val.Nationality != 'Indian')
                            overSeasPlayerCnt += 1;
                        price += val.Price;
                    });
                    $.each(this.getRandomArrayElements(allRounderList, allRounder), function (inex, val) {
                        list.push(val);
                        if (val.Nationality != 'Indian')
                            overSeasPlayerCnt += 1;
                        price += val.Price;
                    });
                    $.each(this.getRandomArrayElements(wicketKepperList, keeper), function (inex, val) {
                        list.push(val);
                        if (val.Nationality != 'Indian')
                            overSeasPlayerCnt += 1;
                        price += val.Price;
                    });
                    $.each(this.getRandomArrayElements(bowlerList, bowler), function (inex, val) {
                        list.push(val);
                        if (val.Nationality != 'Indian')
                            overSeasPlayerCnt += 1;
                        price += val.Price;
                    });


                    if (price > 10000000 || overSeasPlayerCnt > 4) {

                        this.createMyTeam();
                    }
                    else {
                        this.userTeamBalance = 10000000 - price;
                        this.userTeamList = list;
                        this.overseasPlayerCount = overSeasPlayerCnt;
                    }
                }
            },
        },
        View: {
            bizHandle: 'CricManager.UserTeam.Biz',
            rootElement: '#yourTeamWrap',

            teamName: '',
            teamNameElement: '.yourTeamTitle',
            teamBalanceElement: '.balanceWrp',
            teamTransfersElement: '.transferWrp',
            teamPlayersElement: '.playerTshirtwrap',
            teamCombinationElement: '.combinationWrp',

            teamNameTemplate: 'user-team-name',
            teamBalanceTemplate: 'user-team-balance',
            teamTransfersTemplate: 'user-team-transfers',
            teamCombinationTemplate: 'user-team-combination',
            teamPlayersTemplate: 'user-team-players',
            teamPlayerTemplate: 'user-team-player',

            playerBlockElement: '.player-block',
            removeElement: '.linkRemove',
            captainElement: '.linkMkCaptain',
            saveElement: '.saveteam',
            compositionElement: '.compositionSelector',
            selectedCompositionElement: '.selectedComposition',
            createTeamElement: '.createmyteam',
            clearTeamElement: '.clearTeam',
            userTeamUIDataMap: [],
            batsmanUIMap: [],
            batsmanCount: 0,
            allRounderUIMap: [],
            allRounderCount: 0,
            keeperUIMap: [],
            keeperCount: 0,
            bowlerUIMap: [],
            bowlerCount: 0,

            overseasPlayerCount: 0,

            refreshUI: function () {


                //this.bizHandle.userTeamList = [{ "FirstName": "Dale", "LastName": "Steyn", "MiddleName": "", "Nationality": "Overseas", "Id": 123, "Type": "Bowler", "Points": 0, "Price": 6, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" }, { "FirstName": "Ricky", "LastName": "Ponting", "MiddleName": "", "Nationality": "Overseas", "Id": 154, "Type": "Batsman", "Points": 0, "Price": 2, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" }, { "FirstName": "Mahendra", "LastName": "Dhoni", "MiddleName": "Singh", "Nationality": "Indian", "Id": 265, "Type": "WicketKeeper", "Points": 0, "Price": 4, "ShortTeamName": "MI", "TeamName": "MumbaiIndians" }, { "FirstName": "Sachin", "LastName": "Tendulkar", "MiddleName": "", "Nationality": "Indian", "Id": 648, "Type": "Batsman", "Points": 0, "Price": 2, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" }, { "FirstName": "Chris", "LastName": "Gayle", "MiddleName": "", "Nationality": "Overseas", "Id": 147, "Type": "Batsman", "Points": 0, "Price": 11, "ShortTeamName": "KKR", "TeamName": "KolkataKnightRiders" }];
                //giving empty array in renderTemplate so that it renders all the empty divs and then players are added by the playerpool when it checks.

                this.renderTeamName(this.bizHandle.userTeamName);
                this.renderBalance(this.bizHandle.userTeamBalance);
                this.renderTransfers(this.bizHandle.userTeamTransfers);
                this.renderPlayers(this.bizHandle.userTeamList);
                this.renderCombination(this.bizHandle.userTeamCombination);


                //TO THINK: removeBindings can be called by setUpBindings before setting up the bindings
                this.removeBindings();
                this.setUpBindings();

                this.userTeamUIDataMap = CricManager.UIBizMap.createMapArray($(this.playerBlockElement, this.rootElement), this.bizHandle.userTeamList);
                var $captainUIElement = this.findCaptain();
                if ($captainUIElement) {
                    $($captainUIElement).find('div.captain-div').addClass('captain');
                }
                this.setupComposition();
            },
            findCaptain: function () {
                var mapElement = CricManager.UIBizMap.getElement(this.userTeamUIDataMap, { Id: this.bizHandle.userTeamCaptain }, 'Id');
                if (mapElement.length > 0) {
                    return mapElement[0].uiElement;
                } else {
                    return undefined;
                }
            },

            triggerUIReady: function () {
                var listCopy = this.bizHandle.userTeamList;
                //this.bizHandle.userTeamList = [];
                if (CricManager.Globals.PlayerPoolLoaded) {
                    $('body').trigger('userTeamLoaded', [listCopy]);
                } else {
                    setTimeout($.proxy(this.triggerUIReady, this), 300);
                }

            },
            showLoader: function () {
                $('#teamLoader').show();
                $('#playerTshirtwrap').hide();
            },
            hideLoader: function () {
                $('#teamLoader').fadeOut(function () {
                    $('#playerTshirtwrap').fadeIn();
                });
            },

            showSaving: function () {
                //do some loader and saving loader logic here.
            },
            hideSaving: function () {
                //do some loader and saving loader logic here
            },

            showError: function (msg) {
                if (msg) {
                    window.showMessage(msg);
                    console && console.log("Err: " + msg);
                }
                //TODO: use better error mechanism
                //$(this.rootElement).html('<div class="alert alert-danger"><strong>Error!!</strong>Error Fetching User Data</div>');
            },
            hideError: function () {
                //TODO: use better error mechanism
                //$(this.rootElement).html('');
            },

            ready: function () {
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);
                this.bizHandle.saveTeamOnLoginFlow();
                this.bizHandle.init();

            },
            renderUserTeam: function () {
                this.refreshUI();
                this.triggerUIReady();
            },

            renderCombination: function (data) {
                this.bizHandle.userTeamCombination = data;
                var combinationText = $("ul.compositionSelector").find("[data-value='" + data + "']").html();
                $(this.selectedCompositionElement, this.rootElement).html('<b>' + combinationText + '</b>');
            },

            renderTransfers: function (data) {
                CricManager.TemplateService.renderTemplate($(this.teamTransfersElement, this.rootElement), this.teamTransfersTemplate, data);
            },
            renderBalance: function (data) {
                CricManager.TemplateService.renderTemplate($(this.teamBalanceElement, this.rootElement), this.teamBalanceTemplate, data);
            },
            renderTeamName: function (data) {
                CricManager.TemplateService.renderTemplate($(this.teamNameElement, this.rootElement), this.teamNameTemplate, data);
            },
            renderPlayers: function (data) {
                CricManager.TemplateService.renderTemplate($(this.teamPlayersElement, this.rootElement), this.teamPlayersTemplate, data);
            },



            /**
             * This method is called each time the user changes the composition from the dropdown.
             * the context(this) of this function is the userTeam object not the event element.
             * The context is changed using the $.proxy method of jQuery
             */
            setupComposition: function () {
                //TODO: need to change this method if we want to keep the order as any order
                var batsman = 0, allRounder = 0, keeper = 0, bowler = 0, index = 0;
                this.batsmanUIMap = []; this.allRounderUIMap = []; this.keeperUIMap = []; this.bowlerUIMap = [];

                var counts = this.bizHandle.userTeamCombination ? this.bizHandle.userTeamCombination.split('_') : [];
                if (counts.length == 5) {
                    batsman = parseInt(counts[1]);
                    allRounder = batsman + parseInt(counts[2]);
                    keeper = allRounder + parseInt(counts[3]);
                    bowler = keeper + parseInt(counts[4]);
                }
                this.batsmanCount = 0; this.allRounderCount = 0; this.keeperCount = 0, this.bowlerCount = 0;
                while (index < this.userTeamUIDataMap.length) {
                    if (index < batsman) {
                        this.userTeamUIDataMap[index].uiElement.addClass('batsman');
                        //that means earlier other player than batsman was there thus resetting its data
                        // and setting data.Type to 'Batsman'
                        if (this.userTeamUIDataMap[index].data.Type != 'Batsman') {
                            this.userTeamUIDataMap[index].data = { Type: 'Batsman' };
                        }
                        //else the player at that position is valid and will not be removed

                        //this.userTeamUIDataMap[index].data.Type = "Batsman";
                        this.batsmanUIMap.push(this.userTeamUIDataMap[index]);
                        if (this.userTeamUIDataMap[index].data.Id) {
                            //recalculating the counts too
                            this.batsmanCount++;
                        }
                    } else if (index < allRounder) {
                        this.userTeamUIDataMap[index].uiElement.addClass('allRounder');
                        if (this.userTeamUIDataMap[index].data.Type != 'AllRounder') {
                            this.userTeamUIDataMap[index].data = { Type: 'AllRounder' };
                        }
                        //this.userTeamUIDataMap[index].data.Type = "AllRounder";
                        this.allRounderUIMap.push(this.userTeamUIDataMap[index]);
                        if (this.userTeamUIDataMap[index].data.Id) {
                            this.allRounderCount++;
                        }
                    } else if (index < keeper) {
                        this.userTeamUIDataMap[index].uiElement.addClass('keeper');
                        if (this.userTeamUIDataMap[index].data.Type != 'WicketKeeper') {
                            this.userTeamUIDataMap[index].data = { Type: 'WicketKeeper' };
                        }
                        //this.userTeamUIDataMap[index].data.Type = "WicketKeeper";
                        this.keeperUIMap.push(this.userTeamUIDataMap[index]);
                        if (this.userTeamUIDataMap[index].data.Id) {
                            this.keeperCount++;
                        }
                    } else if (index < bowler) {
                        this.userTeamUIDataMap[index].uiElement.addClass('bowler');
                        if (this.userTeamUIDataMap[index].data.Type != 'Bowler') {
                            this.userTeamUIDataMap[index].data = { Type: 'Bowler' };
                        }
                        //this.userTeamUIDataMap[index].data.Type = "Bowler";
                        this.bowlerUIMap.push(this.userTeamUIDataMap[index]);
                        if (this.userTeamUIDataMap[index].data.Id) {
                            this.bowlerCount++;
                        }
                    }
                    index += 1;
                }
                //TODO: Anshul
                //recalculating the userTeamList as it also breaks when composition changed
                //although it should not break if the validate composition works correctly
                //thus when validateComposition is corrected these line should be removed
                CricManager.UserTeam.Biz.userTeamList = [];
                $.each(this.userTeamUIDataMap, function () {
                    CricManager.UserTeam.Biz.userTeamList.push(this.data);
                });

            },

            /**
             * setup binding and remove bindings should always be synced because all the registered events should be
             * removed when deleting element
             */
            setUpBindings: function () {
                //$('.remove-player', this.playerBlockElement).on('click', this.removePlayer);
                $(this.playerBlockElement, this.rootElement).on('click.userTeam', this.removeElement, $.proxy(this.removePlayer, this));
                $(this.playerBlockElement, this.rootElement).on('click.userTeam', this.captainElement, $.proxy(this.setCaptain, this));

                $()
                $(this.rootElement).on('addPlayer.userTeam.evnt', $.proxy(this.handleChoosePlayer, this));
                $(this.saveElement, this.rootElement).on('click.userTeam', $.proxy(this.saveTeam, this));
                $(this.createTeamElement, this.rootElement).on('click.userTeam', $.proxy(this.createTeam, this));
                $(this.clearTeamElement, this.rootElement).on('click.userTeam', $.proxy(this.clearTeam, this));

                $(this.compositionElement, this.rootElement).on('click.userTeam', 'a', $.proxy(this.changeComposition, this));
                $("#writeTeamName").on('click', function () {
                    $("#divYourTeamName").html('<input type="text" id="txtTeamName" class="translucentBG  customDropdown innerShadow span4" placeholder="your team name" style="border:1px solid #DF6B2B; height:30px; margin-bottom:0px !important;"><a href="javaScript:void(0);" class="" id="writeTeamName"><i class="icon-pencil icon-white"></i></a><a href="#" class=" randomTeam pull-right createmyteam" title="Click to get a random team">&nbsp;&nbsp;&nbsp;&nbsp;</a>');
                });

                $('body').on('userLoginLogout.userTeam.evnt', $.proxy(this.handleUserLoginLogout, this));

            },

            /**
             * this method should be called just before the setupbinding and removes all the bindings setup
             * by the setUpBindings method
             */
            removeBindings: function () {
                //removing the handle choose player
                $(this.rootElement).off('.userTeam');
                //removing the save functionality
                $(this.saveElement).off('.userTeam');
                //removing the setcaptain
                $(this.playerBlockElement, this.rootElement).off('.userTeam');
                $(this.compositionElement, this.rootElement).off('.userTeam');

                //removing userChanged event handling
                $('body').off('userLoginLogout.userTeam.evnt');
                $("#writeTeamName").off();
                $("#txtTeamName").off();
            },

            /**
             * @param e
             * This function is called when the composition is changed from the composition dropdown
             * and context(this) in this function is the userTeam object
             */
            changeComposition: function (e) {

                var $target = $(e.currentTarget);
                var $selectedElement = $target;
                var newComposition = $selectedElement.data('value');

                var validateResponse = this.validateComposition(newComposition);
                if (validateResponse.status) {

                    var removedData = [];
                    //count was valid but the positions are not valid for some players
                    // thus removing the players and then adding after changing the ui
                    if (validateResponse.type == 'Position') {

                        $.each(validateResponse.invalidElements, $.proxy(function (index, ele) {
                            var removeResponse = this.removePlayerHandler(ele, true);
                            if (removeResponse.status == true) {
                                removedData.push(removeResponse.data);
                            }

                        }, this));
                    } this.bizHandle.userTeamCombination = newComposition;
                    this.setupComposition();

                    //TODO: Anshul
                    //set the markup for selected element
                    //although this should not be necessary as we are refreshing the UI which resets all the
                    //templates in this(userTeam) block
                    $(this.selectedCompositionElement, this.rootElement).html('<b>' + $selectedElement.text() + '</b>');

                    //TODO: Anshul
                    //there should not be any need to do this refresh if we are validating the composition correctely
                    //thus try to remove this method if the validateComposition method is corrected.
                    this.refreshUI();

                    if (removedData.length) {
                        $.each(removedData, $.proxy(function (index, data) {
                            this.addPlayer(data);
                        }, this));
                    }
                    console.log('changed composition to ' + newComposition);

                } else {
                    console.log('roll backing composition ' + newComposition);
                }



            },

            /**
                * validate composition validates on the basis of:
                * split counts of the composition
                * batsman, allRounder, keeper, bowler count.
                * position of batsman, allRounder, keeper, bowler as per new composition.
                * returns an object containing the status which determines the validation status
                */
            validateComposition: function (newComposition) {
                var counts = newComposition.split('_');
                var invalidElements = [], invalidIndexes = [];
                var batsman = parseInt(counts[1])
                var allRounder = batsman + parseInt(counts[2]);
                var keeper = allRounder + parseInt(counts[3]);
                var bowler = keeper + parseInt(counts[4]);
                var total = parseInt(counts[1]) + parseInt(counts[2]) + parseInt(counts[3]) + parseInt(counts[4]);

                var index = 0;
                if (counts.length == 5) {
                    //check composition by count
                    if (this.batsmanCount > counts[1] || this.allRounderCount > counts[2] || this.keeperCount > counts[3] ||
                        this.bowlerCount > counts[4]) {
                        this.showError('You need to remove certain players to change the combination.');
                        return {
                            status: false,
                            msg: 'You need to remove certain players to change the combination.',
                            type: 'Count'
                        };
                    } else {
                        //validate composition by positions
                        while (index < total) {
                            if (index < batsman) {
                                if (this.userTeamUIDataMap[index].data.Id &&
                                    this.userTeamUIDataMap[index].data.Type != 'Batsman') {
                                    invalidElements.push(this.userTeamUIDataMap[index].uiElement);
                                    invalidIndexes.push(index);
                                }
                            } else if (index < allRounder) {
                                if (this.userTeamUIDataMap[index].data.Id &&
                                    this.userTeamUIDataMap[index].data.Type != 'AllRounder') {
                                    invalidElements.push(this.userTeamUIDataMap[index].uiElement);
                                    invalidIndexes.push(index);
                                }
                            } else if (index < keeper) {
                                if (this.userTeamUIDataMap[index].data.Id &&
                                    this.userTeamUIDataMap[index].data.Type != 'WicketKeeper') {
                                    invalidElements.push(this.userTeamUIDataMap[index].uiElement);
                                    invalidIndexes.push(index);
                                }
                            } else if (index < bowler) {
                                if (this.userTeamUIDataMap[index].data.Id &&
                                    this.userTeamUIDataMap[index].data.Type != 'Bowler') {
                                    invalidElements.push(this.userTeamUIDataMap[index].uiElement);
                                    invalidIndexes.push(index);
                                }
                            }
                            index += 1;
                        }
                        if (invalidElements.length) {
                            //this.showError('Combination is invalid. Players at the highlighted positions need to be replaced.');
                            //$.each(invalidElements, function (index, element) {
                            //    $(element).addClass('highlight-selection');
                            //    setTimeout(function () {
                            //        $(element).removeClass('highlight-selection');
                            //    }, 5000);

                            //});
                            return {
                                status: true,
                                msg: 'Combination is invalid. Players at the highlighted positions need to be replaced.',
                                type: 'Position',
                                invalidElements: invalidElements
                            };

                        }
                    }
                }
                else {
                    this.showError('This is an invalid combination.');
                    return {
                        status: false,
                        msg: 'This is an invalid combination.',
                        type: 'Position'
                    };
                }
                return {
                    status: true,
                    type: 'none',
                    msg: 'Valid composition.'
                };
            },

            saveTeam: function () {
                var totalCount = this.batsmanCount + this.allRounderCount + this.keeperCount + this.bowlerCount;

                if (totalCount === 11) {
                    this.bizHandle.userTeamName = $("#txtTeamName").val() || $("#txtTeamName").text();
                    if (this.bizHandle.userTeamName) {
                        this.bizHandle.saveTeam();
                    }
                    else {
                        this.showError("Your team should have a name.");
                    }
                } else {
                    this.showError("Your team should consist of exactly 11 players.");
                }


            },
            createTeam: function () {
                //this.clearTeam();
                //CricManager.Players.View.refreshUI(CricManager.Players.Biz.filterList);
                // CricManager.Players.View.refreshUI(CricManager.Players.Biz.filterList);
                this.removeAllPlayers();
                this.bizHandle.createTeam();

            },
            clearTeam: function () {
                this.bizHandle.createEmptyTeam();

            },
            setCaptain: function (e) {
                //getting the list element of the clicked element
                var $selectedElement = $(e.currentTarget).parents(this.playerBlockElement);

                $(this.playerBlockElement, this.rootElement).find('div.captain-div').removeClass('captain');
                $($selectedElement).find('div.captain-div').addClass('captain');

                var data = CricManager.UIBizMap.getData(this.userTeamUIDataMap, $selectedElement)[0];
                this.bizHandle.userTeamCaptain = data.data.Id;

            },


            removeAllPlayers: function () {
                var elements = $(this.playerBlockElement, this.rootelement);
                $.each(elements, $.proxy(function (idx, val) {
                    this.removePlayerHandler($(val), false)
                }, this))
            },
            //remove the player from list
            //context is set to this using jQuery.proxy 
            //assuming parent element of clicked element is our target element
            removePlayer: function (e) {
                //var context = CricManager.UserTeam.View;
                var $selectedElement = $(e.currentTarget).parents(this.playerBlockElement);
                this.removePlayerHandler($selectedElement);

            },
            removePlayerHandler: function ($selectedElement, isInternal) {
                var $captainElement = $($selectedElement).find('div.captain-div');
                if ($captainElement.is('.captain')) {
                    $captainElement.removeClass('captain');
                    this.bizHandle.userTeamCaptain = null;
                }

                var data = CricManager.UIBizMap.popData(this.userTeamUIDataMap, $selectedElement);

                //It will remove player from the first team of user
                //remove from ui if successful
                if (this.bizHandle.removePlayerFromTeam(data)) {

                    console.log('player remove from userTeam initiated....');
                    //call the playerpool add player
                    if (!isInternal) {
                        var playerListRootElement = CricManager.Players.View.rootElement;
                        $(playerListRootElement).trigger('addPlayer', [data, this.removePlayerFromUI, this.revertRemovePlayer, $selectedElement]);
                        this.renderBalance(this.bizHandle.userTeamBalance);
                    }


                    return {
                        status: true,
                        data: data
                    };
                } else {
                    return {
                        status: false
                    }
                }

                //To stop the bubbling of the event
                //return false;
            },
            removePlayerFromUI: function (uiElement, data) {
                //TODO: can use some template in case of blank data.
                //TODO: pending to add animations here.
                console.log('player remove from userTeam successful');
                var context = CricManager.UserTeam.View;

                $(uiElement).removeClass("jersey-" + data.ShortTeamName);
                $(uiElement).addClass("jersey-blank");
                //rebinding the tempalte does not remove the active clas from the li element which we have to do it manually
                $(uiElement).removeClass('active');
                CricManager.TemplateService.renderTemplate(uiElement, context.teamPlayerTemplate, { Type: data.Type });




                context.managePlayerCount(data, 'remove');
            },
            revertRemovePlayer: function (data) {
                console.log('userteam removeplayer failed reverting the userteam player remove....');
                var context = CricManager.UserTeam.View;
                if (!context.bizHandle.addPlayerToTeam(data).status) {
                    //status denotes that the operation is true or false.
                    console.log('revert of userteam failed');
                }
            },
            managePlayerCount: function (data, type) {

                if (data.Type == 'Batsman') {
                    if (type == 'add') {
                        this.batsmanCount++;
                    } else {
                        this.batsmanCount--;
                    }
                }
                else if (data.Type == 'AllRounder') {
                    if (type == 'add') {
                        this.allRounderCount++;
                    } else {
                        this.allRounderCount--;
                    }
                }
                else if (data.Type == 'WicketKeeper') {
                    if (type == 'add') {
                        this.keeperCount++;
                    } else {
                        this.keeperCount--;
                    }
                }
                else if (data.Type == 'Bowler') {
                    if (type == 'add') {
                        this.bowlerCount++;
                    } else {
                        this.bowlerCount--;
                    }
                }
            },

            //Event raised when user is logged in
            handleUserLoginLogout: function () {
                console.log('reloading the userTeam cuz of login or logout action....');
                this.ready();
                console.log('userteam reloaded');
            },

            //Event: raised by element who want to add data in this area. takes args = (event, data)
            handleChoosePlayer: function (e, data, callbackSuccess, callbackFailure, callbackValue) {
                this.addPlayer(data, callbackSuccess, callbackFailure, callbackValue);

            },
            addPlayer: function (data, callbackSuccess, callbackFailure, callbackValue) {



                //TODO: find the ui element as per teamComposition of player
                var uiElement;
                if (data.Type == 'Batsman') {
                    uiElement = CricManager.UIBizMap.pushData(this.batsmanUIMap, data, 'Id');
                } else if (data.Type == 'AllRounder') {
                    uiElement = CricManager.UIBizMap.pushData(this.allRounderUIMap, data, 'Id');
                } else if (data.Type == 'WicketKeeper') {
                    uiElement = CricManager.UIBizMap.pushData(this.keeperUIMap, data, 'Id');
                } else if (data.Type == 'Bowler') {
                    uiElement = CricManager.UIBizMap.pushData(this.bowlerUIMap, data, 'Id');
                }

                var addResponse = {
                    status: false,
                    msg: data.Type + ' slots already full'
                };

                if (uiElement) {
                    var $targetElement = $(uiElement, this);
                    //user-team list single entry template is used here.
                    addResponse = this.bizHandle.addPlayerToTeam(data);
                    if (addResponse.status) {
                        //inside this if means add is successful


                        this.renderBalance(this.bizHandle.userTeamBalance);
                        CricManager.TemplateService.renderTemplate($targetElement, this.teamPlayerTemplate, data);

                        $targetElement.removeClass("jersey-blank");
                        $targetElement.addClass("jersey-" + data.ShortTeamName);
                        $targetElement.addClass('highlight-selection');
                        setTimeout(function () {
                            $targetElement.removeClass('highlight-selection');
                        }, 2000);

                        //call success callback to ensure successful adding
                        var msg = addResponse.msg;
                        callbackSuccess && callbackSuccess(data, callbackValue, msg);

                        this.managePlayerCount(data, 'add');

                        return;
                    }
                }
                //adding failed

                //removing the element from the mapping since adding failed
                if (uiElement) {
                    if (data.Type == 'Batsman') {
                        CricManager.UIBizMap.popData(this.batsmanUIMap, uiElement);
                    } else if (data.Type == 'AllRounder') {
                        CricManager.UIBizMap.popData(this.allRounderUIMap, uiElement);
                    } else if (data.Type == 'WicketKeeper') {
                        CricManager.UIBizMap.popData(this.keeperUIMap, uiElement);
                    } else if (data.Type == 'Bowler') {
                        CricManager.UIBizMap.popData(this.bowlerUIMap, uiElement);
                    }
                }

                var msg = addResponse.msg;
                callbackFailure && callbackFailure(data, callbackValue, msg);
                //console.log('failed adding to user team');


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
            }

        }
    };

    CricManager.Matches = {
        Biz: {
            viewHandle: 'CricManager.Matches.View',
            seriesId: '27736440632901917',
            userId: '20001782967174406',
            matchesList: [],
            init: function () {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                //service call from here
                //CricManager.HttpClient.get('/Services/CricManagerService.svc/Matches/' + this.seriesId, this.teamListXHRSuccess, this.teamListXHRFailure, this);

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

    CricManager.LeaderBoard = {
        Biz: {
            viewHandle: 'CricManager.LeaderBoard.View',
            seriesId: '',
            isMiniLeague: '',
            userId: '20001782967174406',
            leaderBoardData: {},
            leaderBoardList: [],
            init: function (seriesId, isMiniLeague) {
                this.viewHandle = CricManager.VariableResolve.resolve(this.viewHandle);
                if (this.seriesId != seriesId) {
                    this.seriesId = seriesId;
                    this.isMiniLeague = isMiniLeague;
                    this.getLeaderBoard(seriesId, isMiniLeague);
                } else {
                    this.leaderBoardXHRSuccess(this.leaderBoardData);
                }

            },
            /**
            * Gets the leaderboard list data
            */
            getLeaderBoard: function (seriesId, isMiniLeague) {
                this.viewHandle.showLoader();
                CricManager.HttpClient.get('/Services/UserService.svc/LeaderBoard?id=' + seriesId, this.leaderBoardXHRSuccess, this.leaderBoardXHRFailure, this);
            },
            /**
            * Handles the success of scoreCard retrieve call
            */
            leaderBoardXHRSuccess: function (data) {
                this.leaderBoardData = data;
                this.leaderBoardList = data.TeamScores;
                this.viewHandle.hideLoader();
                this.viewHandle.renderLeaderBoard();

            },
            /**
            * Handles the error in the call of scoreCard
            */
            leaderBoardXHRFailure: function (err) {
                this.viewHandle.hideLoader();
                this.viewHandle.showError("Unable to fetch leaderboard.");
            }
        },
        View: {
            bizHandle: 'CricManager.LeaderBoard.Biz',
            rootElement: '#scoreModal',
            loaderElement: '#leaderBoardLoader',
            leaderBoardTriggerElement: '#showLeaderBoard',
            templateName: 'leaderboard-data',
            //this property denotes that the data is fethed for the modal or not.
            //can be used to not call the service every time and only show the modal
            isReady: false,
            /**
            * this is the first function to be called to start the processing.
            
            */
            ready: function (ev) {
                var seriesId = $(ev.currentTarget).data('id');
                var isMiniLeague = $(ev.currentTarget).data('isminileague');
                this.bizHandle = CricManager.VariableResolve.resolve(this.bizHandle);

                this.bizHandle.init(seriesId, isMiniLeague);

            },
            /**
            * Render the leaderboard template.
            * This function is also not called each time the leaderboard is loaded. It is to be used only when we need to re-render 
            * the leaderboard template.
            */
            renderLeaderBoard: function () {

                CricManager.TemplateService.renderTemplate(this.leaderBoardTriggerElement, this.templateName, this.bizHandle.leaderBoardData);
                this.setScroll();
                this.removeBindings();
                this.setUpBindings();
                this.isReady = true;
            },
            showError: function (msg) {
                if (msg) {
                    window.showMessage(msg);
                }
                $(this.rootElement).modal('hide');
            },

            showLoader: function () {
                $(this.leaderBoardTriggerElement, this.rootElement).hide();
                $(this.loaderElement, this.rootElement).show();
            },
            hideLoader: function () {
                $(this.loaderElement, this.rootElement).hide();
                $(this.leaderBoardTriggerElement, this.rootElement).show();

            },
            setScroll: function () {
                $('.scrollbox3').enscroll({
                    showOnHover: true,
                    verticalTrackClass: 'track3',
                    verticalHandleClass: 'handle3'
                });
            },

            setUpBindings: function () {
                //$(this.rootElement).on('click.leaderboard.evnt', this.leaderBoardTriggerElement, $.proxy(this.showLeaderBoard, this));
                //$(this.rootElement).on('shown.leaderboard.evnt', $.proxy(this.showLeaderBoard, this));
            },
            removeBindings: function () {
                //$(this.rootElement).off();
            },

            //showLeaderBoard: function () {
            //    if (!this.isReady) {
            //        this.ready();
            //    }

            //    $(this.rootElement).modal('show');

            //},
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
                return e.uiElement.is(uiElement);
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
            mapElementArray[0].data = { Type: data.Type };
            return data;
        },
        pushData: function (mapArray, data, checkProperty) {
            //INFO: assuming mapArray is passes as reference
            for (var i = 0; i < mapArray.length; i++) {
                if (checkProperty && !mapArray[i].data[checkProperty]) {
                    mapArray[i].data = data;
                    return mapArray[i].uiElement;
                } else {
                    if (!mapArray[i].data) {
                        mapArray[i].data = data;
                        return mapArray[i].uiElement;
                    }
                }
            }
            return null;
        },
        getElement: function (mapArray, data, property) {//this function might not get used.
            var data = data;
            return $.grep(mapArray, function (e) {
                if (property) {
                    return e.data[property] == data[property];
                } else {
                    return e.data == data;
                }
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
        findObjects: function (objArray, element, property) {

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
                url: url,
                type: 'get',
                context: context,
                dataType: dataType || 'json',
                success: (onSuccess || function (data) {
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
                url: url,
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
            console.log(templateName + ' rendered');
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

    CricManager.Globals = {
        PlayerCategory: {
            Batsman: 0,
            AllRounder: 1,
            WicketKeeper: 2,
            Bowler: 3
        },
        PlayerPoolLoaded: false,
        Teams: [
            { ShortTeamName: 'AUS', FullTeamName: 'Australia' },
            { ShortTeamName: 'ENG', FullTeamName: 'England' },
            { ShortTeamName: 'IND', FullTeamName: 'India' },
            { ShortTeamName: 'NZ', FullTeamName: 'NewZealand' },
            { ShortTeamName: 'PAK', FullTeamName: 'Pakistan' },
            { ShortTeamName: 'RSA', FullTeamName: 'SouthAfrica' },
            { ShortTeamName: 'SL', FullTeamName: 'SriLanka' },
            { ShortTeamName: 'WI', FullTeamName: 'WestIndies' }]
    };

    $(document).ready(function () {
        //REQUIREMENT: 
        //try to keep order here as the views will be loaded the order of these calls.
        // e.g. teams list will be populated after the player list has been populated thus called after player list ready call.

        CricManager.Players.View.ready();
        CricManager.Teams.View.ready();

        CricManager.Schedule.View.ready();

        CricManager.UserTeam.View.ready();

        $('body').on('click', '.leaderBoardTrigger', $.proxy(CricManager.LeaderBoard.View.ready, CricManager.LeaderBoard.View));
    })

}());


//TODO: REMAINING WORK
/*
 --> create a uidata map of all the rendered elements so that actions and data
 change events can be synched together.
 --> change the setup bindings and remove bindins [USE EVENT NAMESPACING THERE]

 */
