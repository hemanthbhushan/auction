// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Auction{
    using SafeERC20 for IERC20;
    IERC20 Zipper;
    uint timePeriod;
    uint count;
    uint noofUsers;
    address public owner;
    
    mapping(address=>uint)  userAuctionAmount;
    mapping(address => bool) checkUser;
    uint currentBid;
    address winner;
 


    constructor(IERC20 _token ,uint _timePeriod){
        Zipper = _token;
        
        owner = msg.sender;
        timePeriod = block.timestamp+ _timePeriod;
    }


    modifier tokenCheck(IERC20 _token){
        require(_token == Zipper,"only Zipper token");
        _;
    }
    modifier onlyOwner(address msgSender){
         require(msgSender == owner,"only owner can announce the winner");
         _;
    }
    modifier checkAmount(uint amount){
        require(amount>100,"minimum bid should be greater than 100 ");
        _;
    }
    modifier checkAuctionOpen(){
         require(block.timestamp < timePeriod,"the auction is closed ");
         _;

    }
    modifier checkAuctionClose(){
         require(timePeriod < block.timestamp,"there still time for auction ");
         _;

    }
    

    function contractBalance(IERC20 token) public view tokenCheck(token) returns(uint){
        return token.balanceOf(address(this));
    }    
    function setAuction(IERC20 token , uint amount) external tokenCheck(token) checkAmount(amount) checkAuctionOpen() {
       
        token.safeTransferFrom(msg.sender, address(this), amount);
    
        userAuctionAmount[msg.sender] = amount;
        
        currentBid = userAuctionAmount[msg.sender];
        
        winner = msg.sender;
        if(checkUser[msg.sender]==false){
            noofUsers+=1;
            checkUser[msg.sender]= true;
        }
        emit currentBidDetails(currentBid,msg.sender);
        }  
        
    function retriveAutionedAmount(IERC20 token) public  tokenCheck(token) returns(bool) {
        require(userAuctionAmount[msg.sender]<currentBid);
        token.safeTransfer(address(this),msg.sender,userAuctionAmount[msg.sender]);
        checkUser[msg.sender] = true;
        return checkUser[msg.sender];
    }

    function transferRewards(IERC20 _token) external  tokenCheck(_token) onlyOwner(msg.sender) checkAuctionClose() returns(address) {
        uint value = currentBid;
        _token.safeTransfer(winner,value);

        emit winnerAnnounced(winner,value);
        return winner;
        

    }
    event currentBidDetails(uint bidAmount, address auctionedUser);
    event winnerAnnounced(address finalWinner,uint bid);
}
