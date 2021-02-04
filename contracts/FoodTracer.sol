pragma solidity ^0.4.22;

contract FoodTracer {
    /* STRUCTURES */
    struct ProducerType {
        bool isProducer;
        bool isValid;
        string name;
        string description;
        uint[] producedFoods;
    }
    struct DistributerType {
        bool isDistributer;
        bool isValid;
        string name;
        string description;
        uint[] distributedFoods;
    }
    struct ConsumerType {
        bool isConsumer;
        bool isValid;
        string name;
        string description;
        uint[] consumedFoods;
    }

    // TODO : 제조일자 추가
    struct FoodType {
        bool isValid;
        string name;
        address producer;
        address[] distributers;
    }


    /* STATE VARIABLES*/
    address public administrator;
    mapping (address => ProducerType) producers;
    mapping (address => DistributerType) distributers;
    mapping (address => ConsumerType) consumers;

    uint nextId;
    mapping (uint => FoodType) foods;
    

    /* MODIFIER */
    modifier onlyAdministrator() {
        require(msg.sender == administrator,
            "this function can be called only by the administrator");
        _;
    }
    modifier onlyProducer() {
        require(producers[msg.sender].isProducer,
            "this function can be called only by a producer");
        _;
    }
    modifier onlyDistributer() {
        require(distributers[msg.sender].isDistributer,
            "this function can be called only by a distributer");
        _;
    }
    modifier onlyConsumer() {
        require(consumers[msg.sender].isConsumer,
            "this function can be called only by a consumer");
        _;
    }

    modifier onlyValidFood(uint _id) {
        require(foods[_id].isValid, "the given id is invalid");
        _;
    }


    /* EVENTS AND FUNCTIONS */
    // constructor
    constructor() public {
        administrator = msg.sender;
        nextId = 0;
    }

    // events and functions for the administrator

    // events and functions for producers
    event ProducerRegisteredEvent(address producer, string name);
    event FoodRegisteredEvent(uint id, string name, address producer);
    function registerProducer(string _name, string _description) public {
        producers[msg.sender].isProducer = true;
        producers[msg.sender].isValid = true;
        producers[msg.sender].name = _name;
        producers[msg.sender].description = _description;

        emit ProducerRegisteredEvent(msg.sender, _name);
    }
    function registerFood(string _name) public onlyProducer returns (uint) {
        uint id = nextId++;

        foods[id].isValid = true;
        foods[id].name = _name;
        foods[id].producer = msg.sender;

        producers[msg.sender].producedFoods.push(id);

        emit FoodRegisteredEvent(id, foods[id].name, msg.sender);

        return id;
    }

    // events and functions for distributers
    event DistributerRegisteredEvent(address distributer, string name);
    event DistributionRegisteredEvent(uint id, string name, address distributer);
    function registerDistributor(string _name, string _description) public {
        distributers[msg.sender].isDistributer = true;
        distributers[msg.sender].isValid = true;
        distributers[msg.sender].name = _name;
        distributers[msg.sender].description = _description;

        emit DistributerRegisteredEvent(msg.sender, _name);
    }
    function registerDistribution(uint _id) public onlyDistributer onlyValidFood(_id)
        returns (uint) {

        foods[_id].distributers.push(msg.sender);
        distributers[msg.sender].distributedFoods.push(_id);

        emit DistributionRegisteredEvent(_id, foods[_id].name, msg.sender);

        return _id;
    }

    // events and functions for consumers
    event ConsumerRegisteredEvent(address consumer, string name);
    event FoodtraceCheckedEvent(uint id, string name, address watcher);
    event FoodConsumedEvent(uint id, string name, address consumer);
    function registerConsumer(string _name, string _description) public {
        consumers[msg.sender].isConsumer = true;
        consumers[msg.sender].isValid = true;
        consumers[msg.sender].name = _name;
        consumers[msg.sender].description = _description;

        emit ConsumerRegisteredEvent(msg.sender, _name);
    }
    function consume(uint _id) public onlyConsumer onlyValidFood(_id)
        returns (uint) {

        foods[_id].isValid = false;
        consumers[msg.sender].consumedFoods.push(_id);

        emit FoodConsumedEvent(_id, foods[_id].name, msg.sender);

        return _id;
    }

    function isProducer() public view returns (bool) {
        return producers[msg.sender].isProducer;
    }
    function isDistributer() public view returns (bool) {
        return distributers[msg.sender].isDistributer;
    }
    function isConsumer() public view returns (bool) {
        return consumers[msg.sender].isConsumer;
    }

    function getProducerInfo(address _producer) public view returns (string, string) {
        require(producers[_producer].isProducer,
            "the given address is not a producer");

        return (producers[_producer].name, producers[_producer].description);
    }
    function getDistributerInfo(address _distributer) public view returns (string, string) {
        require(distributers[_distributer].isDistributer,
            "the given address is not a distributer");

        return (distributers[_distributer].name, distributers[_distributer].description);
    }
    function getConsumerInfo(address _consumer) public view returns (string, string) {
        require(consumers[_consumer].isConsumer,
            "the given address is not a consumer");

        return (consumers[_consumer].name, consumers[_consumer].description);
    }

    function getFoodInfo(uint _id) public view returns (string, address, address[]) {
        require(foods[_id].isValid, "the given id is invalid");

        return (foods[_id].name, foods[_id].producer, foods[_id].distributers);
    }
}