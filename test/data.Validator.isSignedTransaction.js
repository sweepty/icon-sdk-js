import assert from 'assert';
import { IconValidator } from '../build/icon-sdk-js.node.min';

const tests = [{
	value: {
		to: 'hxd008c05cbc0e689f04a5bb729a66b42377a9a497',
		from: 'hx902ecb51c109183ace539f247b4ea1347fbf23b5',
		value: '0xde0b6b3a7640000',
		stepLimit: '0x186a0',
		nid: '0x3',
		version: '0x3',
		timestamp: '0x57cde1eb6c258',
		signature: 'mR6OQKAF2vX9A32M/yRrV5gTC3TzpopFPR8sky4peTNThLYKBJsyFvUCDvMNgng49FDz+W+zOOHj4cCGML+HFAA=',
	},
	is: true,
}];

describe('data/Validator', () => {
	describe('isSignedTransaction()', () => {
		tests.forEach((test) => {
			it(`${JSON.stringify(test.value)} is ${test.is}`, () => {
				assert.strictEqual(IconValidator.isSignedTransaction(test.value), test.is);
			});
		});
	});
});
