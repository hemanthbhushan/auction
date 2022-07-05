const { inputToConfig } = require("@ethereum-waffle/compiler");
const { getSigners } = require("@nomiclabs/hardhat-ethers/dist/src/helpers");
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Auction", ()=>{
  let Auction;
  let auction;
  let owner;
  let signer1;
  let signer2;
  let Token;
  let token;
  beforeEach(async ()=>{
    [owner,signer1,signer2] = await ethers.getSigners();
    Token = await ethers.getContractFactory("ZipperToken",signer2.address);
    token= await Token.deploy();
    
    Auction = await ethers.getContractFactory("Auction");
    
    //Auction = await ethers.getContractFactory("Auction",owner.address); both are same
    auction = await Auction.deploy(token.address,720);
    auction.deployed();

    

    
  })
  describe("check constructor", ()=>{
    it("check token",async ()=>{
      const auctionAddress = await auction.Zipper();
      expect(auctionAddress).to.equal(token.address);

    });
    it("check owner",async ()=>{
      const ownerAddress = await auction.owner();
      expect(ownerAddress).to.equal(owner.address);
    })
    // it("checking timePeriod",async ()=>{
    //   const period = await auction.timePeriod();
    //   expect(period).to.be.greaterThan(auction.blockStamp());

    // })


  })
  describe("check setAuction  function",()=>{
    describe("with condition sastified",()=>{
      it("check contract balance",async ()=>{
        const signerBalance = await token.balanceOf(owner.address);
        const contractBalance = await token.balanceOf(auction.address);

        // expect(signerBalance).to.equal(1000000000000000000000000);
        expect(contractBalance).to.equal(0);

        await auction.connect(owner).setAuction(token.address,10000);
       

        const signerBalance1 = await token.balanceOf(owner.address);
        const contractBalance1 = await token.balanceOf(auction.address);
        // expect(signerBalance1).to.equal(signerBalance-10000000);
        expect(contractBalance1).to.equal(10000);
      })

        it("checking for user auction amount",async ()=>{
          await auction.connect(owner).setAuction(token.address,1000);
          const checkUserAmount = await auction.userAuctionAmount(owner.address);
          expect(checkUserAmount).to.equal(1000);

        });
        it("current Bid",async ()=>{
          await auction.connect(owner).setAuction(token.address,101);
          await auction.connect(owner).setAuction(token.address,103);
          const checkCurrentBid = await auction.currentBid();
          expect(checkCurrentBid).to.equal(103);
        })
        it("checking winner",async ()=>{
          await auction.connect(owner).setAuction(token.address,101);
          
          await auction.connect(owner).setAuction(token.address,102);
          
          await auction.connect(owner).setAuction(token.address,1022);
          const checkWinner = await  auction.winner();
          expect(checkWinner).to.equal(owner.address);
        })


    });

   

    describe("with the condition not sastified by require",()=>{
      it("revert with only zipper  ", async ()=>{
        expect(auction.setAuction(signer2.address,1001)).to.be.revertedWith("only Zipper token");
        
      })
      it("revert with minimum bid should be greater than 100  ", async ()=>{
        expect(auction.setAuction(signer1.address,100)).to.be.revertedWith("minimum bid should be greater than 100");
        
      })
      })
  });

//end of the setAuction
describe(" transfer rewards",()=>{
  it("checking transfer rewards",async ()=>{
    await auction.connect(owner).setAuction(token.address,1000);
  const balance =   await auction.contractBalance(token.address);
    expect(balance).to.equal(1000);
  })
})

 



  })







  // describe("check for retrive Auction Amount",()=>{
//   describe("if require sastified",()=>{

//   });
//   describe("if required not sastified",()=>{
//     it("if current bit is not greater",async ()=>{
//       await auction.connect(owner).setAuction(token.address,101);
//       await auction.connect(owner).setAuction(token.address,102);
      
//     })
//   })

// });



 
    // await auction.connect(owner).setAuction(token.address,101);
    // const balanceOfUser = await token.balanceOf(owner.address);
    

    // const checkCurrentBid = await auction.currentBid();
    // // expect(checkCurrentBid).to.equal(101);
    //  await  auction.connect(owner).transferRewards(token.address);

    // expect(checktransferRewards).to.equal(owner.address);
    // expect(balanceOfUser).to.equal(balanceOfUser+101);

