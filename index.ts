import solc from 'solc';
import { json, send } from 'micro';
import html from './landing.html';
const parse = require('urlencoded-body-parser');

module.exports = async (req: any, res: any) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods","POST, GET, OPTIONS");

    try {
        const { method } = req;
        const isPost = method === 'POST';
    
        if (isPost) {
            const { source, include, abi = "0" }: {source: string, include: string, abi: string} = await parse(req);
            // console.log(source, include, abi);
            if (!source) {
                const err = new Error('No source provided') as any;
                    err.statusCode = 400;
                throw err;
            }
            const output = cleanUp(compile(source), include, abi);
            res.end(JSON.stringify(output));
            
        } else {
            // render html content that describe the api
            res.end(html);
        }
    } catch (err: any) {
        // console.log(err);
        send(res, err?.statusCode ?? 400, err.message);
    }
    
}

function compile(source: string) {
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
                    '*': [ '*' ]
                }
            }
        }
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    if (output.errors) {
        const extract = ({component, errorCode, formattedMessage, message, type, severity}: any) => ({component, errorCode, formattedMessage, message, type, severity});
        throw new Error( JSON.stringify({errors: output.errors.map(extract)}, null, 2) );
    }
    return output.contracts['contract.sol'];
}

/**
 * @description cleanUp
 * @param output is the output of the compliled contract
 * @param include is the optional list of contract to preserve in the output. If not provided, all contract are preserved.
 * @returns the cleaned up contracts output object
 */
function cleanUp(output: any, include = '', abi = '0') {
    const newOutput: any = {};

    for (const contract in output) {
        if (include.length && include.indexOf(contract) < 0) continue;
        const thisContract = output[contract];
        
        // only extranous fields
        newOutput[contract] = {
            abi: abi === '0' ? [] : thisContract.abi,
            evm: {
                bytecode: {
                    object: thisContract.evm.bytecode.object,
                },
            }
        }
    }
    return newOutput;
}