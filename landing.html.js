"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_solidity_code_1 = __importDefault(require("./test.solidity.code"));
const app_config_1 = __importDefault(require("./app.config"));
const { name, description, compilerVersion, domain } = app_config_1.default;
const html = `
    <html>
        <head>
            <title>${name} - ${description}</title>
            <style>
                div, form, input, section {
                    margin: 10px;
                }
                .code {
                    font-family: monospace;
                    font-size: 1.2em;
                    background-color: #ddd;
                    padding: 10px;
                }
            </style>
        </head>
        <body>
            <h2>${name} - ${description}</h2>
            <h4>Compiler version: ${compilerVersion}</h4>
            <section>
                <h3>Test form below</h3>
                <form method="post">
                    <div>
                        <label>Source code</label><br />
                        <textarea name="source" rows="15" cols="60">${test_solidity_code_1.default}</textarea>
                    </div>
                    <div>
                        <label>Include (optional: specify the name of the contract, interface, or library in the source code to include in the compiled output. In this example, we are using 'ERC20Simple' and 'SafeMath'. It should be case sensitive as it is in the contract source code)
                        </label> <br />
                        <input name="include" type="text" value="ERC20Simple, SafeMath" />
                    </div>
                    <div>
                        <label>Include the contract ABI in the output? 0 = no, 1 = yes</label><br />
                        <select name="abi">
                            <option value="0">0</option>
                            <option value="1">1</option>
                        </select>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </section>
            <section>
            <h3>API</h3>
            <div class="code"> 
                <pre>
                async function simulateRequest() {
                    const body = {
                        source: 'your source code', // your source code
                        include: '', // leave empty to include all contracts in the output
                        abi: '0', // do not include the ABI in the output
                    } 
                
                    const headers = new Headers();
                    headers.append('Content-Type', 'application/x-www-form-urlencoded'); // accept application/x-www-form-urlencoded only
                    
                    const res = await fetch('${domain}', {
                        method: 'POST',
                        body: new URLSearchParams(body).toString(), // alternatively, use 'qs' library build the query string
                        headers,
                        mode: 'cors'
                    })

                    const output = await res.text();
                    console.log(JSON.parse(output));
                }
                simulateRequest();
                </pre>
            </div>
            </section>
        </body>
    </html>
`;
exports.default = html;
