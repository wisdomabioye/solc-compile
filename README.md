# solc-compile
Compile solidity code on the fly - Uses solidity version `0.8.15`

##### Use this locally or deploy to cloud

How to use this repo

- Clone this repo - it requires `nodejs 16+`
- Run 'yarn' or `npm`
- Run `yarn build`
- Run `yarn start`
- Runs on $PORT `8080` or `process.env.PORT` if it is set

##### Compile source code `.sol` through API request
- Send a post request to the app `url`
- It accept `{'Content-Type': 'application/x-www-form-urlencoded'}` body
- The `body` should contain the `source` code, `abi` and `include` fields.
- The body should be query stringed using `new URLSearchParams(body).toString()` or other alternative like `qs` library


##### Sample request

```
// sample .sol content

const source = ` 
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.15;
  contract Test { 
      uint public b; 
      function test(uint _b) public { b = _b; } 
      function bar() public view returns(uint) { return b; } 
  }`;

async function simulateRequest() {
    const body = {
        source: source, // your source code
        include: '', // leave empty to include all contracts in the output
        abi: '0', // do not include the ABI in the output
    } 

    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded'); // accept application/x-www-form-urlencoded only

    const res = await fetch('/', {
        method: 'POST',
        body: new URLSearchParams(body).toString(), // alternatively, use 'qs' library build the query string
        headers,
        mode: 'cors'
    })

    const output = await res.text();
    console.log(JSON.parse(output));
}
simulateRequest();

// Response

{
    "Test": {
        "abi": [],
        "evm": {
            "bytecode": {
                "object": "608060405234801561001057600080fd5b5061017f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806329e99f07146100465780634df7e3d014610062578063febb0f7e14610080575b600080fd5b610060600480360381019061005b91906100f2565b61009e565b005b61006a6100a8565b604051610077919061012e565b60405180910390f35b6100886100ae565b604051610095919061012e565b60405180910390f35b8060008190555050565b60005481565b60008054905090565b600080fd5b6000819050919050565b6100cf816100bc565b81146100da57600080fd5b50565b6000813590506100ec816100c6565b92915050565b600060208284031215610108576101076100b7565b5b6000610116848285016100dd565b91505092915050565b610128816100bc565b82525050565b6000602082019050610143600083018461011f565b9291505056fea2646970667358221220b440fb57a33855b1d8c56a33492244bfa85266033042b5e7b2f7cc78a6eaacc564736f6c634300080f0033"
            }
        }
    }
}

// if there is an error with compiling the source code, it will return status code 400 and list of errors list below
{
    "errors": [
        {
            "component": "general",
            "errorCode": "2314",
            "formattedMessage": "ParserError: Expected '{' but got 'uint'\n --> contract.sol:5:9:\n  |\n5 |         uint public b; \n  |         ^^^^\n\n",
            "message": "Expected '{' but got 'uint'",
            "type": "ParserError",
            "severity": "error"
        }
    ]
}


```