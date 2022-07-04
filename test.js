const http = require('http')
const test = require('ava')
const listen = require('test-listen')
const axios = require('axios')
const { app } = require('./build/index');
const landing = require('./build/landing.html');
const qs = require('qs');

const server = http.createServer(app);

test.before(async t => {
    t.context.url = await listen(server);
    console.log(t.context.url);
})

test.after.always(t => {
    server.close();
})

test('get landing page', async t => {
    const response = await axios(t.context.url);
    t.is(response.data, landing.default);
})

test('should respond 400 for no source code', async t => {
    const response = await axios.post(t.context.url).catch(err => err.response);
    t.true(response.status ===  400 && response.data === 'No source provided');
})


test('should return the list of errors for invalid source code and 400 status', async t => {
    const source = 'contract Test { function test() { } fuction bar() { } }'; // invalid source code
    const response = await axios({
        method: 'post',
        url: t.context.url,
        data: qs.stringify({source}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).catch(err => err.response);
    // console.log(response.status);
    const parse = response.data;
    t.true(Array.isArray(parse.errors) && response.status === 400, 'should be an array of errors');
})



test('should compile and contain the contract name', async t => {
    const source = ` 
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.15;
    contract Test { 
        uint public b; 
        function test(uint _b) public { b = _b; } 
        function bar() public view returns(uint) { return b; } 
    }`;
   
    const response = await axios({
        method: 'post',
        url: t.context.url,
        data: qs.stringify({source}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).catch(err => err.response);

    const parsed = response.data;
    t.true('Test' in parsed);
})

