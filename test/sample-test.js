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
            describe("checking boredApe with require sastified",()=>{
                it("calling boredApe",async ()=>{
                    await bidToken.mintToken(signer1.address,10000);
                    await bidToken.mintToken(signer2.address,10000);
                    await bidToken.mintToken(signer3.address,10000);
                    await bidToken.mintToken(signer4.address,10000);
                    await bidToken.mintToken(signer5.address,10000);

                    await auction._startAuction(bidToken.address,rewardToken.address,150);

                    await auction.connect(owner).bidBoredApe(bidToken.address,101);
                    await auction.connect(signer1).bidBoredApe(bidToken.address,102);
                    await auction.connect(signer2).bidBoredApe(bidToken.address,103);
                    await auction.connect(signer3).bidBoredApe(bidToken.address,104);
                    await auction.connect(signer4).bidBoredApe(bidToken.address,105);
                    await auction.connect(signer4).bidCryptoPunk(bidToken.address,105);
                    await auction.connect(signer5).bidCryptoPunk(bidToken.address,106);
                    await auction.connect(signer1).bidBoredApe(bidToken.address,101);;

                    
                    const currentBidBA = await auction.currentBidBA();
                    const currentBidCP = await auction.currentBidCP();
                    const contractBalance = await bidToken.balanceOf(auction.address);
                    expect(contractBalance).to.equal(827);
                    expect(currentBidBA).to.equal(203);
                    expect(currentBidCP).to.equal(106);
                    expect(await auction.winnerBA()).to.equal(signer1.address);
                    expect(await auction.winnerCP()).to.equal(signer5.address);
                    expect(await auction.totalOnOfBidders()).to.equal(6);

                })


            })
            describe("checking boredApe with require not-sastified",()=>{
                
            })

        });
        







            
        })
