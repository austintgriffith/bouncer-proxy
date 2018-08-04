# metatx.io - bouncer proxy
_Ethereum identity proxy contract that bounces meta transactions of etherless accounts_

This is my sandbox for experimenting with etherless meta transactions. The heart of the trick is to sign and recover transactions using Ethereum key pairs both on and off chain.

-----

## Identity

A [BouncerProxy](https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol) acts as your identity and allows multiple devices to be added as 'bouncers'. These 'bouncers' can make Ethereum transactions through your proxy without holding any Ether. That means no sending Ether to a device you might lose and not moving private keys or seed phrases around.

You deploy your own [BouncerProxy](https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol) once, fund it with Ethereum and tokens from a cold account, and keep your private keys safe.

## Pay gas for your Dapp users' transactions

To lower the barrier of entry you can proxy transactions from your users. To do this, you'll need to change your frontend slightly. Transactions will no longer go directly to the Ethereum network, but to an off-chain relay that you control.

Your users will craft and sign transactions in almost the exact same way, but then you will relay them to a [BouncerProxy](https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol). This proxy acts as a proxy identity and an authorization controller. Accounts you accept as 'bouncers' can transact through the proxy without spending any Ether.

## Incentivize 'Desktop Miners'

Meta transactions can be submitted to your [BouncerProxy](https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol) by any account. You can choose to run your own relay or incentive others to do so by [rewarding Ether](https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol#L69) or [rewarding tokens](https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol#L73) to distributed relayers.

##  Inspired by:

    @avsa - https://www.youtube.com/watch?v=qF2lhJzngto found this later: https://github.com/status-im/contracts/blob/73-economic-abstraction/contracts/identity/IdentityGasRelay.sol
    @mattgcondon - https://twitter.com/mattgcondon/status/1022287545139449856 && https://twitter.com/mattgcondon/status/1021984009428107264
    @owocki - https://twitter.com/owocki/status/1021859962882908160
    @danfinlay - https://twitter.com/danfinlay/status/1022271384938983424
    @PhABCD - https://twitter.com/PhABCD/status/1021974772786319361
    gnosis-safe
    uport-identity
