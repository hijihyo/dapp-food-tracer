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

        _hideMenuForNonConsumers();
        _hideMenuForConsumers();
    });
}

function _showMenuForNonConsumers() {
    $("#register-consumer").show();
}

function _showMenuForConsumers() {
    $("#search-food").show();
    $("#consume-food").show();
    $("#consumed-food").show();
    $("#consumer-info").show();
    _updateConsumedFood();
}

function _hideMenuForNonConsumers() {
    $("#search-food").hide();
    $("#consume-food").hide();
    $("#consumed-food").hide();
    $("#consumer-info").hide();
}

function _hideMenuForConsumers() {
    $("#register-consumer").hide();
}

function unlockAccount() {
    const address = $("#address").val();
    const password = $("#password").val();

    web3.eth.personal.unlockAccount(address, password, 10 * MINUTE)
    .then(result => {
        if (result) {
            foodTracer.isConsumer(address, { from : address })
            .then(result => {
                if (result) {
                    let alert_success = HTML_ALERT_SUCCESS + "Your account is " +
                    "successfully unlocked.</div>"
                    let alert_info = HTML_ALERT_INFO + "You are a consumer.</div>";
                    
                    _fillProfile(address);
                    _addAlert(alert_success + alert_info);

                    $("#unlock-account").hide();
                    _hideMenuForConsumers();
                    _showMenuForConsumers();
                }
                else {
                    let alert_success = HTML_ALERT_SUCCESS + "Your account is " +
                    "successfully unlocked.</div>"
                    let alert_warning = HTML_ALERT_WARNING + "You are NOT a " +
                    "consumer. Please register your account as a consumer.</div>";
                    
                    _addAlert(alert_success + alert_warning);

                    $("#unlock-account").hide();
                    _hideMenuForNonConsumers();
                    _showMenuForNonConsumers();
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
    foodTracer.getConsumerInfo(address, { from : address })
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

    foodTracer.getConsumedFood(address, { from : address })
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

function registerConsumer() {
    const address = $("#address").val();
    const name = $("#consumer-name").val();
    const description = $("#consumer-description").val();

    foodTracer.registerConsumer(name, description, { from : address })
    .then(result => {
        console.log(result);
        if (result && result.logs[0].event == "ConsumerRegisteredEvent") {
            let alert_success = HTML_ALERT_SUCCESS + "You are successfully " +
            "registered as a consumer. Welcome!</div>";
            let alert_info = HTML_ALERT_INFO + "Search and consume food as " +
            "much as you want.</div>";

            _fillProfile(address);
            _addAlert(alert_success + alert_info);
            
            _hideMenuForConsumers();
            _showMenuForConsumers();
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! You could not be " +
            "registered as a consumer. Please try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        console.log(error);
        let alert_danger = HTML_ALERT_DANGER + "Sorry! You could not be " +
        "registered as a consumer. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function searchFood() {
    const address = $("#address").val();
    const foodId = $("#food-id-in-search").val();

    $("#search-food-tbody").html("");
    
    foodTracer.getFoodInfo(foodId, { from : address })
    .then(result => {
        if (result) {
            if (result[0]) {
                let row = "<tr>" +
                "<th scope=\"row\">" + foodId + "</th>" +
                "<td><a href=\"/foodtrace/index.html?foodId=" + foodId +
                "\">" + result[1] + "</a></td>" +
                "<td>" + (result[0]?"true":"false") + "</td></tr>";
                $("#search-food-tbody").append(row);
            }
            else {
                let row = "<tr><td colspan=\"3\">None</td></tr>";
                $("#search-food-tbody").append(row);
            }
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
            "updating the \'Search Food\'.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
        "updating the \'Search Food\'. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function consumeFood() {
    const address = $("#address").val();
    const foodId = $("#food-id-in-consume").val();
    
    foodTracer.consume(foodId, { from : address })
    .then(result => {
        if (result && result.logs[0].event == "FoodConsumedEvent") {
            let alert_success = HTML_ALERT_SUCCESS + "Your consumption is " +
            "successfully registered.</div>";
            let alert_info = HTML_ALERT_INFO + "The ID of consumed food \'" +
            foodId + ".</div>";

            _fillProfile(address);
            _addAlert(alert_success + alert_info);

            _updateConsumedFood();
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Your consumption could " +
            "not be registered. Please try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Your consumption could not be " +
        "registered. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function _updateConsumedFood() {
    const address = $("#address").val();

    foodTracer.getConsumedFood(address, { from : address })
    .then(result => {
        if (result) {
            $("#consumed-food-tbody").html("");

            for (let i=0; i<result.length; i++) {
                let foodId = result[i].words[0];

                foodTracer.getFoodInfo(foodId, { from : address })
                .then(result => {
                    let row = "<tr>" +
                    "<th scope=\"row\">" + foodId + "</th>" +
                    "<td><a href=\"/foodtrace/index.html?foodId=" + foodId +
                    "\">" + result[1] + "</a></td>" +
                    "<td>" + (result[0]?"true":"false") + "</td></tr>";
                    $("#consumed-food-tbody").append(row);
                })
                .catch(error => {
                    let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
                    "updating the \'Food Consumed By You\'. Reason : " + error.reason +
                    "</div>";
            
                    _addAlert(alert_danger);
                });
            }
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
            "updating the \'Food Consumed By You\'.</div>";
    
            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
        "updating the \'Food Consumed By You\'. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}