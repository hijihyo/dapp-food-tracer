const provider = new Web3.providers.HttpProvider("http://localhost:9545");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:9545");

let FoodTracer = null;
let foodTracer = null;

let temp = null;

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

        _hideMenuForNonProducers();
        _hideMenuForProducers();
    });
}

function _showMenuForNonProducers() {
    $("#register-producer").show();
}

function _showMenuForProducers() {
    $("#register-food").show();
    $("#produced-food").show();
    _updateProducedFood();
}

function _hideMenuForNonProducers() {
    $("#register-food").hide();
    $("#produced-food").hide();
}

function _hideMenuForProducers() {
    $("#register-producer").hide();
}

function unlockAccount() {
    const address = $("#address").val();
    const password = $("#password").val();

    web3.eth.personal.unlockAccount(address, password, 10 * MINUTE)
    .then(result => {
        if (result) {
            foodTracer.isProducer(address, { from : address })
            .then(result => {
                if (result) {
                    let alert_success = HTML_ALERT_SUCCESS + "Your account is " +
                    "successfully unlocked.</div>"
                    let alert_info = HTML_ALERT_INFO + "You are a producer.</div>";
                    
                    $("#alert-box").html(alert_success + alert_info);
                    setTimeout(() => $("#alert-box").html(""), 10000);

                    $("#unlock-account").hide();
                    _showMenuForProducers();
                }
                else {
                    let alert_success = HTML_ALERT_SUCCESS + "Your account is " +
                    "successfully unlocked.</div>"
                    let alert_warning = HTML_ALERT_WARNING + "You are NOT a producer. " +
                    "Please register your account as a producer.</div>";
                    
                    _addAlert(alert_success + alert_warning);

                    _showMenuForNonProducers();
                    $("#unlock-account").hide();
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

function registerProducer() {
    const address = $("#address").val();
    const name = $("#producer-name").val();
    const description = $("#producer-description").val();

    foodTracer.registerProducer(name, description, { from : address })
    .then(result => {
        if (result.logs[0].event == "ProducerRegisteredEvent") {
            let alert_success = HTML_ALERT_SUCCESS + "You are successfully " +
            "registered as a producer. Welcome!</div>";
            let alert_info = HTML_ALERT_INFO + "Register your crops as much " +
            "as you want.</div>";

            _addAlert(alert_success + alert_info);
            
            _hideMenuForProducers();
            _showMenuForProducers();
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! You could not be " +
            "registered as a producer. Please try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! You could not be " +
        "registered as a producer. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    })
}

function registerFood() {
    const address = $("#address").val();
    const name = $("#food-name").val();
    
    foodTracer.registerFood(name, { from : address })
    .then(result => {
        if (result && result.logs[0].event == "FoodRegisteredEvent") {
            let foodId = result.logs[0].args[0].words[0];

            let alert_success = HTML_ALERT_SUCCESS + "Food is successfully " +
            "registered.</div>";
            let alert_info = HTML_ALERT_INFO + "The ID of your food \'" + name +
            "\' is " + foodId + ".</div>";

            _addAlert(alert_success + alert_info);

            _updateProducedFood();
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Food could not be " +
            "registered. Please try again.</div>";

            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Food could not be " +
        "registered. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function _updateProducedFood() {
    const address = $("#address").val();

    foodTracer.getProducedFood(address, { from : address })
    .then(result => {
        if (result) {
            $("#produced-food-tbody").html("");

            for (let i=0; i<result.length; i++) {
                let foodId = result[i].words[0];

                foodTracer.getFoodInfo(foodId, { from : address })
                .then(result => {
                    let row = "<tr>" +
                    "<th scope=\"row\">" + foodId + "</th>" +
                    "<td>" + result[1] + "</td>" +
                    "<td>" + (result[0]?"true":"false") + "</td></tr>";
                    $("#produced-food-tbody").append(row);
                })
                .catch(error => {
                    let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
                    "updating the \'Food Produced By You\'. Reason : " + error.reason + "</div>";
            
                    _addAlert(alert_danger);
                });
            }
        }
        else {
            let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
            "updating the \'Food Produced By You\'.</div>";
    
            _addAlert(alert_danger);
        }
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
        "updating the \'Food Produced By You\'. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}