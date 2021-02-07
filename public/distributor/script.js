const provider = new Web3.providers.HttpProvider("http://localhost:9545");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:9545");

let FoodTracer = null;
let foodTracer = null;

const MINUTE = 60;
const HTML_ALERT_SUCCESS = "<div class=\"alert alert-success\" role=\"alert\")><strong>Well done!</strong> ";
const HTML_ALERT_INFO = "<div class=\"alert alert-info\" role=\"alert\"><strong>Heads up!</strong> ";
const HTML_ALERT_WARNING = "<div class=\"alert alert-warning\" role=\"alert\"><strong>Warning!</strong> ";
const HTML_ALERT_DANGER = "<div class=\"alert alert-danger\" role=\"alert\"><strong>Oh snap!</strong> ";

window.onload = function () {
    $.getJSON("/contract/FoodTracer.json", function (json) {
        FoodTracer = TruffleContract(json);
        FoodTracer.setProvider(provider);

        FoodTracer.deployed().then(instance =>
            foodTracer = instance
        );

        _hideMenuForNonDistributors();
        _hideMenuForDistributors();
    });
}

function _showMenuForNonDistributors() {
    $("#register-distributor").show();
}

function _showMenuForDistributors() {
    $("#register-distribution").show();
    $("#distributed-food").show();
    $("#distributor-info").show();
    _updateDistributedFood();
}

function _hideMenuForNonDistributors() {
    $("#register-distribution").hide();
    $("#distributed-food").hide();
    $("#distributor-info").hide();
}

function _hideMenuForDistributors() {
    $("#register-distributor").hide();
}

function unlockAccount() {
    const address = $("#address").val();
    const password = $("#password").val();

    web3.eth.personal.unlockAccount(address, password, 10 * MINUTE)
    .then(result => {
        if (result) {
            foodTracer.isDistributor(address, { from : address })
            .then(result => {
                if (result) {
                    let alert_success = HTML_ALERT_SUCCESS + "Your account is " +
                    "successfully unlocked.</div>"
                    let alert_info = HTML_ALERT_INFO + "You are a distributor.</div>";
                    
                    _fillProfile(address);
                    _addAlert(alert_success + alert_info);

                    $("#unlock-account").hide();
                    _hideMenuForDistributors();
                    _showMenuForDistributors();
                }
                else {
                    let alert_success = HTML_ALERT_SUCCESS + "Your account is " +
                    "successfully unlocked.</div>"
                    let alert_warning = HTML_ALERT_WARNING + "You are NOT a " +
                    "distributor. Please register your account as a distributor.</div>";
                    
                    _addAlert(alert_success + alert_warning);

                    $("#unlock-account").hide();
                    _hideMenuForNonDistributors();
                    _showMenuForNonDistributors();
                }
            });
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Your account could not be " +
            "unlocked. Please check your address and try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Your account could not be " +
        "unlocked. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function _addAlert(string) {
    $("#alert-box").html(string);
    setTimeout(() => $("#alert-box").html(""), 10000);
}

function _fillProfile(address) {
    foodTracer.getDistributorInfo(address, { from : address })
    .then(result => {
        if (result) {
            $("#info-name").html(result[0]);
            $("#info-description").html(result[1]);
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
            "updating the profile.</div>";
    
            _addAlert(alert_danger);}
    });

    foodTracer.getDistributedFood(address, { from : address })
    .then(result => {
        if (result) {
            $("#food-count").html(result.length);
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
            "updating the profile.</div>";
    
            _addAlert(alert_danger);
        }
    });
}

function registerDistributor() {
    const address = $("#address").val();
    const name = $("#distributor-name").val();
    const description = $("#distributor-description").val();

    foodTracer.registerDistributor(name, description, { from : address })
    .then(result => {
        if (result.logs[0].event == "DistributorRegisteredEvent") {
            let alert_success = HTML_ALERT_SUCCESS + "You are successfully " +
            "registered as a distributor. Welcome!</div>";
            let alert_info = HTML_ALERT_INFO + "Register your distribution as much " +
            "as you want.</div>";

            _fillProfile(address);
            _addAlert(alert_success + alert_info);
            
            _hideMenuForDistributors();
            _showMenuForDistributors();
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! You could not be " +
            "registered as a distributor. Please try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! You could not be " +
        "registered as a distributor. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function registerDistribution() {
    const address = $("#address").val();
    const foodId = $("#food-id").val();
    
    foodTracer.registerDistribution(foodId, { from : address })
    .then(result => {
        if (result && result.logs[0].event == "DistributionRegisteredEvent") {
            let alert_success = HTML_ALERT_SUCCESS + "Your distribution is " +
            "successfully registered.</div>";
            let alert_info = HTML_ALERT_INFO + "The ID of your food \'" + name +
            "\' is " + foodId + ".</div>";

            _fillProfile(address);
            _addAlert(alert_success + alert_info);

            _updateDistributedFood();
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Your distribution could " +
            "not be registered. Please try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Your distribution could not be " +
        "registered. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function _updateDistributedFood() {
    const address = $("#address").val();

    foodTracer.getDistributedFood(address, { from : address })
    .then(result => {
        if (result) {
            $("#distributed-food-tbody").html("");

            for (let i=0; i<result.length; i++) {
                let foodId = result[i].words[0];

                foodTracer.getFoodInfo(foodId, { from : address })
                .then(result => {
                    let row = "<tr>" +
                    "<th scope=\"row\">" + foodId + "</th>" +
                    "<td><a href=\"/foodtrace/index.html?foodId=" + foodId +
                    "\">" + result[1] + "</a></td>" +
                    "<td>" + (result[0]?"true":"false") + "</td></tr>";
                    $("#distributed-food-tbody").append(row);
                })
                .catch(error => {
                    let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
                    "updating the \'Food Distributed By You\'. Reason : " + error.reason +
                    "</div>";
            
                    _addAlert(alert_danger);
                });
            }
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
            "updating the \'Food Distributed By You\'.</div>";
    
            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
        "updating the \'Food Distributed By You\'. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}