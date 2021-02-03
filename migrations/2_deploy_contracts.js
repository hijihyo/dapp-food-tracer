var FoodTracer = artifacts.require("FoodTracer");

module.exports = function (deployer) {
    deployer.deploy(FoodTracer);
}