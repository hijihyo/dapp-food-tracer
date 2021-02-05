pragma solidity ^0.5.16;

contract FoodTracer {
    /* STRUCTURES */
    struct ProducerType {
        bool isProducer;
        bool isValid;
        string name;
        string description;
        uint[] producedFoods;
    }
    struct DistributorType {
        bool isDistributor;
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
        address[] distributors;
    }


    /* STATE VARIABLES*/
    address public administrator;
    mapping (address => ProducerType) producers;
    mapping (address => DistributorType) distributors;
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
    modifier onlyDistributor() {
        require(distributors[msg.sender].isDistributor,
            "this function can be called only by a distributor");
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
    function registerProducer(string memory _name, string memory _description) public {
        producers[msg.sender].isProducer = true;
        producers[msg.sender].isValid = true;
        producers[msg.sender].name = _name;
        producers[msg.sender].description = _description;

        emit ProducerRegisteredEvent(msg.sender, _name);
    }
    function registerFood(string memory _name) public onlyProducer returns (uint) {
        uint id = nextId++;

        foods[id].isValid = true;
        foods[id].name = _name;
        foods[id].producer = msg.sender;

        producers[msg.sender].producedFoods.push(id);

        emit FoodRegisteredEvent(id, foods[id].name, msg.sender);

        return id;
    }

    // events and functions for distributors
    event DistributorRegisteredEvent(address distributor, string name);
    event DistributionRegisteredEvent(uint id, string name, address distributor);
    function registerDistributor(string memory _name, string memory _description) public {
        distributors[msg.sender].isDistributor = true;
        distributors[msg.sender].isValid = true;
        distributors[msg.sender].name = _name;
        distributors[msg.sender].description = _description;

        emit DistributorRegisteredEvent(msg.sender, _name);
    }
    function registerDistribution(uint _id) public onlyDistributor onlyValidFood(_id)
        returns (uint) {

        foods[_id].distributors.push(msg.sender);
        distributors[msg.sender].distributedFoods.push(_id);

        emit DistributionRegisteredEvent(_id, foods[_id].name, msg.sender);

        return _id;
    }

    // events and functions for consumers
    event ConsumerRegisteredEvent(address consumer, string name);
    event FoodtraceCheckedEvent(uint id, string name, address watcher);
    event FoodConsumedEvent(uint id, string name, address consumer);
    function registerConsumer(string memory _name, string memory _description) public {
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

    // TODO : isProducer 인자 추가하기
    function isProducer(address _address) public view returns (bool) {
        return producers[_address].isProducer;
    }
    function isDistributor(address _address) public view returns (bool) {
        return distributors[_address].isDistributor;
    }
    function isConsumer(address _address) public view returns (bool) {
        return consumers[_address].isConsumer;
    }

    function getProducerInfo(address _producer) public view
        returns (string memory, string memory) {

        require(producers[_producer].isProducer,
            "the given address is not a producer");

        return (producers[_producer].name, producers[_producer].description);
    }
    function getDistributorInfo(address _distributor) public view
        returns (string memory, string memory) {

        require(distributors[_distributor].isDistributor,
            "the given address is not a distributor");

        return (distributors[_distributor].name, distributors[_distributor].description);
    }
    function getConsumerInfo(address _consumer) public view
        returns (string memory, string memory) {
        
        require(consumers[_consumer].isConsumer,
            "the given address is not a consumer");

        return (consumers[_consumer].name, consumers[_consumer].description);
    }

    function getProducedFood(address _address) public view
        returns (uint[] memory) {

        require(producers[_address].isProducer,
            "the given address is not a producer");

        return (producers[_address].producedFoods);
    }
    function getDistributedFood(address _address) public view
        returns (uint[] memory) {

        require(distributors[_address].isDistributor,
            "the given address is not a distributor");

        return (distributors[_address].distributedFoods);
    }
    function getConsumedFood(address _address) public view
        returns (uint[] memory) {

        require(consumers[_address].isConsumer,
            "the given address is not a consumer");

        return (consumers[_address].consumedFoods);
    }

    function getFoodInfo(uint _id) public view
        returns (bool, string memory, address, address[] memory) {

        return (foods[_id].isValid, foods[_id].name, foods[_id].producer, foods[_id].distributors);
    }
}