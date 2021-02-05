const provider = new Web3.providers.HttpProvider("http://localhost:9545");
const web3 = new Web3(Web3.givenProvider || "ws://localhost:9545");

let FoodTracer = null;
let foodTracer = null;

const MINUTE = 60;
const HTML_ALERT_SUCCESS = "<div class=\"alert alert-success\" role=\"alert\")><strong>Well done!</strong> ";
const HTML_ALERT_INFO = "<div class=\"alert alert-info\" role=\"alert\"><strong>Heads up!</strong> ";
const HTML_ALERT_WARNING = "<div class=\"alert alert-warning\" role=\"alert\"><strong>Warning!</strong> ";
const HTML_ALERT_DANGER = "<div class=\"alert alert-danger\" role=\"alert\"><strong>Oh snap!</strong> ";
const HTML_LIST_PRODUCER = "<button type=\"button\" class=\"list-group-item\"><strong>Produced by</strong> ";
const HTML_LIST_DISTRIBUTOR = "<button type=\"button\" class=\"list-group-item\"><strong>Distributed by</strong> ";
const HTML_LIST_CONSUMED = "<button type=\"button\" class=\"list-group-item\"><strong>Consumed by</strong> ";

window.onload = function () {
    $.getJSON("/contract/FoodTracer.json", function (json) {
        FoodTracer = TruffleContract(json);
        FoodTracer.setProvider(provider);

        FoodTracer.deployed()
        .then(instance => {
            foodTracer = instance;
            showFoodTrace();
        });
    });
}

function showFoodTrace() {
    let foodId = _getDataFromURL();

    foodTracer.getFoodInfo(foodId)
    .then(result => {
        console.log(result);
        if (result) {
            let foodName = result[1];
            let producerAddress = result[2];
            let distributorAddresses = result[3];

            $("#food-name").html("Food Trace of " + foodName);

            foodTracer.getProducerInfo(producerAddress)
            .then(result => {
                let producerName = result[0];
                let row = HTML_LIST_PRODUCER + producerName + "</button>";
                $("#foodtrace-list").append(row);
            })
            .catch(error => {
                let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
                "updating the \'Food Trace\'. Reason : " + error.reason + "</div>";

                _addAlert(alert_danger);
            });

            for (let i=0; i<distributorAddresses.length; i++) {
                foodTracer.getDistributorInfo(distributorAddresses[i])
                .then(result => {
                    let distributorName = result[0];
                    let row = HTML_LIST_DISTRIBUTOR + distributorName + "</button>";
                    $("#foodtrace-list").append(row);
                })
                .catch(error => {
                    let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
                    "updating the \'Food Trace\'. Reason : " + error.reason + "</div>";

                    _addAlert(alert_danger);
                });
            }
        }
        else {}
    })
    .catch(error => {
        let alert_danger = HTML_ALERT_DANGER + "Sorry! Error occurred while " +
        "updating the \'Food Trace\'. Reason : " + error.reason + "</div>";

        _addAlert(alert_danger);
    });
}

function _getDataFromURL() {
    url = window.location.href;
    data = url.split('foodId=').pop();
    return(parseInt(data));
}

function _addAlert(string) {
    $("#alert-box").html(string);
    setTimeout(() => $("#alert-box").html(""), 10000);
}