"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const solc_1 = __importDefault(require("solc"));
const micro_1 = require("micro");
const landing_html_1 = __importDefault(require("./landing.html"));
const parse = require('urlencoded-body-parser');
module.exports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    try {
        const { method } = req;
        const isPost = method === 'POST';
        if (isPost) {
            const { source, include, abi = "0" } = yield parse(req);
            // console.log(source, include, abi);
            if (!source) {
                const err = new Error('No source provided');
                err.statusCode = 400;
                throw err;
            }
            const output = cleanUp(compile(source), include, abi);
            res.end(JSON.stringify(output));
        }
        else {
            // render html content that describe the api
            res.end(landing_html_1.default);
        }
    }
    catch (err) {
        // console.log(err);
        (0, micro_1.send)(res, (_a = err === null || err === void 0 ? void 0 : err.statusCode) !== null && _a !== void 0 ? _a : 400, err.message);
    }
});
function compile(source) {
    const input = {
        language: 'Solidity',
        sources: {
            'contract.sol': {
                content: source
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };
    const output = JSON.parse(solc_1.default.compile(JSON.stringify(input)));
    if (output.errors) {
        const extract = ({ component, errorCode, formattedMessage, message, type, severity }) => ({ component, errorCode, formattedMessage, message, type, severity });
        throw new Error(JSON.stringify({ errors: output.errors.map(extract) }, null, 2));
    }
    return output.contracts['contract.sol'];
}
/**
 * @description cleanUp
 * @param output is the output of the compliled contract
 * @param include is the optional list of contract to preserve in the output. If not provided, all contract are preserved.
 * @returns the cleaned up contracts output object
 */
function cleanUp(output, include = '', abi = '0') {
    const newOutput = {};
    for (const contract in output) {
        if (include.length && include.indexOf(contract) < 0)
            continue;
        const thisContract = output[contract];
        // only extranous fields
        newOutput[contract] = {
            abi: abi === '0' ? [] : thisContract.abi,
            evm: {
                bytecode: {
                    object: thisContract.evm.bytecode.object,
                },
            }
        };
    }
    return newOutput;
}
