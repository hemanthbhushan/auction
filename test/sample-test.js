const { inputToConfig } = require("@ethereum-waffle/compiler");
const { getSigners } = require("@nomiclabs/hardhat-ethers/dist/src/helpers");
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

describe("Auction",()=>{
    let Auction;
    let auction;
    let signer1;
    let signer2;
    let signer3;
    let signer4;
    let signer5;
    let owner;
    let RewardToken;
    let rewardToken;
    let BidToken;
    let bidToken;
    beforeEach(async ()=>{
        [owner,signer1,signer2,signer3,signer4,signer5] = await ethers.getSigners();

        BidToken = await ethers.getContractFactory("ZipperToken");
        bidToken = await BidToken.deploy();

        RewardToken = await ethers.getContractFactory("RewardToken");
        rewardToken = await RewardToken.deploy();

        Auction = await ethers.getContractFactory("Auction");
        auction = await Auction.deploy();
        await bidToken.mintToken(signer1.address,10000);
        await bidToken.mintToken(signer2.address,10000);
        await bidToken.mintToken(signer3.address,10000);
        await bidToken.mintToken(signer4.address,10000);
        await bidToken.mintToken(signer5.address,10000);

    })
    describe("checking constructor",()=>{
        it("owner check",async ()=>{
            expect(await auction.owner()).to.equal(owner.address);
        })
    })
    describe("_start Auction",()=>{
            it("set startAuction",async ()=>{
                await auction.connect(owner)._startAuction(bidToken.address,rewardToken.address,320);
                expect(await auction.BidToken()).to.equal(bidToken.address);
                expect(await auction.RewardToken()).to.equal(rewardToken.address);
                expect(await auction.owner()).to.equal(owner.address);
            });
            it("calling non owner",async ()=>{
               
                expect(auction.connect(signer1)._startAuction(bidToken.address,rewardToken.address,320)).to.be.revertedWith("only owner can access this function");
            })

        })
        describe("checking boredApe , cryptoPunks",()=>{
            describe("checking boredApe , cryptoPunks with require sastified",()=>{
                it("calling boredApe",async ()=>{
                    

                    await auction._startAuction(bidToken.address,rewardToken.address,150);

                    await auction.connect(owner).bidBoredApe(bidToken.address,101);
                    await auction.connect(signer1).bidBoredApe(bidToken.address,102);
                    await auction.connect(signer2).bidBoredApe(bidToken.address,103);
                    await auction.connect(signer3).bidBoredApe(bidToken.address,104);
                    await auction.connect(signer4).bidBoredApe(bidToken.address,105);
                    await auction.connect(signer4).bidCryptoPunk(bidToken.address,105);
                    await auction.connect(signer5).bidCryptoPunk(bidToken.address,106);
                    await auction.connect(signer1).bidBoredApe(bidToken.address,101);

                    
                    const currentBidBA = await auction.currentBidBA();
                    const currentBidCP = await auction.currentBidCP();
                    const contractBalance = await bidToken.balanceOf(auction.address);
                    expect(contractBalance).to.equal(827);
                    expect(currentBidBA).to.equal(203);
                    expect(currentBidCP).to.equal(106);
                    expect(await auction.winnerBA()).to.equal(signer1.address);
                    expect(await auction.winnerCP()).to.equal(signer5.address);
                    expect(await auction.totalOnOfBidders()).to.equal(6);
                    expect(await auction.userAuctionAmountBA(signer1.address)).to.equal(203);
                })


            })
            describe("checking boredApe , crypto punks with require not-sastified",()=>{
                it("check the bid functions with wrong require values",async ()=>{
                    
                    expect(auction.bidBoredApe(bidToken.address,101)).to.be.revertedWith("auction did not started by the owner yet");
                    expect(auction.connect(signer1)._startAuction(bidToken.address,rewardToken.address,10)).to.be.revertedWith("only owner can access this function");

                    await auction._startAuction(bidToken.address,rewardToken.address,10);

                    expect(auction.bidBoredApe(signer1.address,100)).to.be.revertedWith("minimum bid should be greater than 100");
                    expect(auction.bidBoredApe(signer1.address,101)).to.be.revertedWith("only BidtokenCP token");
                    expect(auction.bidCryptoPunk(signer1.address,100)).to.be.revertedWith("minimum bid should be greater than 100");
                    expect(auction.bidCryptoPunk(signer1.address,101)).to.be.revertedWith("only BidtokenCP token");
                     
                    const currentBidBA = await auction.currentBidBA();
                    const currentBidCP = await auction.currentBidCP();
                    const contractBalance = await bidToken.balanceOf(auction.address);

                    expect(contractBalance).to.equal(0);
                    expect(currentBidBA).to.equal(0);
                    expect(currentBidCP).to.equal(0);
                    // expect(await auction.winnerBA()).to.equal(address(0));
                    // expect(await auction.winnerCP()).to.equal(address(0));
                    expect(await auction.totalOnOfBidders()).to.equal(0);
                    })
                
            })

        });
        describe("Testing for retrive Auctioned amount of BA ,CP",()=>{
                it("check the function ",async ()=>{
               

                await auction._startAuction(bidToken.address,rewardToken.address,150);

                await auction.connect(owner).bidBoredApe(bidToken.address,101);
                await auction.connect(signer1).bidBoredApe(bidToken.address,102);
                await auction.connect(signer2).bidBoredApe(bidToken.address,103);
                await auction.connect(signer3).bidBoredApe(bidToken.address,104);
                await auction.connect(signer4).bidBoredApe(bidToken.address,105);
                await auction.connect(signer4).bidCryptoPunk(bidToken.address,105);
                await auction.connect(signer5).bidCryptoPunk(bidToken.address,106);
                await auction.connect(signer1).bidBoredApe(bidToken.address,101);
                const balanceOFContractBefore = await bidToken.balanceOf(auction.address);

                await auction.connect(signer2).retriveAutionedAmountBA(bidToken.address);
                await auction.connect(signer4).retriveAutionedAmountCP(bidToken.address);
                const balanceOFContractAfter = await bidToken.balanceOf(auction.address);

                expect(balanceOFContractAfter).to.equal(balanceOFContractBefore-208);

                expect(await auction.userAuctionAmountBA(signer2.address)).to.equal(0);
                expect(await auction.userAuctionAmountCP(signer4.address)).to.equal(0);

               

                expect(auction.connect(signer1).retriveAutionedAmountBA(bidToken.address)).to.be.revertedWith("Your current highest bidder u cant withdraw now");
                expect(auction.connect(signer5).retriveAutionedAmountCP(bidToken.address)).to.be.revertedWith("Your current highest bidder u cant withdraw now");
                expect(auction.connect(signer5).retriveAutionedAmountBA(signer1.address)).to.be.revertedWith("only BidtokenCP token");
                expect(auction.connect(signer5).retriveAutionedAmountCP(signer2.address)).to.be.revertedWith("only BidtokenCP token");
                })
        })
        describe("checking for winner announcement function",()=>{
            it("checking the winner",async ()=>{
               await rewardToken.mintToken(auction.address,100000000);
                await auction._startAuction(bidToken.address,rewardToken.address,11);

                await auction.connect(owner).bidBoredApe(bidToken.address,101);
                await auction.connect(signer1).bidBoredApe(bidToken.address,102);
                await auction.connect(signer2).bidBoredApe(bidToken.address,103);
                await auction.connect(signer3).bidBoredApe(bidToken.address,104);
                await auction.connect(signer4).bidBoredApe(bidToken.address,105);
                await auction.connect(signer4).bidCryptoPunk(bidToken.address,105);
                await auction.connect(signer5).bidCryptoPunk(bidToken.address,106);
                await auction.connect(signer1).bidBoredApe(bidToken.address,101);
                expect(auction._startAuction(bidToken.address,rewardToken.address,10)).to.be.revertedWith("wait till the time period to complete");
                 
                expect(auction.announceWinnerOfCP()).to.be.revertedWith('there still time for auction ');
                expect(auction.announceWinnerOfBA()).to.be.revertedWith('there still time for auction ');
                //  change end of timeperiod to test this
                // const contractBalanceBefore = await rewardToken.balanceOf(auction.address);
                // await auction.announceWinnerOfBA();
                // await auction.announceWinnerOfCP();
                // const contractBalanceAfter = await rewardToken.balanceOf(auction.address);
                // expect(contractBalanceAfter).to.equal(contractBalanceBefore-309);

                // expect(await auction.winnerCP()).to.equal(signer5.address);
                // expect(await auction.winnerBA()).to.equal(signer1.address);
                // expect(await auction.startAuction()).to.be.equal(false);
               
                
                

                


            })


        })








            
        })
