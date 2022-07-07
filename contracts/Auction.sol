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
    mapping(address => bool) public alreadyUser;
 


    constructor( ){
         owner = msg.sender;
         }


    modifier onlyOwner(address msgSender){
         require(msgSender == owner,"only owner can access this function");
         _;
    }
    modifier checkAmount(uint amount,address msgSender){
        // require(amount>100,"minimum bid should be greater than 100 ");
        if(amount<=100&&alreadyUser[msgSender] == false){
            revert("amount is less than 100 ");
        }else{
            alreadyUser[msgSender] = true;
        }
        
         _;
    }
    modifier checkEndTime(){
        require(block.timestamp < endTimePeriod,"the auction is closed ");
        _;
    }
    modifier checkEndAuctionPeriod(){
        require(endTimePeriod > block.timestamp,"there still time for auction ");
        _;

    }
    modifier checkToken(IERC20 token){
         require(token == BidToken,"only BidtokenCP token");
         _;
             }
    modifier checkStartAuction(){
        require(startAuction == true,"auction did not started by the owner yet");
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
    function bidBoredApe(IERC20 token , uint amount) external checkStartAuction checkEndTime checkAmount(amount,msg.sender) checkToken(token)   {
        
        userAuctionAmountBA[msg.sender] += amount;

        require(userAuctionAmountBA[msg.sender]>currentBidBA,"bid should be greater than the previous bid");

        token.safeTransferFrom(msg.sender, address(this), amount);
        
        currentBidBA = userAuctionAmountBA[msg.sender];
        
        winnerBA = msg.sender;
        totalOnOfBidders = checkOnOfBidders(msg.sender);
       
        emit currentBidDetailsOfBoredApes(currentBidBA,winnerBA);
        }  



    function bidCryptoPunk(IERC20 token , uint amount) external checkStartAuction checkEndTime checkAmount(amount,msg.sender) checkToken(token) {
       
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
    function retriveAutionedAmountBA(IERC20 token) public checkToken(token)   returns(bool) {
        require(userAuctionAmountBA[msg.sender]<currentBidBA,"Your current highest bidder u cant withdraw now");
        token.safeTransfer(msg.sender,userAuctionAmountBA[msg.sender]);
        userAuctionAmountBA[msg.sender] = 0;
        
        return true;
    }  
    function retriveAutionedAmountCP(IERC20 token) checkToken(token) public  returns(bool) {
        require(userAuctionAmountCP[msg.sender]<currentBidCP,"Your current highest bidder u cant withdraw now");
        token.safeTransfer(msg.sender,userAuctionAmountCP[msg.sender]);
        userAuctionAmountCP[msg.sender] = 0;
        
        return true;
    }
      
    function announceWinnerOfBA() external    onlyOwner(msg.sender) checkEndAuctionPeriod()  returns(bool) {
        IERC20 _Rewardtoken = IERC20(RewardToken);
        uint valueBA = currentBidBA;
        _Rewardtoken.safeTransfer(winnerBA,valueBA);
         startAuction = false;
        emit winnerInBoredApe(winnerBA,valueBA);
        return true;
        

    }
     function announceWinnerOfCP() external    onlyOwner(msg.sender) checkEndAuctionPeriod() returns(bool) {
        IERC20 _Rewardtoken = IERC20(RewardToken);
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
