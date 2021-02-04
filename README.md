# DApp : Food Tracer
A blockchain-based food tracer
## Installation
1. Clone the project.
    ```shell
    git clone https://github.com/hi-jihyo/dapp-food-tracer.git
    ```
2. Install truffle (I used v5.1.64).
    ```shell
    npm install -g truffle
    ```
3. Install npm modules.
    ```shell
    npm install
    ````
4. Run the project.
    ```shell
    truffle develop
    ```
    In the new shell,

    ```shell
    truffle compile
    truffle migrate --reset
    ```
    and copy */build/contracts/FoodTracer.json* to */public/contract/FoodTracer.json*.
    ```shell
    npm start
    ````
5. Go to `localhost:8080`.