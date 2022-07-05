// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Auction{
    using SafeERC20 for IERC20;
    IERC20 public BidToken;
    IERC20 public RewardToken;
    
    uint public  endTimePeriod;
    uint count;
    uint noofBidders;
    address public owner;
    
    mapping(address=>uint) public  userAuctionAmountCP;
    mapping(address=>uint) public  userAuctionAmountBA;
    mapping(address => bool) checkUser;
    uint public currentBidCP;
    uint public currentBidBA;
    address public winnerCP;
    address public winnerBA;
    bool public startAuction;
    uint public totalOnOfBidders;
 


    constructor( ){
         owner = msg.sender;
         }


    modifier onlyOwner(address msgSender){
         require(msgSender == owner,"only owner can announce the winner");
         _;
    }
    modifier checkAmount(uint amount){
        require(amount>100,"minimum bid should be greater than 100 ");
        _;
    }
   

    function _startAuction(IERC20 _BidToken,IERC20 _RewardToken,uint _timePeriod) external onlyOwner(msg.sender) {
        require(startAuction == false,"wait till the time period to complete");
         startAuction  = true;
         endTimePeriod = block.timestamp + _timePeriod;
         BidToken = _BidToken;
         RewardToken = _RewardToken;


    } 
    // function setAuctionForCryptoPunk(IERC20 _BidToken,IERC20 _RewardToken,uint _timePeriod) external onlyOwner(msg.sender) {
    //     cryptoPunk  = true;
    //      endTimePeriodCryptoPunk = block.timestamp + _timePeriod;
    //      BidTokenCP = _BidToken;
    //      RewardTokenCP = _RewardToken;


    // } 
    function bidBoredApe(IERC20 token , uint amount) external  checkAmount(amount) {
        require(startAuction == true,"auction did not started by the owner yet");
        require(block.timestamp < endTimePeriod,"the auction is closed ");
        require(token == BidToken,"only BidtokenCP token");
        userAuctionAmountBA[msg.sender] += amount;

        require(userAuctionAmountBA[msg.sender]>currentBidBA,"bid should be greater than the previous bid");

        token.safeTransferFrom(msg.sender, address(this), amount);
        
        currentBidBA = userAuctionAmountBA[msg.sender];
        
        winnerBA = msg.sender;
        totalOnOfBidders = checkOnOfBidders(msg.sender);
       
        emit currentBidDetailsOfBoredApes(currentBidBA,winnerBA);
        }  



    function bidCryptoPunk(IERC20 token , uint amount) external  checkAmount(amount) {
        require(startAuction == true,"auction did not started by the owner yet");
        require(block.timestamp <  endTimePeriod,"the auction is closed ");
        require(token == BidToken,"only BidtokenCP token");

        userAuctionAmountCP[msg.sender] += amount;

        require(userAuctionAmountCP[msg.sender]>currentBidCP,"bid should be greater than the previous bid");

        token.safeTransferFrom(msg.sender, address(this), amount);
        
        currentBidCP = userAuctionAmountCP[msg.sender];
       
        
        winnerCP = msg.sender;
        checkOnOfBidders(msg.sender);
        emit currentBidDetailsOfCryptoPunks(currentBidCP,winnerCP);
        }  
    
        
    function checkOnOfBidders(address user) private returns(uint){
         if(checkUser[user]==false){
            noofBidders+=1;
            checkUser[user]= true;
        }
        return noofBidders;
        
    } 
    function retriveAutionedAmountBA(IERC20 token) public   returns(bool) {
        require(userAuctionAmountBA[msg.sender]<currentBidBA,"Your current height bidder u cant withdraw now");
        require(token == BidToken,"only Bidtoken token");
        token.safeTransfer(msg.sender,userAuctionAmountBA[msg.sender]);
        userAuctionAmountBA[msg.sender] = 0;
        
        return true;
    }  
    function retriveAutionedAmountCP(IERC20 token) public  returns(bool) {
        require(userAuctionAmountCP[msg.sender]<currentBidCP,"Your current height bidder u cant withdraw now");
        require(token == BidToken,"only Bidtoken token");
        token.safeTransfer(msg.sender,userAuctionAmountCP[msg.sender]);
        userAuctionAmountCP[msg.sender] = 0;
        
        return true;
    }
      
    function announceWinnerOfBA(IERC20 _Rewardtoken) external    onlyOwner(msg.sender)  returns(bool) {
        require(endTimePeriod < block.timestamp,"there still time for auction ");
        require(_Rewardtoken == RewardToken,"only BidtokenCP token");
        uint valueBA = currentBidBA;
        _Rewardtoken.safeTransfer(winnerBA,valueBA);
         startAuction = false;
        emit winnerInBoredApe(winnerBA,valueBA);
        return true;
        

    }
     function announceWinnerOfCP(IERC20 _Rewardtoken) external    onlyOwner(msg.sender)  returns(bool) {
        require(endTimePeriod < block.timestamp,"there still time for auction ");
        require(_Rewardtoken == RewardToken,"only BidtokenCP token");
        uint valueCP = currentBidCP;
        _Rewardtoken.safeTransfer(winnerCP,valueCP);
        startAuction = false;
        emit winnerInCryptoPunk(winnerCP,valueCP);
        return true;
        

    }
    event currentBidDetailsOfCryptoPunks(uint bidAmount, address auctionedUser);
    event currentBidDetailsOfBoredApes(uint bidAmount, address auctionedUser);
    event winnerInCryptoPunk(address finalWinner,uint bid);
    event winnerInBoredApe(address finalWinner,uint bid);
}
