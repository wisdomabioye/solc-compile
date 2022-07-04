import fs from 'fs';
import path from 'path';
import http from 'http';
import solc from 'solc';
import html from './landing.html';

export const app = async (req: any, res: any) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Max-Age", "86400");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    res.setHeader("Access-Control-Allow-Methods","POST, GET, OPTIONS");

    try {
        const { method, url } = req;
        const isPost = method === 'POST';
    
        if (isPost) {
            // extract the body
            const buffers = [];
            for await (const chunk of req) buffers.push(chunk);
           
            const data = Buffer.concat(buffers).toString();
            const body = new URLSearchParams(data);

            const source = body.get('source'),
                include = body.get('include') ?? '',
                abi = body.get('abi') ?? '';

            // console.log(source, include, abi);

            if (!source) {
                const err = new Error('No source provided') as any;
                    err.statusCode = 400;
                throw err;
            }
            const output = cleanUp(compile(source), include, abi);
            
            res.writeHead(200, {'Content-Type': 'text/plain'})
            .end(JSON.stringify(output))

        } else if (url === '/favicon.ico') {
            res.writeHead(200, {'Content-Type': 'image/svg+xml'});
            fs.createReadStream(path.resolve('power.svg')).pipe(res);
        } else {
            // render html content that describe the api
            res.writeHead(200, {'Content-Type': 'text/html'})
            .end(html);
        }
    } catch (err: any) {
        // console.log(err);
        res.writeHead(err?.statusCode ?? 500, {'Content-Type': 'text/plain'})
        .end(err.message);
    }
}

export default http.createServer(app).listen(process.env?.PORT ?? 8080, () => {
    console.log('App running on port 8080');
})


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
        const error = new Error( JSON.stringify({errors: output.errors.map(extract)}, null, 2) ) as any;
            error.statusCode = 400;
        throw error;
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