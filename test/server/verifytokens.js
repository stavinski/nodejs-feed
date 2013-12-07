/* jshint node: true, expr : true */
/* jshint -W079 */
/* global describe, it, expect, before, after */

'use strict';

var   verifyTokens = require('../../verifytokens')
    , sinon = require('sinon')
    , chai = require('chai')
    , expect = chai.expect;

describe('verify tokens', function () {
    
    describe('when verifying', function () {
        it('should reject a undeclared token', function () {
            var verified = verifyTokens.verify('123456789');
            expect(verified).to.be.false;
        });
            
        it('should accept a declared token', function () {
            var   token = verifyTokens.create('http://foo.com/feed')
                , verified = verifyTokens.verify(token);
            expect(verified).to.be.true;
        });
            
        it('should remove a verified token', function () {
            var   token = verifyTokens.create('http://foo.com/feed')
                , verified;   
            
            verifyTokens.verify(token);
            verified = verifyTokens.verify(token);
            expect(verified).to.be.false;
        });
    });    
    
    describe('when expiring', function () {
        var clock;
        
        before(function () {
            clock = sinon.useFakeTimers();
        });
        
        after(function () {
            clock.restore();
        });
            
        it('should remove an expired token', function () {
            var   token = verifyTokens.create('http://foo.com/feed')
                , verified;
            
            clock.tick(verifyTokens.TIMEOUT_MS + 1);
            verified = verifyTokens.verify(token);
            expect(verified).to.be.false;
            
        });
    });
});