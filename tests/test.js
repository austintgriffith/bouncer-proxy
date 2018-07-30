const clevis = require("./clevis.js")

//add account with index 1 as a bouncer
// this means they can sign meta transactions that any other account can pay to submit
clevis.addBouncer(0,1)

//mint SomeToken to account 1 from account 0 (this will be used to incentive other accounts to send the meta trasaction)
clevis.mintSomeToken(0,1,99);

//account 1 needs approve the BouncerProxy to move SomeToken around
clevis.approveBouncerProxy(1,99);


//use account 2 to send a tx to the Example contract as account 1
//clevis.fwd(2,1)
clevis.fwdAndPaySomeToken(2,1)
