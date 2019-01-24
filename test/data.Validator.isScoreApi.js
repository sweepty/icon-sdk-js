import assert from 'assert';
import { IconValidator } from '../build/icon-sdk-js.node.min';

const tests = [{ 
    value: {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            {
                "name": "_owner",
                "type": "Address"
            }
        ],
        "outputs": [
            {
                "type": "int"
            }
        ],
        "readonly": "0x1"
    }, 
    is: true
}, {
    value: {
        "type": "eventlog",
        "name": "FundTransfer",
        "inputs": [
            {
                "name": "backer",
                "type": "Address",
                "indexed": "0x1"
            },
            {
                "name": "amount",
                "type": "int",
                "indexed": "0x1"
            },
            {
                "name": "is_contribution",
                "type": "bool",
                "indexed": "0x1"
            }
        ]
    },
    is: true
}];

describe('data/Validator', () => {
	describe('isScoreApi()', () => {
		tests.forEach((test) => {
			it(`${JSON.stringify(test.value)} is ${test.is}`, () => {
				assert.strictEqual(IconValidator.isScoreApi(test.value), test.is);
			});
		});
	});
});
