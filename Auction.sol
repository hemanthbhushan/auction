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
    uint currentBid;
    address winner;
    uint contractBalance;


    constructor(IERC20 _token ,uint _timePeriod){
        Zipper = _token;
        
        owner = msg.sender;
        timePeriod = block.timestamp+ _timePeriod;
    }
    modifier tokenCheck(IERC20 _token){
        require(_token == Zipper,"only Zipper token");
        _;
    }



 
 
    
function setAuction(IERC20 token , uint amount) external tokenCheck(token) {
    require(block.timestamp < timePeriod,"the auction is closed ");
    require(amount>100,"minimum bid should be greater than 100 ");

    token.safeTransferFrom(msg.sender, address(this), amount);
    contractBalance = token.balanceOf(address(this));
    userAuctionAmount[msg.sender] = amount;
    if(currentBid < userAuctionAmount[msg.sender]){
        require(currentBid < userAuctionAmount[msg.sender],"amount should be greater than the previous bid");
   
        currentBid = userAuctionAmount[msg.sender]; 
         winner = msg.sender;

    }else{

    }
   
    }    

function transferRewards(IERC20 _token) external view tokenCheck(_token)  returns(address) {
    
     require(timePeriod < block.timestamp,"there still time for auction ");
    
     require(msg.sender == owner,"only can announce the winner");
     uint value = currentBid;
     


     return winner;

   }
}